import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getUserIdFrom } from "@/lib/session";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const userId = getUserIdFrom(session);
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  const orderId = Number(id);
  if (!Number.isFinite(orderId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const order = await prisma.order.findFirst({
    where: { id: orderId, userId },
    include: {
      orderItems: {
        orderBy: { id: "asc" },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              imageUrl: true,
              price: true,
              category: { select: { id: true, name: true } },
            },
          },
        },
      },
    },
  });

  return NextResponse.json({ data: order }, { status: 200 });
}
