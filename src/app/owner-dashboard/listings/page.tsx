"use client";

import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Trash2, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatPrice, formatDate, getPublishCountdown, categoryLabel } from "@/lib/utils";

interface Listing {
  id: string; title: string; category: string; price: number;
  status: string; publishAt: string; submittedAt: string;
  submittedBy: { id: string; name: string; email: string };
}

export default function OwnerListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const p = new URLSearchParams();
    if (statusFilter) p.set("status", statusFilter);
    if (categoryFilter) p.set("category", categoryFilter);
    const res = await fetch(`/api/owner/listings?${p}`);
    const data = await res.json();
    if (Array.isArray(data)) setListings(data);
  };

  useEffect(() => { load().finally(() => setLoading(false)); }, [statusFilter, categoryFilter]);

  const action = async (id: string, act: string) => {
    await fetch(`/api/owner/listings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: act }),
    });
    load();
  };

  const statusBadge = (status: string, publishAt: string) => {
    if (status === "ACTIVE") return <Badge variant="success">Active</Badge>;
    if (status === "REJECTED") return <Badge variant="destructive">Rejected</Badge>;
    return <Badge variant="pending">Pending — {getPublishCountdown(publishAt)}</Badge>;
  };

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold">Listings</h1>

      <div className="flex gap-3">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="h-9 rounded-md border border-input bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
          <option value="">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="PENDING">Pending</option>
          <option value="REJECTED">Rejected</option>
        </select>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
          className="h-9 rounded-md border border-input bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
          <option value="">All categories</option>
          <option value="REAL_ESTATE">Real Estate</option>
          <option value="LUXURY_CARS">Luxury Cars</option>
          <option value="YACHTS">Yachts</option>
          <option value="OTHER">Other</option>
        </select>
      </div>

      <div className="rounded-lg border bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-muted/40 border-b">
              {["Title", "Category", "Price", "Status", "Submitted by", "Submitted", "Publishes at", "Actions"].map((h) => (
                <th key={h} className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground whitespace-nowrap">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">Loading...</td></tr>
              ) : listings.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">No listings</td></tr>
              ) : listings.map((l) => (
                <tr key={l.id} className="border-b last:border-0 hover:bg-muted/20">
                  <td className="px-4 py-3 font-medium max-w-[200px]">
                    <a href={`/listings/${l.id}`} className="hover:text-primary hover:underline line-clamp-1">{l.title}</a>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{categoryLabel(l.category)}</td>
                  <td className="px-4 py-3 font-medium whitespace-nowrap">{formatPrice(l.price)}</td>
                  <td className="px-4 py-3">{statusBadge(l.status, l.publishAt)}</td>
                  <td className="px-4 py-3">
                    <div className="text-xs">
                      <p className="font-medium">{l.submittedBy.name}</p>
                      <p className="text-muted-foreground">{l.submittedBy.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{formatDate(l.submittedAt)}</td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                    {l.status === "PENDING" ? (
                      <span className="flex items-center gap-1 text-blue-700"><Clock className="h-3 w-3" />{formatDate(l.publishAt)}</span>
                    ) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {l.status === "PENDING" && (
                        <button onClick={() => action(l.id, "approve")} title="Approve now" className="p-1.5 rounded hover:bg-green-50 text-green-600 transition-colors">
                          <CheckCircle className="h-4 w-4" />
                        </button>
                      )}
                      {l.status !== "REJECTED" && (
                        <button onClick={() => action(l.id, "reject")} title="Reject" className="p-1.5 rounded hover:bg-amber-50 text-amber-600 transition-colors">
                          <XCircle className="h-4 w-4" />
                        </button>
                      )}
                      <button onClick={() => { if (confirm("Delete this listing?")) action(l.id, "delete"); }} title="Delete" className="p-1.5 rounded hover:bg-red-50 text-red-600 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">{listings.length} listing{listings.length !== 1 ? "s" : ""}</p>
    </div>
  );
}
