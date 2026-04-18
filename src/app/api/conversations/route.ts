import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const include = {
  listing: { select: { id: true, title: true, photos: true, price: true, location: true, category: true, status: true } },
  participantA: { select: { id: true, name: true, email: true, role: true, avatar: true, createdAt: true, lastActiveAt: true, suspendedAt: true } },
  participantB: { select: { id: true, name: true, email: true, role: true, avatar: true, createdAt: true, lastActiveAt: true, suspendedAt: true } },
  messages: { orderBy: { sentAt: "desc" as const }, take: 1 },
  _count: { select: { messages: true } },
};

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id as string;

  const convs = await prisma.conversation.findMany({
    where: { OR: [{ participantAId: userId }, { participantBId: userId }] },
    include,
    orderBy: { lastMessageAt: "desc" },
  });

  const withUnread = await Promise.all(
    convs.map(async (c) => ({
      ...c,
      unreadCount: await prisma.message.count({
        where: { conversationId: c.id, senderId: { not: userId }, readAt: null },
      }),
    }))
  );

  return NextResponse.json(withUnread);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id as string;
  const { listingId, brokerId } = await req.json();

  if (!listingId || !brokerId) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  if (userId === brokerId) return NextResponse.json({ error: "Cannot message yourself" }, { status: 400 });

  const [participantAId, participantBId] = [userId, brokerId].sort();

  const existing = await prisma.conversation.findUnique({
    where: { listingId_participantAId_participantBId: { listingId, participantAId, participantBId } },
    include: { ...include, messages: { orderBy: { sentAt: "asc" as const }, include: { sender: { select: { id: true, name: true, email: true, role: true, avatar: true, createdAt: true, lastActiveAt: true, suspendedAt: true } } } } },
  });
  if (existing) return NextResponse.json(existing);

  const conv = await prisma.conversation.create({
    data: { listingId, participantAId, participantBId },
    include: { ...include, messages: { orderBy: { sentAt: "asc" as const }, include: { sender: { select: { id: true, name: true, email: true, role: true, avatar: true, createdAt: true, lastActiveAt: true, suspendedAt: true } } } } },
  });
  return NextResponse.json(conv, { status: 201 });
}
