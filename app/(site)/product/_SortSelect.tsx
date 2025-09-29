"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function SortSelect() {
  const router = useRouter();
  const sp = useSearchParams();

  function setSort(v: string) {
    const params = new URLSearchParams(sp?.toString());
    params.set("sort", v);
    params.set("page", "1");
    router.push(`/product?${params.toString()}`);
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
      <span className="text-[1.25rem] font-semibold" >
        Sort by
      </span>
      <select
        defaultValue={sp?.get("sort") || "newest"}
        onChange={(e) => setSort(e.target.value)}
        className="sortInput"
        style={{ width: "12rem", padding: "0.625rem 1rem" }}
      >
        <option value="newest">Latest</option>
        <option value="price_asc">Price: Low</option>
        <option value="price_desc">Price: High</option>
      </select>
    </div>
  );
}
