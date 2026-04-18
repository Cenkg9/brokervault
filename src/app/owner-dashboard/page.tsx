"use client";

import { useState, useEffect } from "react";
import {
  Users, List, MessageSquare, TrendingUp, Clock, CheckCircle,
  Star, DollarSign, UserPlus, UserMinus, BarChart3, MapPin, ArrowUpRight, ArrowDownRight, Minus,
} from "lucide-react";

interface Stats {
  totalMembers: number; vipCount: number; memberCount: number;
  totalListings: number; activeListings: number; pendingListings: number; rejectedListings: number;
  newListingsToday: number; newMessagesToday: number; totalConversations: number;
  topBrokers: { id: string; name: string; email: string; role: string; listingCount: number }[];
  mrr: number; arr: number;
  newMembersThisMonth: number; newMembersLastMonth: number; lostThisMonth: number;
  momGrowth: number; projectedNextMonth: number;
  monthlyTrend: { month: string; count: number }[];
  memberCountries: { country: string; count: number }[];
}

function fmt(n: number) {
  return n.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function GrowthBadge({ pct }: { pct: number }) {
  if (pct > 0) return (
    <span className="flex items-center gap-0.5 text-xs text-green-600 font-medium">
      <ArrowUpRight className="h-3 w-3" />+{pct}%
    </span>
  );
  if (pct < 0) return (
    <span className="flex items-center gap-0.5 text-xs text-red-500 font-medium">
      <ArrowDownRight className="h-3 w-3" />{pct}%
    </span>
  );
  return <span className="flex items-center gap-0.5 text-xs text-muted-foreground font-medium"><Minus className="h-3 w-3" />0%</span>;
}

function MiniBarChart({ data }: { data: { month: string; count: number }[] }) {
  if (!data.length) return <div className="text-xs text-muted-foreground">No data yet</div>;
  const max = Math.max(...data.map((d) => d.count), 1);
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  return (
    <div className="flex items-end gap-1.5 h-20">
      {data.map((d, i) => {
        const month = new Date(d.month);
        const label = months[month.getMonth()];
        const heightPct = Math.max((d.count / max) * 100, 4);
        const isLast = i === data.length - 1;
        return (
          <div key={i} className="flex flex-col items-center gap-1 flex-1">
            <span className="text-[9px] text-muted-foreground font-mono">{d.count}</span>
            <div
              className={`w-full rounded-sm transition-all ${isLast ? "bg-primary" : "bg-primary/30"}`}
              style={{ height: `${heightPct}%` }}
            />
            <span className="text-[9px] text-muted-foreground">{label}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function OwnerOverviewPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/owner/stats").then((r) => r.json()).then(setStats);
  }, []);

  if (!stats) return (
    <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">Loading dashboard…</div>
  );

  const kpiCards = [
    {
      label: "Total members",
      value: stats.totalMembers,
      sub: `${stats.memberCount} standard · ${stats.vipCount} VIP`,
      icon: Users, color: "text-blue-600 bg-blue-50",
    },
    {
      label: "Active listings",
      value: stats.activeListings,
      sub: `${stats.pendingListings} pending · ${stats.rejectedListings} rejected`,
      icon: CheckCircle, color: "text-green-600 bg-green-50",
    },
    {
      label: "Pending review",
      value: stats.pendingListings,
      sub: "Awaiting approval",
      icon: Clock, color: "text-amber-600 bg-amber-50",
    },
    {
      label: "Conversations",
      value: stats.totalConversations,
      sub: `${stats.newMessagesToday} messages today`,
      icon: MessageSquare, color: "text-violet-600 bg-violet-50",
    },
    {
      label: "New listings today",
      value: stats.newListingsToday,
      sub: "Submitted in last 24h",
      icon: TrendingUp, color: "text-indigo-600 bg-indigo-50",
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Overview</h1>

      {/* ── Revenue ─────────────────────────────────────────────── */}
      <div>
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Revenue</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-lg border bg-white p-4 col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between mb-3">
              <div className="h-8 w-8 rounded-md flex items-center justify-center text-emerald-600 bg-emerald-50">
                <DollarSign className="h-4 w-4" />
              </div>
              <span className="text-xs text-muted-foreground font-mono">MRR</span>
            </div>
            <p className="text-2xl font-bold">€{fmt(stats.mrr)}</p>
            <p className="text-xs text-muted-foreground mt-1">Monthly recurring revenue</p>
          </div>

          <div className="rounded-lg border bg-white p-4 col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between mb-3">
              <div className="h-8 w-8 rounded-md flex items-center justify-center text-emerald-600 bg-emerald-50">
                <BarChart3 className="h-4 w-4" />
              </div>
              <span className="text-xs text-muted-foreground font-mono">ARR</span>
            </div>
            <p className="text-2xl font-bold">€{fmt(stats.arr)}</p>
            <p className="text-xs text-muted-foreground mt-1">Annual recurring revenue</p>
          </div>

          <div className="rounded-lg border bg-white p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="h-8 w-8 rounded-md flex items-center justify-center text-blue-600 bg-blue-50">
                <UserPlus className="h-4 w-4" />
              </div>
              <GrowthBadge pct={stats.momGrowth} />
            </div>
            <p className="text-2xl font-bold">+{stats.newMembersThisMonth}</p>
            <p className="text-xs text-muted-foreground mt-1">New members this month</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{stats.newMembersLastMonth} last month</p>
          </div>

          <div className="rounded-lg border bg-white p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="h-8 w-8 rounded-md flex items-center justify-center text-red-500 bg-red-50">
                <UserMinus className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-bold">{stats.lostThisMonth}</p>
            <p className="text-xs text-muted-foreground mt-1">Lost this month</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Suspended accounts</p>
          </div>
        </div>
      </div>

      {/* ── Growth & Trend ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 6-month member trend */}
        <div className="rounded-lg border bg-white p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-sm">Member growth — last 6 months</h2>
            <span className="text-xs text-muted-foreground font-mono">New joins / month</span>
          </div>
          <MiniBarChart data={stats.monthlyTrend} />
        </div>

        {/* Projections */}
        <div className="rounded-lg border bg-white p-5 space-y-4">
          <h2 className="font-semibold text-sm">Growth outlook</h2>

          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-xs text-muted-foreground">This month (so far)</span>
              <span className="text-sm font-bold">+{stats.newMembersThisMonth}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-xs text-muted-foreground">Last month</span>
              <span className="text-sm font-bold">+{stats.newMembersLastMonth}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-xs text-muted-foreground">MoM change</span>
              <GrowthBadge pct={stats.momGrowth} />
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-xs text-muted-foreground">Projected next month</span>
              <span className="text-sm font-bold text-primary">+{stats.projectedNextMonth}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-xs text-muted-foreground">Revenue at projection</span>
              <span className="text-sm font-bold text-emerald-600">
                €{fmt((stats.totalMembers + stats.projectedNextMonth) * 149.99)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Platform KPIs ───────────────────────────────────────── */}
      <div>
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Platform activity</h2>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {kpiCards.map(({ label, value, sub, icon: Icon, color }) => (
            <div key={label} className="rounded-lg border bg-white p-4 space-y-2">
              <div className={`h-8 w-8 rounded-md flex items-center justify-center ${color}`}>
                <Icon className="h-4 w-4" />
              </div>
              <p className="text-2xl font-bold">{value}</p>
              <div>
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs text-muted-foreground">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bottom row: Top locations + Top brokers ─────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Members by country */}
        <div className="rounded-lg border bg-white p-5 space-y-4">
          <h2 className="font-semibold flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-rose-500" />
            Members by country
          </h2>
          {stats.memberCountries.length === 0 ? (
            <p className="text-sm text-muted-foreground">No country data yet — members will be tracked at signup.</p>
          ) : (
            <div className="space-y-2">
              {stats.memberCountries.map((row, i) => {
                const max = stats.memberCountries[0].count;
                const pct = Math.round((row.count / max) * 100);
                return (
                  <div key={row.country} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-4 shrink-0">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-xs font-medium truncate">{row.country}</span>
                        <span className="text-xs text-muted-foreground shrink-0 ml-2">
                          {row.count} member{row.count !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-rose-400 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top brokers */}
        <div className="rounded-lg border bg-white p-5 space-y-4">
          <h2 className="font-semibold flex items-center gap-2 text-sm">
            <Star className="h-4 w-4 text-amber-500" />
            Most active brokers
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  {["Broker", "Email", "Role", "Listings"].map((h) => (
                    <th key={h} className="pb-2 text-left text-xs text-muted-foreground font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats.topBrokers.map((b, i) => (
                  <tr key={b.id} className="border-b last:border-0">
                    <td className="py-2.5 font-medium">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground w-4">{i + 1}</span>
                        <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                          {b.name[0]}
                        </div>
                        <span className="truncate max-w-[80px]">{b.name}</span>
                      </div>
                    </td>
                    <td className="py-2.5 text-muted-foreground text-xs truncate max-w-[120px]">{b.email}</td>
                    <td className="py-2.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${b.role === "VIP" ? "bg-violet-100 text-violet-700" : "bg-muted text-muted-foreground"}`}>
                        {b.role}
                      </span>
                    </td>
                    <td className="py-2.5 font-bold">{b.listingCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
