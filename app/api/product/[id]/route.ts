import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = Number(idParam);

    if (!Number.isFinite(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const p = await prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        imageUrl: true,
        price: true,
        stock: true,
        category: { select: { id: true, name: true } },
        brand: { select: { id: true, name: true } },
        createdAt: true,
      },
    });

    if (!p) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const data = { ...p, price: Number(p.price) };
    return NextResponse.json({ data });
  } catch (e) {
    console.error("GET /api/product/[id] error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
