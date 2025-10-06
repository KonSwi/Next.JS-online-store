import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const all = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        imageUrl: true,
        price: true,
        category: { select: { id: true, name: true } },
      },
    });

    // losowa rekomendacja
    for (let i = all.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [all[i], all[j]] = [all[j], all[i]];
    }

    const six = all.slice(0, 6).map((p) => ({
      ...p,
      price: p.price.toString(),
    }));

    return NextResponse.json({ data: six });
  } catch (e) {
    console.error("GET /api/product/recommended error:", e);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
