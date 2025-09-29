import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserIdInRoute } from "@/lib/session";
import { z } from "zod";

const BodySchema = z.object({
  productId: z.union([z.number(), z.string()]),
  qty: z.union([z.number(), z.string()]).optional(),
});

export async function POST(req: Request) {
  try {
    const userId = await getUserIdInRoute();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const parsed = BodySchema.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }

    const productId = Number(parsed.data.productId);
    const qtyRaw = parsed.data.qty === undefined ? 1 : Number(parsed.data.qty);
    const qty = Math.max(1, Math.min(99, Number.isFinite(qtyRaw) ? qtyRaw : 1));

    if (!Number.isFinite(productId)) {
      return NextResponse.json({ error: "Invalid productId" }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, price: true, name: true, imageUrl: true },
    });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

  
    let order = await prisma.order.findFirst({
      where: { userId, status: "PENDING" },
      select: { id: true },
    });
    if (!order) {
      order = await prisma.order.create({
        data: { userId, status: "PENDING", totalAmount: "0.00" },
        select: { id: true },
      });
    }


    const existing = await prisma.orderItem.findFirst({
      where: { orderId: order.id, productId: product.id },
      select: { id: true, quantity: true },
    });

    if (existing) {
      await prisma.orderItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + qty },
      });
    } else {
      await prisma.orderItem.create({
        data: {
          orderId: order.id,
          productId: product.id,
          quantity: qty,
          priceAtPurchase: product.price,
        },
      });
    }

    const items = await prisma.orderItem.findMany({
      where: { orderId: order.id },
      select: { quantity: true, priceAtPurchase: true },
    });
    const total = items.reduce(
      (sum, it) => sum + Number(it.priceAtPurchase) * it.quantity,
      0
    );
    await prisma.order.update({
      where: { id: order.id },
      data: { totalAmount: total.toFixed(2) },
    });


    const full = await prisma.order.findUnique({
      where: { id: order.id },
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
  } catch (e) {
    console.error("POST /api/cart/add error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
