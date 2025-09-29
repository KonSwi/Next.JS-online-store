"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function MigrateGuestCartClient() {
  const router = useRouter();
  const doneRef = useRef(false);

  useEffect(() => {
    if (doneRef.current) return;
    doneRef.current = true;

    (async () => {
      try {
        await fetch("/api/guest-cart/migrate", { method: "POST" });
      } catch {}
      router.refresh();
    })();
  }, [router]);

  return null;
}
