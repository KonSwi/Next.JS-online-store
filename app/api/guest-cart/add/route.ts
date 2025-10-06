import { NextResponse } from "next/server";
import { cookies } from "next/headers";

type Body = { productId: number | string; qty?: number | string };

export async function POST(req: Request) {
  const json = (await req.json().catch(() => ({}))) as Body;
  const productId = Number(json.productId);
  const qty = Math.max(1, Number(json.qty ?? 1));
  if (!Number.isFinite(productId)) {
    return NextResponse.json({ error: "Invalid productId" }, { status: 400 });
  }

  const jar = await cookies();
  const raw = jar.get("guest_cart")?.value ?? "{}";
  let map: Record<string, number> = {};
  try {
    map = JSON.parse(raw);
  } catch {
    map = {};
  }
  const prev = Number(map[String(productId)] ?? 0);
  map[String(productId)] = prev + qty;

  jar.set("guest_cart", JSON.stringify(map), {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, 
  });

  return NextResponse.json({ ok: true, data: map }, { status: 200 });
}
