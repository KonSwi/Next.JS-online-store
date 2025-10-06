import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { hashPassword } from "@/lib/password";
import { normalizePhone } from "@/lib/phone";

const bodySchema = z
  .object({
    email: z.string().email(),
    phone: z
      .string()
      .min(6)
      .max(20)
      .regex(/^[0-9+\-\s()]+$/),
    password: z.string().min(6),
    confirmPassword: z.string().min(6),
    country: z.string().min(2),
    agree: z.literal(true),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const email = parsed.data.email.toLowerCase();
    const phone = normalizePhone(parsed.data.phone);
    const { password, country } = parsed.data;

    // unikalny email
    const byEmail = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    if (byEmail) {
      return NextResponse.json(
        { error: "Email already used" },
        { status: 409 }
      );
    }

    // unikalny telefon
    const byPhone = await prisma.user.findUnique({
      where: { phone },
      select: { id: true },
    });
    if (byPhone) {
      return NextResponse.json(
        { error: "Phone already used" },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        phone,
        firstName: "",
        passwordHash,
        address: JSON.stringify({ country }),
      },
      select: { id: true, email: true, phone: true },
    });

    return NextResponse.json({ data: user }, { status: 201 });
  } catch (e) {
    console.error("POST /api/register error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
