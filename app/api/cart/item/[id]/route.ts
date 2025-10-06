import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserIdInRoute } from "@/lib/session";
import { z } from "zod";

async function recomputeOrderTotal(orderId: number) {
  const items = await prisma.orderItem.findMany({
    where: { orderId },
    select: { quantity: true, priceAtPurchase: true },
  });
  const total = items.reduce(
    (sum, it) => sum + Number(it.priceAtPurchase) * it.quantity,
    0
  );
  await prisma.order.update({
    where: { id: orderId },
    data: { totalAmount: total.toFixed(2) },
  });
}

const PatchBodySchema = z
  .object({
    quantity: z.union([z.number(), z.string()]).optional(),
  })
  .partial();

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getUserIdInRoute();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const itemId = Number(id);
  if (!Number.isFinite(itemId)) {
    return NextResponse.json({ error: "Invalid item id" }, { status: 400 });
  }

  const parsed = PatchBodySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const hasQuantity = parsed.data.quantity !== undefined;
  const quantityVal =
    parsed.data.quantity === undefined
      ? undefined
      : Number(parsed.data.quantity);
  const quantity =
    quantityVal === undefined
      ? undefined
      : Math.max(1, Number.isFinite(quantityVal) ? quantityVal : 1);

  const item = await prisma.orderItem.findFirst({
    where: { id: itemId, order: { userId, status: "PENDING" } },
    select: { id: true, orderId: true },
  });
  if (!item) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  if (hasQuantity && typeof quantity === "number") {
    await prisma.orderItem.update({
      where: { id: item.id },
      data: { quantity },
    });
    await recomputeOrderTotal(item.orderId);
  }

  const full = await prisma.order.findUnique({
    where: { id: item.orderId },
    include: {
      orderItems: {
        orderBy: { id: "asc" },
        include: {
          product: {
            select: { id: true, name: true, imageUrl: true, price: true },
          },
        },
      },
    },
  });

  return NextResponse.json({ data: full }, { status: 200 });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getUserIdInRoute();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const itemId = Number(id);
  if (!Number.isFinite(itemId)) {
    return NextResponse.json({ error: "Invalid item id" }, { status: 400 });
  }

  const item = await prisma.orderItem.findFirst({
    where: { id: itemId, order: { userId, status: "PENDING" } },
    select: { id: true, orderId: true },
  });
  if (!item) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  await prisma.orderItem.delete({ where: { id: item.id } });
  await recomputeOrderTotal(item.orderId);

  const full = await prisma.order.findUnique({
    where: { id: item.orderId },
    include: {
      orderItems: {
        orderBy: { id: "asc" },
        include: {
          product: {
            select: { id: true, name: true, imageUrl: true, price: true },
          },
        },
      },
    },
  });

  return NextResponse.json({ data: full }, { status: 200 });
}
