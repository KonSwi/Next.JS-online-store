// lib/phone.ts
/**
 * Normalizuje numer telefonu:
 * usuwa spacje, myślniki i nawiasy. Zostawia np. +48123456789
 */
export function normalizePhone(value: string): string {
  return String(value).replace(/[()\s-]/g, "");
}
