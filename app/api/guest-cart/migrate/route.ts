import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserIdFrom } from "@/lib/session";

export async function POST() {
  const session = await getServerSession(authOptions);
  const uid = getUserIdFrom(session);
  if (!uid || !Number.isFinite(uid)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }


  const user = await prisma.user.findUnique({
    where: { id: Number(uid) },
    select: { id: true },
  });
  if (!user) {
    return NextResponse.json(
      { error: "User not found for this session" },
      { status: 401 }
    );
  }

  // koszyk gościa z cookie
  const jar = await cookies();
  const raw = jar.get("guest_cart")?.value ?? "{}";
  let map: Record<string, number> = {};
  try {
    map = JSON.parse(raw);
  } catch {
    map = {};
  }

  const ids = Object.keys(map)
    .map(Number)
    .filter((n) => Number.isFinite(n) && n > 0);

  if (ids.length === 0) {
    return NextResponse.json({ ok: true, migrated: 0 });
  }


  let order = await prisma.order.findFirst({
    where: { userId: user.id, status: "PENDING" },
    select: { id: true },
  });

  if (!order) {
    order = await prisma.order.create({
      data: { userId: user.id, status: "PENDING", totalAmount: "0.00" },
      select: { id: true },
    });
  }

  
  const products = await prisma.product.findMany({
    where: { id: { in: ids } },
    select: { id: true, price: true },
  });

  let migrated = 0;

  for (const p of products) {
    const qty = Math.max(1, Number(map[String(p.id)] ?? 1));

    const existing = await prisma.orderItem.findFirst({
      where: { orderId: order.id, productId: p.id },
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
          productId: p.id,
          quantity: qty,
          priceAtPurchase: p.price,
        },
      });
    }

    migrated += qty;
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

  // wyczyść cookie gościa
  jar.set("guest_cart", "{}", {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
  });

  return NextResponse.json({ ok: true, migrated });
}
