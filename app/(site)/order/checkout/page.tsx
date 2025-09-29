import { prisma } from "@/lib/db";
import Link from "next/link";
import Image from "next/image";
import AddressForm from "./AddressForm";
import PayNowButton from "./PayNowButton";
import { getUserIdInPage } from "@/lib/session";
import { parseAddressJSON, type Address } from "@/lib/address";
import { redirect } from "next/navigation";

export const revalidate = 0;
export const dynamic = "force-dynamic";

async function getCheckoutData(userId: number) {
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

  const defaultAddress: Address = parseAddressJSON(user?.address ?? null);

  const items =
    order?.orderItems.map((it) => ({
      id: it.id,
      qty: it.quantity,
      unit: Number(it.product.price),
      line: Number((Number(it.product.price) * it.quantity).toFixed(2)),
      product: {
        id: it.product.id,
        name: it.product.name,
        imageUrl: it.product.imageUrl,
        category: it.product.category,
      },
    })) ?? [];

  const subtotal = items.reduce((s, i) => s + i.line, 0);

  return { items, subtotal, defaultAddress, orderId: order?.id || null };
}

export default async function CheckoutPage() {
  const userId = await getUserIdInPage();

 
  if (!userId) {
    redirect(`/login?callbackUrl=${encodeURIComponent("/order/checkout")}`);
  }

  const { items, subtotal, defaultAddress, orderId } = await getCheckoutData(
    userId
  );

  return (
    <>
      {/* Breadcrumb */}
      <nav className="text-sm text-neutral-400 mb-4">
        <Link href="/" className="hover:underline">
          Home
        </Link>
        <span className="mx-2">›</span>
        <Link href="/product" className="hover:underline">
          Product
        </Link>
        <span className="mx-2">›</span>
        <span>Checkout</span>
      </nav>

      <div className="row">
        {/* LEFT */}
        <section className="col space-y-4">
          {/* Your Order */}
          <div className="card p-4">
            <div className="h1 mb-3">Your Order</div>
            {items.length === 0 ? (
              <div className="muted">Cart is empty.</div>
            ) : (
              items.map((it) => (
                <div
                  key={it.id}
                  className="flex items-center gap-3 py-2 border-b border-neutral-800 last:border-0"
                >
                  <div className="h-12 w-12 rounded bg-black/20 overflow-hidden grid place-items-center shrink-0">
                    {it.product.imageUrl ? (
                      <Image
                        src={it.product.imageUrl}
                        alt={it.product.name}
                        width={48}
                        height={48}
                        className="object-contain h-12 w-auto"
                      />
                    ) : (
                      <span className="muted text-xs">No image</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-white truncate">{it.product.name}</div>
                    {it.product.category?.name && (
                      <span className="badge mt-1">
                        {it.product.category.name}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-neutral-300">x{it.qty}</div>
                  <div className="w-24 text-right font-semibold">
                    ${it.line.toFixed(2)}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Address */}
          <AddressForm defaultAddress={defaultAddress} />

          {/* Shipping */}
          <div className="card p-4">
            <div className="h1 mb-3">Shipping</div>
            <label className="flex items-center gap-3 text-sm">
              <input
                type="radio"
                name="ship"
                defaultChecked
                className="h-4 w-4 accent-amber-500"
              />
              DevstockHub Courier
            </label>
          </div>

          {/* Payment */}
          <div className="card p-4">
            <div className="h1 mb-3">Payment Method</div>
            <label className="flex items-center gap-3 text-sm">
              <input
                type="radio"
                name="pay"
                defaultChecked
                className="h-4 w-4 accent-amber-500"
              />
              Apple Pay
            </label>
          </div>
        </section>

        {/* RIGHT: summary */}
        <aside className="card p-4" style={{ flex: "0 0 22rem" }}>
          <div className="h1 mb-3">Total Product</div>
          <div className="flex items-center justify-between text-sm">
            <span className="muted">Total Product Price (All Items)</span>
            <strong>${subtotal.toFixed(2)}</strong>
          </div>
          <div className="flex items-center justify-between text-sm mt-2">
            <span className="muted">Total Product Protection</span>
            <span>$1</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-2">
            <span className="muted">Total Shipping Price</span>
            <span>$5</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-2">
            <span className="muted">Shipping Insurance</span>
            <span>$6</span>
          </div>

          <div className="panel mt-3">
            <div className="flex items-center justify-between">
              <span className="muted">Grand total</span>
              <strong>${(subtotal + 1 + 5 + 6).toFixed(2)}</strong>
            </div>
          </div>

          <PayNowButton orderId={orderId} />
        </aside>
      </div>
    </>
  );
}
