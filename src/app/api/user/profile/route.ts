import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().max(30).optional().nullable(),
  country: z.string().max(100).optional().nullable(),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id as string;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true, country: true, phone: true, avatar: true, emailVerified: true, createdAt: true, lastActiveAt: true },
  });
  return NextResponse.json(user);
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id as string;

  try {
    const body = updateSchema.parse(await req.json());
    const user = await prisma.user.update({
      where: { id: userId },
      data: body,
      select: { id: true, name: true, email: true, role: true, country: true, phone: true, avatar: true, emailVerified: true },
    });
    return NextResponse.json(user);
  } catch {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
}
