"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

export default function Remove({ itemId }: { itemId: number }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  const isGuest = itemId < 0;
  const productId = isGuest ? -itemId : null;

  const remove = () => {
    start(async () => {
      try {
        let res: Response;
        if (isGuest) {
          res = await fetch("/api/guest-cart/remove", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId }),
          });
        } else {
          res = await fetch(`/api/cart/item/${itemId}`, {
            method: "DELETE",
          });
        }
        if (!res.ok) throw new Error("Remove failed");
        router.refresh();
      } catch (e) {
        console.error(e);
      }
    });
  };

  return (
    <button
      onClick={remove}
      disabled={pending}
      className="ml-2 rounded px-2 py-1 text-sm text-red-300 hover:bg-red-900/30 disabled:opacity-50"
      title="Remove item"
    >
      Remove
    </button>
  );
}
