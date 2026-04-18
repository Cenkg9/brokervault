import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "OWNER") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const settings = await prisma.platformSettings.findMany();
  return NextResponse.json(Object.fromEntries(settings.map((s) => [s.key, s.value])));
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "OWNER") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const updates: Record<string, string> = await req.json();
  await Promise.all(
    Object.entries(updates).map(([key, value]) =>
      prisma.platformSettings.upsert({ where: { key }, update: { value }, create: { key, value } })
    )
  );
  return NextResponse.json({ success: true });
}
