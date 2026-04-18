import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const senderSelect = { select: { id: true, name: true, email: true, role: true, createdAt: true, lastActiveAt: true, suspendedAt: true } };

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id as string;
  const role = (session.user as any).role as string;
  const conv = await prisma.conversation.findUnique({ where: { id: params.id } });
  if (!conv) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (role !== "OWNER" && conv.participantAId !== userId && conv.participantBId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const messages = await prisma.message.findMany({
    where: { conversationId: params.id },
    include: { sender: senderSelect },
    orderBy: { sentAt: "asc" },
  });

  // Mark as read
  await prisma.message.updateMany({
    where: { conversationId: params.id, senderId: { not: userId }, readAt: null },
    data: { readAt: new Date() },
  });

  return NextResponse.json(messages);
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id as string;
  const { body } = await req.json();
  if (!body?.trim()) return NextResponse.json({ error: "Empty message" }, { status: 400 });

  const conv = await prisma.conversation.findUnique({ where: { id: params.id } });
  if (!conv) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (conv.participantAId !== userId && conv.participantBId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [message] = await Promise.all([
    prisma.message.create({
      data: { conversationId: params.id, senderId: userId, body: body.trim() },
      include: { sender: senderSelect },
    }),
    prisma.conversation.update({ where: { id: params.id }, data: { lastMessageAt: new Date() } }),
  ]);

  const io = (global as any).io;
  if (io) {
    io.to(`conv:${params.id}`).emit("new-message", message);
    const otherUserId = conv.participantAId === userId ? conv.participantBId : conv.participantAId;
    io.to(`user:${otherUserId}`).emit("conversation-update", { conversationId: params.id, message });
  }

  return NextResponse.json(message, { status: 201 });
}
