"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Addr } from "./AddressForm";

declare global {
  interface Window {
    __checkout_getAddress?: () => Addr;
  }
}

export default function PayNowButton({ orderId }: { orderId: number | null }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onClick() {
    if (!orderId) return;

    setLoading(true);
    try {
      const getAddr = window.__checkout_getAddress;
      const address = typeof getAddr === "function" ? getAddr() : null;

      const res = await fetch("/api/order/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, address }),
      });

      if (!res.ok) throw new Error("Payment failed");
      const json: { data?: { orderId?: number } } = await res.json();
      const id = json?.data?.orderId;

      router.push(`/order/success/${id}`);
    } catch {
      alert("Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={onClick}
      disabled={!orderId || loading}
      className="btn w-full mt-3"
    >
      {loading ? "Processing…" : "Pay Now"}
    </button>
  );
}
