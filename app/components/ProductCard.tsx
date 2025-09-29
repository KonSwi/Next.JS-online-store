"use client";

import Link from "next/link";
import Image from "next/image";
import Cart from "./icons/Cart";
import { useCallback } from "react";

type Product = {
  id: number;
  name: string;
  imageUrl?: string | null;
  price: string | number;
  category?: { id: number; name: string } | null;
};

export default function ProductCard({
  p,
  isLoggedIn = false,
}: {
  p: Product;
  isLoggedIn?: boolean;
}) {
  const addToCart = useCallback(async () => {
    // gość do cookie , zalogowany do DB
    const url = isLoggedIn ? "/api/cart/add" : "/api/guest-cart/add";
    try {
      await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: p.id, qty: 1 }),
        cache: "no-store",
      });

      window.dispatchEvent(
        new CustomEvent("cart:add", { detail: { productId: p.id, qty: 1 } })
      );
    } catch (e) {
      console.error("Add to cart failed", e);
    }
  }, [isLoggedIn, p.id]);

  const displayPrice =
    typeof p.price === "string" ? p.price : p.price.toFixed(2);

  return (
    <div className="flex flex-col w-[300px] h-[386px] shrink-0 rounded-xl border border-[#616674] bg-[#262626] text-neutral-100">

      <div className="relative">
        <Link href={`/product/${p.id}`} className="block">
          <div className="mt-4 h-48 w-full overflow-hidden rounded-t-xl bg-neutral-800 flex items-center justify-center">
            {p.imageUrl ? (
              <Image
                src={p.imageUrl}
                alt={p.name}
                width={268}
                height={204}
                className="object-contain absolute"
                priority={true}
                
              />
            ) : (
              <div className="text-neutral-400 text-sm">No image</div>
            )}
          </div>
        </Link>

      
        <button
          aria-label="Dodaj do koszyka"
          onClick={addToCart}
          title="Dodaj do koszyka"
          className="cursor-pointer mt-4 ml-4 rounded-md absolute top-3 left-3 inline-flex h-8 w-8 items-center justify-center border border-neutral-600 bg-neutral-900/90 hover:bg-neutral-800 transition"
        >
          <Cart className="h-6 w-6" />
        </button>
      </div>

 
      <div className="p-3 space-y-1 flex flex-col gap-2">
        {p.category?.name && (
          <div
            className="mt-3 text-[0.875rem] bg-amber-600"
            style={{
              borderRadius: "4px",
              padding: "8px",
              width: "fit-content",
            }}
          >
            {p.category.name}
          </div>
        )}

        <Link
          href={`/product/${p.id}`}
          className="block text-[1.125rem] font-normal line-clamp-1 hover:underline"
          style={{ color: "white", fontWeight: 100 }}
        >
          {p.name}
        </Link>

        <div className="text-[1.75rem] font-semibold">${displayPrice}</div>
      </div>
    </div>
  );
}
