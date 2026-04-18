import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const SUBSCRIPTION_PRICE = 149.99;

export async function GET() {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "OWNER") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const now = new Date();
  const today = new Date(); today.setHours(0, 0, 0, 0);

  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd   = new Date(now.getFullYear(), now.getMonth(), 1);
  const sixMonthsAgo   = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const [
    totalMembers, vipCount, memberCount,
    active, pending, rejected,
    newToday, newMsgs, topBrokers, convCount,
    newMembersThisMonth, newMembersLastMonth, lostThisMonth,
    monthlyTrend, topLocations,
  ] = await Promise.all([
    prisma.user.count({ where: { role: { in: ["MEMBER", "VIP"] } } }),
    prisma.user.count({ where: { role: "VIP" } }),
    prisma.user.count({ where: { role: "MEMBER" } }),
    prisma.listing.count({ where: { status: "ACTIVE" } }),
    prisma.listing.count({ where: { status: "PENDING" } }),
    prisma.listing.count({ where: { status: "REJECTED" } }),
    prisma.listing.count({ where: { submittedAt: { gte: today } } }),
    prisma.message.count({ where: { sentAt: { gte: today } } }),
    prisma.user.findMany({
      take: 5,
      where: { role: { in: ["MEMBER", "VIP"] } },
      include: { _count: { select: { listings: true } } },
      orderBy: { listings: { _count: "desc" } },
    }),
    prisma.conversation.count(),
    // New members joined this month
    prisma.user.count({ where: { role: { in: ["MEMBER", "VIP"] }, createdAt: { gte: thisMonthStart } } }),
    // New members joined last month
    prisma.user.count({ where: { role: { in: ["MEMBER", "VIP"] }, createdAt: { gte: lastMonthStart, lt: lastMonthEnd } } }),
    // Lost (suspended) this month
    prisma.user.count({ where: { suspendedAt: { gte: thisMonthStart } } }),
    // Monthly member joins over last 6 months (raw SQL for date grouping)
    prisma.$queryRaw<{ month: Date; count: bigint }[]>`
      SELECT DATE_TRUNC('month', "createdAt") AS month, COUNT(*)::int AS count
      FROM users
      WHERE "createdAt" >= ${sixMonthsAgo}
        AND role IN ('MEMBER', 'VIP')
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY month ASC
    `,
    // Members by country
    prisma.$queryRaw<{ country: string; count: bigint }[]>`
      SELECT COALESCE(country, 'Unknown') AS country, COUNT(*)::int AS count
      FROM users
      WHERE role IN ('MEMBER', 'VIP')
      GROUP BY COALESCE(country, 'Unknown')
      ORDER BY count DESC
      LIMIT 10
    `,
  ]);

  const mrr = totalMembers * SUBSCRIPTION_PRICE;
  const arr = mrr * 12;

  // Month-over-month growth %
  const momGrowth = newMembersLastMonth === 0
    ? newMembersThisMonth > 0 ? 100 : 0
    : Math.round(((newMembersThisMonth - newMembersLastMonth) / newMembersLastMonth) * 100);

  // Simple linear projection: next month = last 2 months average + trend delta
  const projectedNextMonth = Math.max(0, Math.round(
    newMembersLastMonth + (newMembersThisMonth - newMembersLastMonth)
  ));

  return NextResponse.json({
    totalMembers, vipCount, memberCount,
    totalListings: active + pending + rejected,
    activeListings: active, pendingListings: pending, rejectedListings: rejected,
    newListingsToday: newToday, newMessagesToday: newMsgs, totalConversations: convCount,
    topBrokers: topBrokers.map((b) => ({ id: b.id, name: b.name, email: b.email, role: b.role, listingCount: b._count.listings })),
    // Revenue
    mrr, arr,
    // Growth
    newMembersThisMonth, newMembersLastMonth, lostThisMonth, momGrowth, projectedNextMonth,
    // Trends
    monthlyTrend: monthlyTrend.map((r) => ({
      month: r.month,
      count: Number(r.count),
    })),
    memberCountries: topLocations.map((r) => ({
      country: (r as any).country,
      count: Number(r.count),
    })),
  });
}
