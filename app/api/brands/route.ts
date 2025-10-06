import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const brands = await prisma.brand.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, imageUrl: true },
    });
    return NextResponse.json({ data: brands });
  } catch (e) {
    console.error("GET /api/brands error:", e);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
