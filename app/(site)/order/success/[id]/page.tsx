import { prisma } from "@/lib/db";
import Link from "next/link";
import Image from "next/image";
import { getUserIdInPage } from "@/lib/session";

export const revalidate = 0;

function fmt(n: number) {
  return `$${n.toFixed(2)}`;
}

export default async function OrderSuccessPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const orderId = Number(id);

  if (!Number.isFinite(orderId) || orderId <= 0) {
    return (
      <div className="panel">
        Invalid order.{" "}
        <Link href="/product" className="underline">
          Back to shop
        </Link>
      </div>
    );
  }

  const userId = await getUserIdInPage();
  if (!userId) return null; 

  const order = await prisma.order.findFirst({
    where: { id: orderId, userId },
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

  if (!order) {
    return (
      <div className="panel">
        Order not found.{" "}
        <Link href="/product" className="underline">
          Back to shop
        </Link>
      </div>
    );
  }

  const subtotal = order.orderItems.reduce(
    (s, it) => s + Number(it.priceAtPurchase) * it.quantity,
    0
  );
  const fees = { protect: 1, shipping: 5, insurance: 6 };
  const grand = subtotal + fees.protect + fees.shipping + fees.insurance;

  return (
    <>
      <nav className="text-sm text-neutral-400 mb-4">
        <Link href="/" className="hover:underline">
          Home
        </Link>
        <span className="mx-2">›</span>
        <span>Order Success</span>
      </nav>

      <div className="mx-auto w-full max-w-3xl card p-6">
        <div className="mx-auto mb-4 grid place-items-center">
          <div className="h-10 w-10 rounded-full grid place-items-center bg-emerald-600/20 border border-emerald-700 text-emerald-300">
            ✓
          </div>
          <h1 className="mt-3 text-lg font-semibold text-white">
            Thanks for Your Order!
          </h1>
          <div className="mt-1 text-xs text-neutral-400">
            INV/{order.createdAt.getTime()}/TSR/{order.id}
          </div>
        </div>

        <div className="grid gap-3">
          <div className="panel">
            <div className="text-sm muted">Transaction Date</div>
            <div className="text-white">{order.createdAt.toLocaleString()}</div>
          </div>
          <div className="panel grid grid-cols-2 gap-3">
            <div>
              <div className="text-sm muted">Payment Method</div>
              <div className="text-white">Apple Pay</div>
            </div>
            <div>
              <div className="text-sm muted">Shipping Method</div>
              <div className="text-white">DevstockHub Courier</div>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <div className="h1 mb-2">Your Order</div>
          <div className="rounded-xl border border-neutral-700 bg-neutral-900">
            {order.orderItems.map((it) => (
              <div
                key={it.id}
                className="flex items-center gap-3 p-3 border-b border-neutral-800 last:border-0"
              >
                <div className="h-14 w-14 rounded bg-black/20 overflow-hidden grid place-items-center shrink-0">
                  {it.product.imageUrl ? (
                    <Image
                      src={it.product.imageUrl}
                      alt={it.product.name}
                      width={56}
                      height={56}
                      className="object-contain h-14 w-auto"
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
                <div className="text-sm text-neutral-300">x{it.quantity}</div>
                <div className="w-24 text-right font-semibold">
                  {fmt(Number(it.priceAtPurchase) * it.quantity)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 grid gap-2">
          <div className="flex items-center justify-between text-sm">
            <span className="muted">Total Product Price</span>
            <span>{fmt(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="muted">Total Product Protection</span>
            <span>{fmt(fees.protect)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="muted">Total Shipping Price</span>
            <span>{fmt(fees.shipping)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="muted">Shipping Insurance</span>
            <span>{fmt(fees.insurance)}</span>
          </div>

          <div className="panel mt-2">
            <div className="flex items-center justify-between">
              <span className="muted">Grand total</span>
              <strong>{fmt(grand)}</strong>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <Link href="/product" className="btn w-full">
            Continue Shopping
          </Link>
        </div>
      </div>
    </>
  );
}
