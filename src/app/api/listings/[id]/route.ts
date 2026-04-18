import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = (session.user as any).role as string;
  const userId = (session.user as any).id as string;

  const listing = await prisma.listing.findUnique({
    where: { id: params.id },
    include: {
      submittedBy: { select: { id: true, name: true, email: true, role: true, avatar: true, createdAt: true, lastActiveAt: true, suspendedAt: true } },
      savedBy: { where: { userId }, select: { userId: true } },
      _count: { select: { savedBy: true } },
    },
  });

  if (!listing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isOwner = role === "OWNER";
  const isSubmitter = listing.submittedById === userId;

  // Check if user is a participant in a conversation about this listing
  const hasConversation = !isOwner && !isSubmitter
    ? await prisma.conversation.findFirst({
        where: {
          listingId: listing.id,
          OR: [{ participantAId: userId }, { participantBId: userId }],
        },
        select: { id: true },
      })
    : null;

  if (listing.status === "PENDING" && !isOwner && !isSubmitter && !hasConversation) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (listing.status === "REJECTED" && !isOwner && !isSubmitter) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ...listing, isSaved: listing.savedBy.length > 0, savedBy: undefined });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = (session.user as any).role as string;
  const userId = (session.user as any).id as string;
  const listing = await prisma.listing.findUnique({ where: { id: params.id } });

  if (!listing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (role !== "OWNER" && listing.submittedById !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.listing.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
