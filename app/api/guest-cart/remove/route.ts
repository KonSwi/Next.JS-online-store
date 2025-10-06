import { NextResponse } from "next/server";
import { cookies } from "next/headers";

type Body = { productId: number | string };

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

  if (!Number.isFinite(productId)) {
    return NextResponse.json({ error: "Invalid productId" }, { status: 400 });
  }

  delete map[String(productId)];

  jar.set("guest_cart", JSON.stringify(map), {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
  });

  return NextResponse.json({ ok: true });
}
