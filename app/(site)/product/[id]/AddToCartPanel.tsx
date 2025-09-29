"use client";
import { useMemo, useState } from "react";
import CartIcon from "@/app/components/icons/Cart";

export default function AddToCartPanel({
  price,
  stock,
  productId,
  isLoggedIn = false,
}: {
  price: number;
  stock: number;
  productId: number;
  isLoggedIn?: boolean;
}) {
  const [qty, setQty] = useState(1);
  const canInc = qty < Math.max(1, stock);
  const canDec = qty > 1;
  const subtotal = useMemo(() => qty * price, [qty, price]);


  const [color, setColor] = useState<"white" | "dark">("white");

  async function add() {
    const url = isLoggedIn ? "/api/cart/add" : "/api/guest-cart/add";
    const payload = { productId, qty };

    let ok = false;
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      ok = res.ok;
    } catch {
      ok = false;
    }

    if (ok) {
      window.dispatchEvent(
        new CustomEvent("cart:add", { detail: { productId, qty } })
      );
    }
  }

  return (
    <div className="space-y-5">
      <div className="space-y-5">
        <div>
          <div className="mb-4 text-neutral-300 text-lg font-medium">
            Colors
          </div>
          <div className="flex gap-2" role="radiogroup" aria-label="Colors">
                 <button
              type="button"
              aria-label="White"
              role="radio"
              aria-checked={color === "white"}
              onClick={() => setColor("white")}
              className={`cursor-pointer relative h-8 w-8 rounded bg-white ring-2 ring-neutral-600 outline-none focus-visible:ring-4 focus-visible:ring-sky-500 ${
                color === "white" ? "ring-sky-600" : ""
              }`}
            >
              {color === "white" && (
                <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-neutral-900 text-sm font-semibold">
                  ✓
                </span>
              )}
            </button>

                       <button
              type="button"
              aria-label="Dark"
              role="radio"
              aria-checked={color === "dark"}
              onClick={() => setColor("dark")}
              className={` cursor-pointer relative h-8 w-8 rounded bg-neutral-800 ring-2 ring-neutral-600 outline-none focus-visible:ring-4 focus-visible:ring-sky-500 ${
                color === "dark" ? "ring-sky-600" : ""
              }`}
            >
              {color === "dark" && (
                <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-white text-sm font-semibold">
                  ✓
                </span>
              )}
            </button>
          </div>
        </div>

        <div>
          <div className="mb-4 text-neutral-300 text-lg font-medium">
            Quantity
          </div>
          <div className="flex items-center gap-3">
            <div className="flex overflow-hidden rounded border border-neutral-700">
              <button
                onClick={() => canDec && setQty(qty - 1)}
                disabled={!canDec}
                className="cursor-pointer px-3 py-2 disabled:opacity-40"
                aria-label="Decrease quantity"
              >
                –
              </button>
              <div className="min-w-10 select-none px-3 py-2 text-center">
                {qty}
              </div>
              <button
                onClick={() => canInc && setQty(qty + 1)}
                disabled={!canInc}
                className="cursor-pointer px-3 py-2 disabled:opacity-40"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
            <div className="text-sm text-neutral-400">Stock: {stock}</div>
          </div>
        </div>

        <div className="flex items-center justify-between rounded px-3 py-2">
          <span className="text-neutral-300 text-lg font-medium">Subtotal</span>
          <span className="text-[1.75rem] font-semibold">
            ${subtotal.toFixed(2)}
          </span>
        </div>

        <button
          onClick={add}
          className="cursor-pointer flex w-full border border-[#F29145] text-[#F29145] items-center justify-center gap-2 rounded-md px-4 py-2 font-medium hover:opacity-90"
        >
          Add to Cart <CartIcon className="size-6" />
        </button>
      </div>
    </div>
  );
}
