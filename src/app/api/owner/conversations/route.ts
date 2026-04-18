import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "OWNER") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const convs = await prisma.conversation.findMany({
    include: {
      listing: { select: { id: true, title: true } },
      participantA: { select: { id: true, name: true, email: true } },
      participantB: { select: { id: true, name: true, email: true } },
      _count: { select: { messages: true } },
    },
    orderBy: { lastMessageAt: "desc" },
  });

  return NextResponse.json(convs);
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "OWNER") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await req.json();
  await prisma.conversation.delete({ where: { id } });
  return NextResponse.json({ deleted: true });
}
