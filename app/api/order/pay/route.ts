import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserIdInRoute } from "@/lib/session";
import { normalizeAddress } from "@/lib/address";

export async function POST(req: Request) {
  // auth
  const userId = await getUserIdInRoute();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json: unknown = await req.json().catch(() => ({}));
  const body =
    json && typeof json === "object" ? (json as Record<string, unknown>) : {};

  const orderId = Number(body.orderId);
  const newAddress = normalizeAddress(body.address);

  if (!Number.isFinite(orderId)) {
    return NextResponse.json({ error: "Invalid order id" }, { status: 400 });
  }

  const order = await prisma.order.findFirst({
    where: { id: orderId, userId, status: "PENDING" },
    include: {
      orderItems: {
        include: { product: { select: { id: true, stock: true } } },
      },
    },
  });
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const subtotal = order.orderItems.reduce(
    (sum, it) => sum + Number(it.priceAtPurchase) * it.quantity,
    0
  );

  const fees = { protect: 1, shipping: 5, insurance: 6 };
  const grandTotal = subtotal + fees.protect + fees.shipping + fees.insurance;

  // aktualizacja stock
  await Promise.all(
    order.orderItems.map((it) =>
      prisma.product.update({
        where: { id: it.productId },
        data: { stock: Math.max(0, (it.product?.stock ?? 0) - it.quantity) },
      })
    )
  );

  await prisma.order.update({
    where: { id: order.id },
    data: { status: "PAID", totalAmount: grandTotal.toFixed(2) },
  });

  //  nowego główny adres  
  if (newAddress?.makeMain) {
    await prisma.user.update({
      where: { id: userId },
      data: { address: JSON.stringify(newAddress) },
    });
  }

  return NextResponse.json({ data: { orderId: order.id } }, { status: 200 });
}
