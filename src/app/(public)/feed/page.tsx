"use client";

import { Suspense } from "react";
import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import ListingCard from "@/components/listings/ListingCard";
import ListingFilters from "@/components/listings/ListingFilters";
import type { ListingWithBroker, FilterState } from "@/types";

function FeedPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = (session?.user as any)?.role;

  const [listings, setListings] = useState<ListingWithBroker[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    search: searchParams.get("search") || undefined,
  });

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const fetchListings = useCallback(async (f: FilterState, p = 1, append = false) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (f.category) params.set("category", f.category);
    if (f.minPrice) params.set("minPrice", String(f.minPrice));
    if (f.maxPrice) params.set("maxPrice", String(f.maxPrice));
    if (f.location) params.set("location", f.location);
    if (f.sortBy) params.set("sortBy", f.sortBy);
    if (f.search) params.set("search", f.search);
    if (f.status) params.set("status", f.status);
    params.set("page", String(p));

    try {
      const res = await fetch(`/api/listings?${params}`);
      const data = await res.json();
      setListings((prev) => append ? [...prev, ...data.listings] : data.listings);
      setTotal(data.total);
      setPage(data.page);
      setPages(data.pages);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session) fetchListings(filters);
  }, [session, filters, fetchListings]);

  // Sync search param
  useEffect(() => {
    const s = searchParams.get("search");
    if (s) setFilters((prev) => ({ ...prev, search: s }));
  }, [searchParams]);

  const handleFilter = (f: FilterState) => {
    setFilters(f);
    setPage(1);
  };

  const loadMore = () => {
    if (page < pages) fetchListings(filters, page + 1, true);
  };

  if (status === "loading") {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </>
    );
  }

  if (!session) return null;

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Navbar />
      {/* This div fills remaining height — nothing scrolls here */}
      <div className="flex-1 overflow-hidden">
        <div className="mx-auto max-w-[1600px] h-full px-4 lg:px-6">
          <div className="flex h-full gap-6">
            {/* Sidebar — scrolls internally if needed, never moves */}
            <ListingFilters filters={filters} onChange={handleFilter} role={role} />

            {/* Feed — only this column scrolls */}
            <div className="flex-1 overflow-y-auto min-w-0 py-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-lg font-semibold">
                  {filters.category ? `${filters.category.replace("_", " ")}` : "All Listings"}
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    {total > 0 ? `${total} listing${total !== 1 ? "s" : ""}` : ""}
                  </span>
                </h1>
                {(role === "VIP" || role === "OWNER") && (
                  <span className="text-xs text-violet-700 bg-violet-50 border border-violet-200 rounded px-2 py-1">
                    {role === "VIP" ? "VIP — seeing pending listings" : "Owner view — all listings"}
                  </span>
                )}
              </div>

              {/* Mobile search hint */}
              {filters.search && (
                <p className="text-sm text-muted-foreground mb-4">Results for &quot;{filters.search}&quot;</p>
              )}

              {loading && listings.length === 0 ? (
                <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
              ) : listings.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">No listings found. Try adjusting your filters.</div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                    {listings.map((listing) => (
                      <ListingCard key={listing.id} listing={listing} role={role} />
                    ))}
                  </div>

                  {page < pages && (
                    <div className="flex justify-center mt-8 mb-6">
                      <button
                        onClick={loadMore}
                        disabled={loading}
                        className="px-6 py-2 rounded-md border text-sm font-medium hover:bg-accent transition-colors disabled:opacity-50"
                      >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : `Load more (${total - listings.length} remaining)`}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FeedPageWrapper() {
  return (
    <Suspense>
      <FeedPage />
    </Suspense>
  );
}
