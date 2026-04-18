"use client";

import { Suspense } from "react";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { PlusCircle, Clock, CheckCircle, XCircle, Bookmark } from "lucide-react";
import { AvatarImg } from "@/components/ui/avatar-img";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice, formatDate, getPublishCountdown, categoryLabel } from "@/lib/utils";
import type { ListingWithBroker } from "@/types";

type Tab = "listings" | "saved";

function DashboardPage() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const user = session?.user as any;

  const [tab, setTab] = useState<Tab>((searchParams.get("tab") as Tab) || "listings");
  const [myListings, setMyListings] = useState<any[]>([]);
  const [savedListings, setSavedListings] = useState<ListingWithBroker[]>([]);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;
    Promise.all([
      fetch("/api/user/listings").then((r) => r.json()),
      fetch("/api/user/saved").then((r) => r.json()),
      fetch("/api/user/profile").then((r) => r.json()),
    ]).then(([mine, saved, profile]) => {
      setMyListings(Array.isArray(mine) ? mine : []);
      setSavedListings(Array.isArray(saved) ? saved : []);
      if (profile?.avatar) setAvatar(profile.avatar);
    }).finally(() => setLoading(false));
  }, [session, user?.id]);

  const statusBadge = (status: string, publishAt: string) => {
    if (status === "PENDING") return (
      <span className="flex items-center gap-1 text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
        <Clock className="h-3 w-3" /> Publishes in {getPublishCountdown(publishAt)}
      </span>
    );
    if (status === "ACTIVE") return <span className="flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-full"><CheckCircle className="h-3 w-3" /> Active</span>;
    return <span className="flex items-center gap-1 text-xs text-red-700 bg-red-50 px-2 py-0.5 rounded-full"><XCircle className="h-3 w-3" /> Rejected</span>;
  };

  return (
    <div className="space-y-6">
      {/* Profile header */}
      <div className="rounded-lg border bg-card p-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <AvatarImg src={avatar} name={user?.name ?? "?"} size={56} />
          <div>
            <p className="font-semibold text-lg">{user?.name}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={user?.role === "VIP" ? "vip" : "secondary"}>{user?.role}</Badge>
              <span className="text-xs text-muted-foreground">{myListings.length} listings posted</span>
            </div>
          </div>
        </div>
        <Button asChild><Link href="/dashboard/listings/new"><PlusCircle className="h-4 w-4 mr-2" />Post listing</Link></Button>
      </div>

      {/* Tabs */}
      <div className="border-b flex gap-1">
        {(["listings", "saved"] as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors capitalize ${tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            {t === "listings" ? "My Listings" : "Saved"} {t === "listings" ? `(${myListings.length})` : `(${savedListings.length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      ) : tab === "listings" ? (
        myListings.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <p className="text-muted-foreground">You haven&apos;t posted any listings yet.</p>
            <Button asChild variant="outline"><Link href="/dashboard/listings/new">Post your first listing</Link></Button>
          </div>
        ) : (
          <div className="rounded-lg border bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="bg-muted/50 border-b">
                {["Title", "Category", "Price", "Status", "Posted"].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {myListings.map((l) => (
                  <tr key={l.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3"><Link href={`/listings/${l.id}`} className="font-medium hover:text-primary hover:underline line-clamp-1 max-w-[200px]">{l.title}</Link></td>
                    <td className="px-4 py-3 text-muted-foreground">{categoryLabel(l.category)}</td>
                    <td className="px-4 py-3 font-medium">{formatPrice(l.price)}</td>
                    <td className="px-4 py-3">{statusBadge(l.status, l.publishAt)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(l.submittedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        savedListings.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground"><Bookmark className="h-8 w-8 mx-auto mb-3 opacity-30" />No saved listings yet.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {savedListings.map((l) => (
              <Link key={l.id} href={`/listings/${l.id}`} className="rounded-lg border bg-card p-3 hover:shadow-md transition-shadow">
                <p className="font-medium text-sm line-clamp-2">{l.title}</p>
                <p className="text-primary font-bold mt-1">{formatPrice(l.price)}</p>
                <p className="text-xs text-muted-foreground mt-1">{l.location}</p>
              </Link>
            ))}
          </div>
        )
      )}
    </div>
  );
}

export default function DashboardPageWrapper() {
  return <Suspense><DashboardPage /></Suspense>;
}
