import { prisma } from "@/lib/db";
import CategoryCarousel from "../components/home/CategoryCarousel";
import ScrollRow from "../components/home/ScrollRow";
import ProductCard from "../components/ProductCard";
import CategoryGrid from "../components/home/CategoryGrid";

export default async function HomePage() {
  // kategorie
  const categories = await prisma.category.findMany({
    orderBy: { id: "asc" },
    select: { id: true, name: true, description: true, imageUrl: true },
  });

  // marki
  const brands = await prisma.brand.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, imageUrl: true },
  });

  // 6 losowych rekomendacje
  const all = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      imageUrl: true,
      price: true,
      category: { select: { id: true, name: true } },
    },
  });

  // tasowanie
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [all[i], all[j]] = [all[j], all[i]];
  }

  const picked: typeof all = [];
  const usedCats = new Set<number>();
  for (const p of all) {
    const catId = p.category?.id;
    if (!catId) continue;
    if (usedCats.has(catId)) continue;
    usedCats.add(catId);
    picked.push(p);
    if (picked.length === 6) break;
  }
  let k = 0;
  while (picked.length < 6 && k < all.length) {
    if (!picked.find((x) => x.id === all[k].id)) picked.push(all[k]);
    k++;
  }
  const recommendations = picked.map((p) => ({
    ...p,
    price: Number(p.price),
  }));

  return (
    <div className="space-y-10">
      {/* Karuzela kategorii */}
      <section className="space-y-3">
        {categories.length > 0 ? (
          <CategoryCarousel items={categories} />
        ) : (
          <div className="rounded-xl border bg-neutral-900 p-6 text-neutral-300">
            Brak kategorii do wyświetlenia.
          </div>
        )}
      </section>

      {/* Kafelki kategorii */}
      <section className="space-y-3 my-24">
        <div className="section-head">
          <h2 className="section-head__title">Category</h2>
        </div>
        <CategoryGrid items={categories} />
      </section>

      {/* Rekomendacje */}
      <section className="space-y-3 my-24">
        <div className="section-head">
          <h2 className="section-head__title">Recommendation</h2>
        </div>

        {recommendations.length > 0 ? (
          <ScrollRow>
            {recommendations.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </ScrollRow>
        ) : (
          <div className="rounded-lg border bg-[#262626] p-6 text-neutral-300">
            Brak rekomendacji.
          </div>
        )}
      </section>

      {/* Marki */}
      <section className="space-y-3 my-24">
        <div className="section-head">
          <h2 className="section-head__title">Brand</h2>
        </div>

        {brands.length > 0 ? (
          <ScrollRow>
            {brands.map((b) => (
              <div
                key={b.id}
                className="brand-row__item border border-[#616674] bg-[#262626]"
                title={b.name}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={b.imageUrl ?? ""}
                  alt={b.name}
                  className="brand-row__img"
                />
                <div className="brand-row__name">{b.name}</div>
              </div>
            ))}
          </ScrollRow>
        ) : (
          <div className="card p-6 text-neutral-300">Brak marek.</div>
        )}
      </section>
    </div>
  );
}
