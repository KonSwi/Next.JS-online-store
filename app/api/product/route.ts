import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const rawIds =
      (searchParams.get("categoryIds") ??
        searchParams.get("categoryId") ??
        "") + "";

    const categoryIds = rawIds
      .split(",")
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => Number.isFinite(n) && n > 0);

    const brandIdRaw = searchParams.get("brandId");
    const brandId = brandIdRaw !== null ? Number(brandIdRaw) : undefined;

    const minRaw = searchParams.get("min");
    const maxRaw = searchParams.get("max");
    const sort = (searchParams.get("sort") || "newest") as
      | "newest"
      | "price_asc"
      | "price_desc";

    const limit = Math.max(
      1,
      Math.min(50, Number(searchParams.get("limit") || 12))
    );
    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {};

    if (categoryIds.length > 0) {
      where.categoryId = { in: categoryIds };
    }

    if (brandId !== undefined && Number.isFinite(brandId)) {
      where.brandId = brandId;
    }

    const min = minRaw !== null ? Number(minRaw) : undefined;
    const max = maxRaw !== null ? Number(maxRaw) : undefined;
    if (
      (min !== undefined && Number.isFinite(min)) ||
      (max !== undefined && Number.isFinite(max))
    ) {
      where.price = {};
      if (min !== undefined && Number.isFinite(min)) {
        where.price.gte = min;
      }
      if (max !== undefined && Number.isFinite(max)) {
        where.price.lte = max;
      }
    }

    const orderBy:
      | { price: "asc" | "desc" }
      | { createdAt: "desc" } =
      sort === "price_asc"
        ? { price: "asc" }
        : sort === "price_desc"
        ? { price: "desc" }
        : { createdAt: "desc" };

    const [total, data] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          imageUrl: true,
          price: true,
          stock: true,
          category: { select: { id: true, name: true } },
          brand: { select: { id: true, name: true } },
        },
      }),
    ]);

    const pages = Math.max(1, Math.ceil(total / limit));
    return NextResponse.json({ data, total, page, pages }, { status: 200 });
  } catch (e) {
    console.error("GET /api/product error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
