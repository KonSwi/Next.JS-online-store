import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getUserIdFrom } from "@/lib/session";

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = getUserIdFrom(session);
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const order = await prisma.order.findFirst({
    where: { userId, status: "PENDING" },
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

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { address: true },
  });

  return NextResponse.json(
    { data: { order, address: user?.address || null } },
    { status: 200 }
  );
}
