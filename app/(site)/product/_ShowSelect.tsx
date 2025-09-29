"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function ShowSelect() {
  const router = useRouter();
  const sp = useSearchParams();

  function setLimit(v: string) {
    const params = new URLSearchParams(sp?.toString());
    params.set("limit", v);
    params.set("page", "1");
    router.push(`/product?${params.toString()}`);
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
      <span className="text-[1.25rem] font-semibold">
        Show
      </span>
      <select
        defaultValue={sp?.get("limit") || "9"}
        onChange={(e) => setLimit(e.target.value)}
        className="sortInput"
        style={{ width: "6rem", padding: "0.625rem 1rem" }}
      >
        {["9", "12", "15", "18"].map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </select>
    </div>
  );
}
