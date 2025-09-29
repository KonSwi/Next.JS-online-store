import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserIdInRoute } from "@/lib/session";

export async function GET() {
  const userId = await getUserIdInRoute();

  if (!userId) {
    return NextResponse.json({ data: null }, { status: 200 });
  }

  const order = await prisma.order.findFirst({
    where: { userId, status: "PENDING" },
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

  return NextResponse.json({ data: order }, { status: 200 });
}
