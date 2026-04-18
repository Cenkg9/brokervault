import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "OWNER") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || undefined;
  const category = searchParams.get("category") || undefined;

  const listings = await prisma.listing.findMany({
    where: { ...(status && { status: status as any }), ...(category && { category: category as any }) },
    include: { submittedBy: { select: { id: true, name: true, email: true } } },
    orderBy: { submittedAt: "desc" },
  });

  return NextResponse.json(listings);
}
