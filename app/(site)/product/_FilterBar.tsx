"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Category = { id: number; name: string };

export default function FilterBar({
  categories,
  initial,
}: {
  categories: Category[];
  initial: {
    categoryIds: string[];
    min: string;
    max: string;
    sort: "newest" | "price_asc" | "price_desc";
    limit: string;
  };
}) {
  const router = useRouter();
  const sp = useSearchParams();

  const [min, setMin] = useState(initial.min ?? "");
  const [max, setMax] = useState(initial.max ?? "");
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const [selected, setSelected] = useState<Set<number>>(
    () => new Set((initial.categoryIds ?? []).map((s) => Number(s)))
  );


  const [catOpen, setCatOpen] = useState(true);
  const [priceOpen, setPriceOpen] = useState(true);


  const [currency, setCurrency] = useState<"USD" | "PLN">("USD");
  const toggleCurrency = () =>
    setCurrency((c) => (c === "USD" ? "PLN" : "USD"));

  const buildQS = useCallback(
    (patch: Record<string, string | undefined>) => {
      const next = new URLSearchParams(sp?.toString());
      Object.entries(patch).forEach(([k, v]) => {
        if (v === undefined || v === "") next.delete(k);
        else next.set(k, v);
      });
      next.set("page", "1");
      return next.toString();
    },
    [sp]
  );

  const equalWithoutPage = useCallback((a: string, b: string) => {
    const A = new URLSearchParams(a);
    A.delete("page");
    const B = new URLSearchParams(b);
    B.delete("page");
    return A.toString() === B.toString();
  }, []);

  const toggleCategory = (id: number) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);

    const list = Array.from(next);
    const qs = buildQS({
      categoryIds: list.length ? list.join(",") : undefined,
    });

    const current = sp?.toString() ?? "";
    if (!equalWithoutPage(qs, current)) router.push(`/product?${qs}`);
  };

  const clearCategories = () => {
    setSelected(new Set());
    const qs = buildQS({ categoryIds: undefined });
    const current = sp?.toString() ?? "";
    if (!equalWithoutPage(qs, current)) router.push(`/product?${qs}`);
  };

  const didMount = useRef(false);

  useEffect(() => {
    if (!didMount.current) {
      didMount.current = true;
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const qs = buildQS({ min: min || undefined, max: max || undefined });
      const current = sp?.toString() ?? "";
      if (!equalWithoutPage(qs, current)) router.push(`/product?${qs}`);
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [min, max, buildQS, equalWithoutPage, router, sp]);

  const items = useMemo(
    () => categories.map((c) => ({ ...c, checked: selected.has(c.id) })),
    [categories, selected]
  );

  const sanitizeDigits = (v: string) => v.replace(/[^0-9]/g, "");

  return (
    <aside
      className=""
      style={{ width: "16rem", padding: "1rem", flexShrink: 0 }}
    >
      {/* Kategorie */}
      <div style={{ marginBottom: "1.5rem" }}>
        <div
          onClick={() => setCatOpen((v) => !v)}
          role="button"
          aria-expanded={catOpen}
          style={{
            marginBottom: "0.5rem",
            color: "var(--foreground)",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            cursor: "pointer",
            userSelect: "none",
          }}
        >
          <span className="text-[1.25rem]">Category</span>
          <span
            aria-hidden
            style={{
              display: "inline-block",
              width: "10px",
              height: "10px",
              borderRight: "1.5px solid currentColor",
              borderBottom: "1.5px solid currentColor",
              transform: catOpen ? "rotate(45deg)" : "rotate(-45deg)",
              transition: "transform .2s ease",
            }}
          />
        </div>

        {catOpen && (
          <ul style={{ display: "grid", gap: "0.5rem" }}>
            <li
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <input
                id="cat-all"
                type="checkbox"
                className="h-4 w-4 cursor-pointer appearance-none rounded-[6px]
    border border-[#616674] bg-[#222327]
    checked:border-[var(--accent)] checked:bg-[var(--accent)]
    checked:bg-no-repeat checked:bg-center checked:bg-[length:12px_12px]
    checked:bg-[url('data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%2020%2020%22%20fill=%22none%22%20stroke=%22white%22%20stroke-width=%223%22%20stroke-linecap=%22round%22%20stroke-linejoin=%22round%22%3E%3Cpath%20d=%22M5%2010l3%203%207-7%22/%3E%3C/svg%3E')]
    outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-0
  "
                style={{ accentColor: "var(--accent)" }}
                checked={selected.size === 0}
                onChange={clearCategories}
              />
              <label htmlFor="cat-all" className="text-[1rem] font-semibold">
                All
              </label>
            </li>
            {items.map((c) => (
              <li
                key={c.id}
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <input
                  id={`cat-${c.id}`}
                  type="checkbox"
                  className="
    h-4 w-4 cursor-pointer
    appearance-none rounded-[6px]
    border border-[#616674] bg-[#222327]
    checked:border-[var(--accent)] checked:bg-[var(--accent)]
    checked:bg-no-repeat checked:bg-center checked:bg-[length:12px_12px]
    checked:bg-[url('data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%2020%2020%22%20fill=%22none%22%20stroke=%22white%22%20stroke-width=%223%22%20stroke-linecap=%22round%22%20stroke-linejoin=%22round%22%3E%3Cpath%20d=%22M5%2010l3%203%207-7%22/%3E%3C/svg%3E')]
    outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-0
  "
                  style={{ accentColor: "var(--accent)" }}
                  checked={c.checked}
                  onChange={() => toggleCategory(c.id)}
                />
                <label
                  htmlFor={`cat-${c.id}`}
                  className="text-[1rem] font-semibold"
                >
                  {c.name}
                </label>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div
        onClick={() => setPriceOpen((v) => !v)}
        role="button"
        aria-expanded={priceOpen}
        style={{
          marginBottom: "0.5rem",
          color: "var(--foreground)",
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
          userSelect: "none",
        }}
      >
        <span className="text-[1.25rem]">Price</span>
        <span
          aria-hidden
          style={{
            display: "inline-block",
            width: "10px",
            height: "10px",
            borderRight: "1.5px solid currentColor",
            borderBottom: "1.5px solid currentColor",
            transform: priceOpen ? "rotate(45deg)" : "rotate(-45deg)",
            transition: "transform .2s ease",
          }}
        />
      </div>

      {priceOpen && (
        <div style={{ display: "grid", gap: "0.75rem" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <input
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder={currency === "USD" ? "$ Min" : "zł Min"}
              value={min}
              onChange={(e) => setMin(sanitizeDigits(e.target.value))}
              className="input"
            />
            <span
              className="USD"
              onClick={toggleCurrency}
              style={{ cursor: "pointer" }}
              title="USD/PLN"
            >
              {currency}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <input
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder={currency === "USD" ? "$ Max" : "zł Max"}
              value={max}
              onChange={(e) => setMax(sanitizeDigits(e.target.value))}
              className="input"
            />
            <span
              className="USD"
              onClick={toggleCurrency}
              style={{ cursor: "pointer" }}
              title="USD/PLN"
            >
              {currency}
            </span>
          </div>
        </div>
      )}
    </aside>
  );
}
