import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id as string;

  const saved = await prisma.savedListing.findMany({
    where: { userId },
    include: {
      listing: {
        include: {
          submittedBy: { select: { id: true, name: true, email: true, role: true, avatar: true, createdAt: true, lastActiveAt: true, suspendedAt: true } },
          _count: { select: { savedBy: true } },
        },
      },
    },
    orderBy: { savedAt: "desc" },
  });

  return NextResponse.json(saved.map((s) => ({ ...s.listing, isSaved: true })));
}
