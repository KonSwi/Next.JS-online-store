import { prisma } from "@/lib/db";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import CartListClient from "./CartListClient";
import { cookies } from "next/headers";
import MigrateGuestCartClient from "./MigrateGuestCartClient";
import { getUserIdFrom } from "@/lib/session";

export const revalidate = 0;

async function readGuestCookieCart() {
  const jar = await cookies();
  const raw = jar.get("guest_cart")?.value ?? "{}";
  let map: Record<string, number> = {};
  try {
    map = JSON.parse(raw);
  } catch {
    map = {};
  }

  const ids = Object.keys(map)
    .map(Number)
    .filter((n) => Number.isFinite(n) && n > 0);
  if (ids.length === 0) return { items: [], subtotal: 0 };

  const products = await prisma.product.findMany({
    where: { id: { in: ids } },
    select: {
      id: true,
      name: true,
      imageUrl: true,
      price: true,
      category: { select: { id: true, name: true } },
    },
  });

  const items = products.map((p) => {
    const qty = Math.max(1, Number(map[String(p.id)] ?? 1));
    const unit = Number(p.price);
    return {
      id: p.id * -1,
      qty,
      unit,
      line: Number((unit * qty).toFixed(2)),
      note: null,
      product: {
        id: p.id,
        name: p.name,
        imageUrl: p.imageUrl,
        category: p.category,
      },
    };
  });

  const subtotal = items.reduce((s, i) => s + i.line, 0);
  return { items, subtotal };
}

async function readUserDbCart(userId: number) {
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

  const items =
    order?.orderItems.map((it) => {
      const unit = Number(it.priceAtPurchase || it.product.price);
      const qty = it.quantity;
      return {
        id: it.id,
        qty,
        unit,
        line: Number((unit * qty).toFixed(2)),
        product: {
          id: it.product.id,
          name: it.product.name,
          imageUrl: it.product.imageUrl,
          category: it.product.category,
        },
      };
    }) ?? [];

  const subtotal = items.reduce((s, i) => s + i.line, 0);
  return { items, subtotal };
}

export default async function CartPage() {
  const session = await getServerSession(authOptions);
  const userId = getUserIdFrom(session);

  if (!userId) {
    const cart = await readGuestCookieCart();
    return (
      <>
        <nav className="text-sm text-neutral-400 mb-4">
          <Link href="/" className="hover:underline">
            Home
          </Link>
          <span className="mx-2">›</span>
          <span>Cart</span>
        </nav>

        <div className="row">
          <section className="col">
            {cart.items.length === 0 ? (
              <div className="card p-4">
                <div className="muted">Your cart is empty.</div>
                <Link href="/product" className="btn btn-outline mt-3">
                  Go shopping
                </Link>
              </div>
            ) : (
              <CartListClient initialItems={cart.items} />
            )}
          </section>

          <aside className="card p-4" style={{ flex: "0 0 22rem" }}>
            <div className="mb-3">
              <div className="font-semibold text-white">Total Product</div>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="muted">Total Product Price (All Items)</span>
                <strong>${cart.subtotal.toFixed(2)}</strong>
              </div>
            </div>
            <div className="panel mt-2">
              <div className="flex items-center justify-between">
                <span className="muted">Subtotal</span>
                <strong>${cart.subtotal.toFixed(2)}</strong>
              </div>
            </div>
            <Link href="/order/checkout" className="btn w-full mt-4">
              Checkout
            </Link>
          </aside>
        </div>
      </>
    );
  }

  const dbCart = await readUserDbCart(userId);
  const cookieCart = await readGuestCookieCart();
  const showCookieFallback =
    dbCart.items.length === 0 && cookieCart.items.length > 0;

  const cart = showCookieFallback ? cookieCart : dbCart;

  return (
    <>
      {showCookieFallback ? <MigrateGuestCartClient /> : null}

      <nav className="text-sm text-neutral-400 mb-4">
        <Link href="/" className="hover:underline">
          Home
        </Link>
        <span className="mx-2">›</span>
        <span>Cart</span>
      </nav>

      <div className="row">
        <section className="col">
          {cart.items.length === 0 ? (
            <div className="card p-4">
              <div className="muted">Your cart is empty.</div>
              <Link href="/product" className="btn btn-outline mt-3">
                Go shopping
              </Link>
            </div>
          ) : (
            <CartListClient initialItems={cart.items} />
          )}
        </section>

        <aside className="card p-4" style={{ flex: "0 0 22rem" }}>
          <div className="mb-3">
            <div className="font-semibold text-white">Total Product</div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="muted">Total Product Price (All Items)</span>
              <strong>${cart.subtotal.toFixed(2)}</strong>
            </div>
          </div>
          <div className="panel mt-2">
            <div className="flex items-center justify-between">
              <span className="muted">Subtotal</span>
              <strong>${cart.subtotal.toFixed(2)}</strong>
            </div>
          </div>
          <Link href="/order/checkout" className="btn w-full mt-4">
            Checkout
          </Link>
        </aside>
      </div>
    </>
  );
}
