import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({ action: z.enum(["set_vip", "revoke_vip", "suspend", "unsuspend", "delete"]) });

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "OWNER") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { action } = schema.parse(await req.json());
  const user = await prisma.user.findUnique({ where: { id: params.id } });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (user.role === "OWNER") return NextResponse.json({ error: "Cannot modify owner account" }, { status: 400 });

  if (action === "delete") {
    await prisma.user.delete({ where: { id: params.id } });
    return NextResponse.json({ deleted: true });
  }

  const updates: any = {
    set_vip: { role: "VIP" },
    revoke_vip: { role: "MEMBER" },
    suspend: { suspendedAt: new Date() },
    unsuspend: { suspendedAt: null },
  };
  await prisma.user.update({ where: { id: params.id }, data: updates[action] });
  return NextResponse.json(await prisma.user.findUnique({
    where: { id: params.id },
    select: { id: true, name: true, email: true, role: true, suspendedAt: true },
  }));
}
