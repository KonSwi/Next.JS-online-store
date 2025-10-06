import { NextResponse } from "next/server";
import { cookies } from "next/headers";

type Body = { productId: number | string; quantity: number | string };

export async function POST(req: Request) {
  const jar = await cookies();
  const raw = jar.get("guest_cart")?.value ?? "{}";

  let map: Record<string, number> = {};
  try {
    map = JSON.parse(raw);
  } catch {
    map = {};
  }

  const body = (await req.json().catch(() => ({}))) as Body;
  const productId = Number(body.productId);
  let quantity = Math.max(1, Number(body.quantity ?? 1));

  if (!Number.isFinite(productId)) {
    return NextResponse.json({ error: "Invalid productId" }, { status: 400 });
  }
  if (!Number.isFinite(quantity)) quantity = 1;

  map[String(productId)] = quantity;

  jar.set("guest_cart", JSON.stringify(map), {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
  });

  return NextResponse.json({ ok: true });
}
