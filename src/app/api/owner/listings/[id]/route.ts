import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({ action: z.enum(["approve", "reject", "delete"]) });

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "OWNER") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { action } = schema.parse(await req.json());
  const now = new Date();

  if (action === "delete") {
    await prisma.listing.delete({ where: { id: params.id } });
    return NextResponse.json({ deleted: true });
  }

  const data = action === "approve"
    ? { status: "ACTIVE" as const, publishAt: now, publishedAt: now }
    : { status: "REJECTED" as const };

  await prisma.listing.update({ where: { id: params.id }, data });
  return NextResponse.json(await prisma.listing.findUnique({ where: { id: params.id } }));
}
