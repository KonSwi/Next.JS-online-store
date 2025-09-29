import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import { z } from "zod";
import { normalizePhone } from "@/lib/phone";

const BodySchema = z.object({
  id: z.string().min(1), // email lub telefon
  password: z.string().min(1),
});

function looksLikeEmail(v: string): boolean {
  return /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(v);
}

export async function POST(req: Request) {
  try {
    const parsed = BodySchema.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Missing credentials" },
        { status: 400 }
      );
    }

    const { id, password } = parsed.data;

    let user: {
      id: number;
      email: string;
      passwordHash: string | null;
    } | null = null;

    if (looksLikeEmail(id)) {
      user = await prisma.user.findUnique({
        where: { email: id.toLowerCase() },
        select: { id: true, email: true, passwordHash: true },
      });
    } else {
         const phone = normalizePhone(id);
      user = await prisma.user.findUnique({
        where: { phone },
        select: { id: true, email: true, passwordHash: true },
      });
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const ok = await verifyPassword(password, user.passwordHash || "");
    if (!ok) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

      return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("POST /api/login", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
