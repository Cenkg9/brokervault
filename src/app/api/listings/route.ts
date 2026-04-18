import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { addHours } from "date-fns";

const createSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200),
  description: z.string().min(10, "Description must be at least 10 characters").max(5000),
  category: z.enum(["REAL_ESTATE", "LUXURY_CARS", "YACHTS", "OTHER"]),
  price: z.number().positive("Price must be a positive number"),
  location: z.string().min(2, "Location is required").max(200),
  photos: z.array(z.string()).max(10).default([]),
});

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const role = (session.user as any).role as string;
  const userId = (session.user as any).id as string;
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = 20;

  const statusFilter =
    role === "OWNER" ? { in: ["ACTIVE", "PENDING", "REJECTED"] as any[] }
    : role === "VIP"  ? { in: ["ACTIVE", "PENDING"] as any[] }
    : "ACTIVE";

  const category = searchParams.get("category") || undefined;
  const minPrice = searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined;
  const maxPrice = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined;
  const location = searchParams.get("location") || undefined;
  const search = searchParams.get("search") || undefined;
  const sortBy = searchParams.get("sortBy") || "newest";

  const where: any = {
    status: statusFilter,
    ...(category && { category }),
    ...(location && { location: { contains: location, mode: "insensitive" } }),
    ...(search && { OR: [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { location: { contains: search, mode: "insensitive" } },
    ]}),
  };

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {
      ...(minPrice !== undefined && { gte: minPrice }),
      ...(maxPrice !== undefined && { lte: maxPrice }),
    };
  }

  // Sort by publishedAt for time-based sorts (matches the "X days ago" shown on cards)
  // Fall back to submittedAt for pending listings that don't have a publishedAt yet
  const orderBy: any[] =
    sortBy === "price_asc"  ? [{ price: "asc" },  { publishedAt: "desc" }] :
    sortBy === "price_desc" ? [{ price: "desc" }, { publishedAt: "desc" }] :
    sortBy === "oldest"     ? [{ publishedAt: "asc"  }, { submittedAt: "asc"  }] :
                              [{ publishedAt: "desc" }, { submittedAt: "desc" }];

  const [listings, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      include: {
        submittedBy: { select: { id: true, name: true, email: true, role: true, avatar: true, createdAt: true, lastActiveAt: true, suspendedAt: true } },
        savedBy: { where: { userId }, select: { userId: true } },
        _count: { select: { savedBy: true } },
      },
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.listing.count({ where }),
  ]);

  return NextResponse.json({
    listings: listings.map((l) => ({ ...l, isSaved: l.savedBy.length > 0, savedBy: undefined })),
    total,
    page,
    pages: Math.ceil(total / limit),
  });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const data = createSchema.parse(await req.json());
    const userId = (session.user as any).id as string;
    const delaySetting = await prisma.platformSettings.findUnique({ where: { key: "publish_delay_hours" } });
    const delayHours = parseInt(delaySetting?.value ?? "12");

    const listing = await prisma.listing.create({
      data: { ...data, submittedById: userId, publishAt: addHours(new Date(), delayHours), status: "PENDING" },
      include: { submittedBy: { select: { id: true, name: true, email: true, role: true, avatar: true, createdAt: true, lastActiveAt: true, suspendedAt: true } } },
    });
    return NextResponse.json(listing, { status: 201 });
  } catch (err: any) {
    if (err?.name === "ZodError") {
      const first = err.errors[0];
      const field = first?.path?.[0] ?? "input";
      const msg = first?.message ?? "Invalid input";
      return NextResponse.json({ error: `${field.charAt(0).toUpperCase() + field.slice(1)}: ${msg}` }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
