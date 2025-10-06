// /lib/session.ts
import { getServerSession } from "next-auth";
import type { Session } from "next-auth";
import { authOptions } from "@/lib/auth";

/** Bezpieczny odczyt userId z Session (string/number -> number) */
export function getUserIdFrom(session: Session | null | undefined): number | null {
  const userLike = session?.user as { id?: number | string } | undefined;
  const raw = userLike?.id;
  const n = typeof raw === "string" ? Number(raw) : typeof raw === "number" ? raw : NaN;
  return Number.isFinite(n) ? n : null;
}

/** Pobierz bezpiecznie sesję (SSR/RSC) */
export async function getSessionSafe(): Promise<Session | null> {
  return getServerSession(authOptions);
}

/** Używaj w komponentach stron (RSC) */
export async function getUserIdInPage(): Promise<number | null> {
  const session = await getServerSession(authOptions);
  return getUserIdFrom(session);
}

/** Używaj w Route Handlers (app/api/*) */
export async function getUserIdInRoute(): Promise<number | null> {
  const session = await getServerSession(authOptions);
  return getUserIdFrom(session);
}

/** Wymuś zalogowanie (Route Handlers) */
export async function requireUserIdInRoute(): Promise<number> {
  const id = await getUserIdInRoute();
  if (!id) {
    const err = new Error("Unauthorized") as Error & { status?: number };
    err.status = 401;
    throw err;
  }
  return id;
}

/** Wymuś zalogowanie (RSC pages) */
export async function requireUserIdInPage(): Promise<number> {
  const id = await getUserIdInPage();
  if (!id) {
    const err = new Error("Unauthorized") as Error & { status?: number };
    err.status = 401;
    throw err;
  }
  return id;
}
