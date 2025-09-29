import Link from "next/link";
import { prisma } from "@/lib/db";
import ProductCard from "@/app/components/ProductCard";
import FilterBar from "./_FilterBar";
import SortSelect from "./_SortSelect";
import ShowSelect from "./_ShowSelect";
import { getSessionSafe, getUserIdFrom } from "@/lib/session";
import type { Prisma } from "@prisma/client";

type RawSearch = {
  categoryIds?: string;
  categoryId?: string;
  brandId?: string;
  min?: string;
  max?: string;
  sort?: "newest" | "price_asc" | "price_desc";
  page?: string;
  limit?: string;
};

export const revalidate = 0;

function parseNum(s?: string): number | undefined {
  if (s == null || s === "") return undefined;
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
}

export default async function ProductListPage({
  searchParams,
}: {
  searchParams: Promise<RawSearch>;
}) {
  const sp = await searchParams;

  const session = await getSessionSafe();
  const userId = getUserIdFrom(session);
  const isLoggedIn = !!userId;

  const limit = Math.max(1, Math.min(50, Number(sp.limit || 9)));
  const page = Math.max(1, Number(sp.page || 1));
  const skip = (page - 1) * limit;


  const rawIds = (sp.categoryIds ?? sp.categoryId ?? "").toString();
  const categoryIds = rawIds
    .split(",")
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => Number.isFinite(n) && n > 0);

  const brandId = sp.brandId ? Number(sp.brandId) : undefined;


  const min = parseNum(sp.min);
  const max = parseNum(sp.max);
  const sort = (sp.sort || "newest") as "newest" | "price_asc" | "price_desc";

  const where: Prisma.ProductWhereInput = {};
  if (categoryIds.length > 0) where.categoryId = { in: categoryIds };
  if (brandId && Number.isFinite(brandId)) where.brandId = brandId;
  if (min !== undefined || max !== undefined) {
    where.price = {};
    if (min !== undefined) where.price.gte = min;
    if (max !== undefined) where.price.lte = max;
  }

  const orderBy =
    sort === "price_asc"
      ? { price: "asc" as const }
      : sort === "price_desc"
      ? { price: "desc" as const }
      : { createdAt: "desc" as const };

  const [categories, total, productsRaw] = await Promise.all([
    prisma.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
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
      },
    }),
  ]);

  const products = productsRaw.map((p) => ({ ...p, price: Number(p.price) }));
  const pages = Math.max(1, Math.ceil(total / limit));

  return (
    <main className="container mx-auto max-w-6xl px-4 py-8">
      <div className="flex gap-6 flex-row flex-wrap">
        <FilterBar
          categories={categories}
          initial={{
            categoryIds: categoryIds.map(String),
            min: sp.min ?? "",
            max: sp.max ?? "",
            sort,
            limit: String(limit),
          }}
        />

        <section className="flex-1">
          <div className="mb-4 flex items-center gap-3 flex-row flex-wrap">
            <SortSelect />
            <ShowSelect />
          </div>

          {products.length === 0 ? (
            <div className="rounded-md border border-neutral-700 p-6 text-neutral-400">
              No products for selected filters.
            </div>
          ) : (
            <div className="flex flex-row flex-wrap gap-12">
              {products.map((p) => (
                <ProductCard key={p.id} p={p} isLoggedIn={isLoggedIn} />
              ))}
            </div>
          )}

          {/* Paginacja */}
          <div className="mt-6 flex items-center justify-between max-w-[95%]">
            <div className="flex items-center gap-2 text-sm">
              {Array.from({ length: pages })
                .slice(0, 5)
                .map((_, i) => {
                  const n = i + 1;
                  const active = n === page;
                  return (
                    <PageNumber key={n} n={n} active={active} search={sp} />
                  );
                })}
              {pages > 5 && <span className="opacity-60">…</span>}
              {pages > 5 && (
                <PageNumber n={pages} active={page === pages} search={sp} />
              )}
            </div>
            <div className="flex items-center gap-8">
              <PageLink
                disabled={page <= 1}
                page={page - 1}
                label="← Previous"
                search={sp}
              />
              <PageLink
                disabled={page >= pages}
                page={page + 1}
                label="Next →"
                search={sp}
              />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function PageNumber({
  n,
  active,
  search,
}: {
  n: number;
  active: boolean;
  search: Record<string, string | undefined>;
}) {
  if (active)
    return (
      <span className="rounded bg-amber-600 px-2 py-1 text-[1rem] text-black flex w-11 h-11 justify-center items-center">
        {n}
      </span>
    );
  const params = new URLSearchParams({
    ...Object.fromEntries(Object.entries(search).filter(([, v]) => !!v)),
    page: String(n),
  });
  return (
    <Link
      href={`/product?${params.toString()}`}
      className="rounded px-2 py-1 text-[1rem] hover:bg-neutral-800 flex w-11 h-11 justify-center items-center"
    >
      {n}
    </Link>
  );
}

function PageLink({
  disabled,
  page,
  label,
  search,
}: {
  disabled: boolean;
  page: number;
  label: string;
  search: Record<string, string | undefined>;
}) {
  const params = new URLSearchParams({
    ...Object.fromEntries(Object.entries(search).filter(([, v]) => !!v)),
    page: String(page),
  });

  const content = disabled ? (
    <span className="cursor-not-allowed opacity-40">{label}</span>
  ) : (
    <Link
      href={`/product?${params.toString()}`}
      className="inline-flex items-center text-[0.875rem] underline-offset-4 rounded-[6px] border px-5 py-2.5 hover:text-[var(--accent)]"
    >
      {label}
    </Link>
  );

  return <div>{content}</div>;
}
