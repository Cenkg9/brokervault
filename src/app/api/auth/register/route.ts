import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8),
  country: z.string().min(2).max(100).optional(),
  phone: z.string().max(30).optional(),
});

export async function POST(req: Request) {
  try {
    const parsed = schema.parse(await req.json());
    const { name, password, country, phone } = parsed;
    const email = parsed.email.toLowerCase(); // always lowercase
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return NextResponse.json({ error: "Email already registered" }, { status: 409 });

    const token = String(Math.floor(100000 + Math.random() * 900000)); // 6-digit OTP
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    const user = await prisma.user.create({
      data: {
        name, email,
        passwordHash: await bcrypt.hash(password, 12),
        role: "MEMBER",
        country: country || null,
        phone: phone || null,
        emailVerifyToken: token,
        emailVerifyExpires: expires,
      },
      select: { id: true, name: true, email: true, role: true },
    });

    // Send verification email (non-blocking — don't fail registration if email fails)
    try {
      await sendVerificationEmail(email, name, token);
    } catch (emailErr) {
      console.error("Failed to send verification email:", emailErr);
    }

    return NextResponse.json(user, { status: 201 });
  } catch (err: any) {
    console.error("[register] error:", err);
    if (err?.name === "ZodError") return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    return NextResponse.json({ error: err?.message ?? "Server error" }, { status: 500 });
  }
}
