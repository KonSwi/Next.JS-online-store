// /types/globals.d.ts
export {};

declare global {
  interface Window {
    __checkout_getAddress?: () => {
      country?: string;
      province?: string;
      city?: string;
      postalCode?: string;
      line1?: string;
      makeMain?: boolean;
    } | null;
  }
}
