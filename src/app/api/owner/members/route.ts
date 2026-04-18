import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "OWNER") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || undefined;
  const role = searchParams.get("role") || undefined;

  const members = await prisma.user.findMany({
    where: {
      ...(search && { OR: [{ name: { contains: search, mode: "insensitive" } }, { email: { contains: search, mode: "insensitive" } }] }),
      ...(role && { role: role as any }),
    },
    include: { _count: { select: { listings: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(members.map((m) => ({
    id: m.id, name: m.name, email: m.email, role: m.role,
    createdAt: m.createdAt, lastActiveAt: m.lastActiveAt, suspendedAt: m.suspendedAt,
    listingCount: m._count.listings,
  })));
}
