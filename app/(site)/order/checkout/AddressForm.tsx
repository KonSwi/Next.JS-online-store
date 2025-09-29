"use client";

import { useEffect, useMemo, useState } from "react";

export type Addr = {
  country?: string;
  province?: string;
  city?: string;
  postalCode?: string;
  line1?: string;
  makeMain?: boolean;
} | null;


declare global {
  interface Window {
    __checkout_getAddress?: () => Addr;
  }
}

export default function AddressForm({
  defaultAddress,
}: {
  defaultAddress: Addr;
}) {
  const [mode, setMode] = useState<"existing" | "new">("existing");

  const [country, setCountry] = useState("");
  const [province, setProvince] = useState("");
  const [city, setCity] = useState("");
  const [postal, setPostal] = useState("");
  const [line1, setLine1] = useState("");
  const [main, setMain] = useState(true);

  // adres do PayNowButton
  const getter = useMemo<() => Addr>(
    () => () => {
      if (mode !== "new") return defaultAddress ?? null;
      const something = country || province || city || postal || line1;
      if (!something) return null;
      return {
        country,
        province,
        city,
        postalCode: postal,
        line1,
        makeMain: main,
      };
    },
    [mode, defaultAddress, country, province, city, postal, line1, main]
  );

  useEffect(() => {
    window.__checkout_getAddress = getter;
    return () => {
      if (window.__checkout_getAddress === getter) {
        delete window.__checkout_getAddress;
      }
    };
  }, [getter]);

  return (
    <div className="card p-4">
      <div className="h1 mb-3">Address</div>

      <div className="mb-3 flex items-center gap-6 text-sm">
        <button
          type="button"
          onClick={() => setMode("existing")}
          className={
            mode === "existing"
              ? "text-white relative after:absolute after:left-0 after:-bottom-2 after:h-0.5 after:w-full after:bg-amber-500"
              : "muted hover:text-white"
          }
        >
          Existing Address
        </button>
        <button
          type="button"
          onClick={() => setMode("new")}
          className={
            mode === "new"
              ? "text-white relative after:absolute after:left-0 after:-bottom-2 after:h-0.5 after:w-full after:bg-amber-500"
              : "muted hover:text-white"
          }
        >
          New Address
        </button>
      </div>

      {defaultAddress && (
        <div className="rounded border border-neutral-700 bg-neutral-900 p-4 text-sm">
          <div className="mb-4">
            <div className="mb-1 text-neutral-300">
              Address <span className="badge ml-2">Main Address</span>
            </div>
            <div className="text-white">{defaultAddress.line1 || "—"}</div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div>
              <div className="muted mb-1">Country</div>
              <div className="text-white">{defaultAddress.country || "—"}</div>
            </div>
            <div>
              <div className="muted mb-1">Province</div>
              <div className="text-white">{defaultAddress.province || "—"}</div>
            </div>
            <div>
              <div className="muted mb-1">City</div>
              <div className="text-white">{defaultAddress.city || "—"}</div>
            </div>
            <div>
              <div className="muted mb-1">Postal Code</div>
              <div className="text-white">
                {defaultAddress.postalCode || "—"}
              </div>
            </div>
          </div>
        </div>
      )}

      {!defaultAddress && mode === "existing" && (
        <div className="rounded border border-neutral-700 bg-neutral-900 p-3 text-sm text-neutral-300">
          No saved address. Switch to{" "}
          <span className="text-amber-400">New Address</span> and add one.
        </div>
      )}

      {mode === "new" && (
        <div className="mt-3 grid grid-cols-2 gap-3">
          <input
            className="input"
            placeholder="Country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          />
          <input
            className="input"
            placeholder="Province"
            value={province}
            onChange={(e) => setProvince(e.target.value)}
          />
          <input
            className="input"
            placeholder="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <input
            className="input"
            placeholder="Postal Code"
            value={postal}
            onChange={(e) => setPostal(e.target.value)}
          />
          <input
            className="input col-span-2"
            placeholder="Input Complete Address"
            value={line1}
            onChange={(e) => setLine1(e.target.value)}
          />
          <label className="col-span-2 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="h-4 w-4 accent-amber-500"
              checked={main}
              onChange={(e) => setMain(e.target.checked)}
            />
            Make it the main address
          </label>
        </div>
      )}
    </div>
  );
}
