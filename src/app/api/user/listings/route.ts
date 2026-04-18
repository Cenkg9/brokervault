import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/user/listings — returns the current user's own listings (all statuses)
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id as string;

  const listings = await prisma.listing.findMany({
    where: { submittedById: userId },
    orderBy: { submittedAt: "desc" },
  });

  return NextResponse.json(listings);
}
