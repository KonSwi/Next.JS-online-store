import { prisma } from "@/lib/db";
import Link from "next/link";
import AddToCartPanel from "./AddToCartPanel";

import Image from "next/image";

type Params = { id: string };

function formatUsd(n: number) {
  return `$${n.toFixed(2)}`;
}
function etaWithin7Days() {
  const now = new Date();
  const d = new Date(now);
  d.setDate(now.getDate() + Math.floor(Math.random() * 7) + 1);
  return d.toLocaleDateString("en-US", { day: "2-digit", month: "short" });
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id: idStr } = await params;
  const id = Number(idStr);
  if (!Number.isFinite(id)) {
    return (
      <div className="container" style={{}}>
        Invalid product id.
      </div>
    );
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
    },
  });

  if (!p) {
    return (
      <div className="container" style={{}}>
        Product not found.
      </div>
    );
  }

  const eta = etaWithin7Days();
  const price = Number(p.price);
  const shipping = {
    src: "/icons/delivery.png",
    alt: "Shipping Available",
  };
  return (
    <main className="" style={{}}>
      <nav
        className="muted"
        style={{ fontSize: "0.875rem", marginBottom: "3rem" }}
      >
        <Link href="/" className="hover:underline">
          Home
        </Link>
        <span style={{ marginInline: "0.5rem" }}>›</span>
        <Link href="/product" className="hover:underline">
          Product
        </Link>
        <span style={{ marginInline: "0.5rem" }}>›</span>
        <span style={{ color: "var(--foreground)" }}>{p.name}</span>
      </nav>

      <div className="product-detail">
        <section className="media">
          <div className="media-box">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.imageUrl ?? ""} alt={p.name} />
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-evenly",
              gap: "0.75rem",
              marginTop: "1rem",
            }}
          >
            {[0, 1, 2].map((i) => (
              <div key={i} className="thumb">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="w-full h-full object-cover"
                  src={p.imageUrl ?? ""}
                  alt={p.name}
                />
              </div>
            ))}
          </div>
        </section>

        <section className="info" style={{ display: "grid", gap: "1rem" }}>
          <h1 className="h1" style={{ fontSize: "1.75rem" }}>
            {p.name}
          </h1>
          <span className="mt-3 text-[0.875rem] bg-amber-600 rounded p-2 w-fit">
            {p.category?.name || "Category"}
          </span>
          <div className="text-[1.75rem] font-semibold">{formatUsd(price)}</div>

          <Description text={p.description ?? ""} />
          <div className="muted text-[1.125rem] mt-8">Shipping Available</div>
          <div className="panel w-[312px] h-[88px] bg-transparent ">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                fontSize: "1rem",
              }}
            >
              <div className="relative -top-3">
                <Image
                  src={shipping.src}
                  alt={shipping.alt}
                  width={15.69}
                  height={17.36}
                  priority={false}
                />
              </div>
              <div className="flex flex-col gap-1">
                <span>DevstockHub Courier</span>
                <span>Estimated arrival {eta}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="actions">
          <div
            className="addToCard"
            style={{ padding: "1rem", position: "sticky", top: "6rem" }}
          >
            <AddToCartPanel
              price={price}
              stock={p.stock || 0}
              productId={p.id}
            />
          </div>
        </section>
      </div>
    </main>
  );
}

function Description({ text }: { text: string }) {
  const full = (text || "").trim();
  const short20 = full.length > 20 ? full.slice(0, 20) + "…" : full;
  const needsMore = full.length > 20;
  const toggleId = "desc-toggle";

  return (
    <div>
      <input id={toggleId} type="checkbox" className="peer hidden" />

      <p className="peer-checked:hidden">{short20 || "No description."}</p>

      <p className="hidden peer-checked:block">{full || "No description."}</p>

      {needsMore && (
        <>
          <label
            htmlFor={toggleId}
            className="mt-2 inline-flex items-center text-[1rem] text-[var(--accent)] cursor-pointer peer-checked:hidden"
          >
            View more
          </label>

          <label
            htmlFor={toggleId}
            className="mt-2 hidden peer-checked:inline-flex items-center text-[1rem] text-[var(--accent)] cursor-pointer"
          >
            Show less
          </label>
        </>
      )}
    </div>
  );
}
