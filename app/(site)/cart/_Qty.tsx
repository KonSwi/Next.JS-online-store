"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

export default function Qty({
  itemId,
  qty,
}: {
  itemId: number; 
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  const isGuest = itemId < 0;
  const productId = isGuest ? -itemId : null;

  const set = (nextQty: number) => {
    nextQty = Math.max(1, nextQty);
    start(async () => {
      try {
        let res: Response;
        if (isGuest) {
          res = await fetch("/api/guest-cart/set", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId, quantity: nextQty }),
          });
        } else {
          res = await fetch(`/api/cart/item/${itemId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ quantity: nextQty }),
          });
        }
        if (!res.ok) throw new Error("Qty update failed");
        router.refresh();
      } catch (e) {
        console.error(e);
      }
    });
  };

  const dec = () => set(qty - 1);
  const inc = () => set(qty + 1);

  return (
    <div className="flex overflow-hidden rounded border border-neutral-700">
      <button
        onClick={dec}
        disabled={pending || qty <= 1}
        className="px-2 py-1 disabled:opacity-40"
        aria-label="Decrease quantity"
      >
        –
      </button>
      <div className="min-w-10 select-none px-3 py-1 text-center">{qty}</div>
      <button
        onClick={inc}
        disabled={pending}
        className="px-2 py-1 disabled:opacity-40"
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}
