// /lib/address.ts

export type Address = {
  line1?: string;
  country?: string;
  province?: string;
  city?: string;
  postalCode?: string;
  makeMain?: boolean;
} | null;

/** Znormalizuj dowolny obiekt do formatu Address. Brak jakichkolwiek pól ⇒ null. */
export function normalizeAddress(raw: unknown): Address {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;

  const getStr = (k: string): string | undefined => {
    const v = r[k];
    return typeof v === "string" ? v : undefined;
  };

  const line1 =
    getStr("line1") ?? getStr("addressLine") ?? getStr("street") ?? "";
  const city = getStr("city") ?? "";
  const province = getStr("province") ?? getStr("state") ?? "";
  const postalCode = getStr("postalCode") ?? getStr("zip") ?? "";
  const country = getStr("country") ?? "";
  const makeMain = Boolean(r["makeMain"]);

  const something = line1 || city || province || postalCode || country;
  if (!something) return null;

  return { line1, city, province, postalCode, country, makeMain };
}

/** Wygodny parser JSON-owego stringa z adresu (np. z user.address). */
export function parseAddressJSON(value: unknown): Address {
  if (typeof value !== "string" || value.trim() === "") return null;
  try {
    return normalizeAddress(JSON.parse(value));
  } catch {
    return null;
  }
}
