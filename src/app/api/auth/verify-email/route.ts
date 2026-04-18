import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email";

// POST /api/auth/verify-email — verify the 6-digit code
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = (body.email ?? "").toLowerCase();
    const code = body.code;
    if (!email || !code) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ error: "Account not found" }, { status: 404 });
    if (user.emailVerified) return NextResponse.json({ success: true, alreadyVerified: true });

    if (!user.emailVerifyToken || user.emailVerifyToken !== String(code).trim()) {
      return NextResponse.json({ error: "Incorrect code" }, { status: 400 });
    }
    if (user.emailVerifyExpires && user.emailVerifyExpires < new Date()) {
      return NextResponse.json({ error: "Code expired — request a new one" }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true, emailVerifyToken: null, emailVerifyExpires: null },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST /api/auth/verify-email/resend — resend code
export async function PUT(req: Request) {
  try {
    const body2 = await req.json();
    const email = (body2.email ?? "").toLowerCase();
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.emailVerified) return NextResponse.json({ ok: true }); // silent

    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expires = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerifyToken: code, emailVerifyExpires: expires },
    });

    await sendVerificationEmail(email, user.name, code);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
