"use client";

import { useState, useEffect } from "react";
import { Search, Star, StarOff, Ban, Trash2, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

interface Member {
  id: string; name: string; email: string; role: string;
  createdAt: string; lastActiveAt: string; suspendedAt: string | null; listingCount: number;
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const p = new URLSearchParams();
    if (search) p.set("search", search);
    if (roleFilter) p.set("role", roleFilter);
    const res = await fetch(`/api/owner/members?${p}`);
    const data = await res.json();
    if (Array.isArray(data)) setMembers(data);
  };

  useEffect(() => { load().finally(() => setLoading(false)); }, [search, roleFilter]);

  const action = async (id: string, act: string) => {
    await fetch(`/api/owner/members/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: act }),
    });
    load();
  };

  const exportCSV = () => {
    const header = "Name,Email,Role,Listings,Joined,Last Active\n";
    const rows = members.map((m) => `"${m.name}","${m.email}","${m.role}","${m.listingCount}","${formatDate(m.createdAt)}","${formatDate(m.lastActiveAt)}"`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "members.csv"; a.click();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Members</h1>
        <Button variant="outline" size="sm" onClick={exportCSV}>Export CSV</Button>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input placeholder="Search name or email..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-md border border-input bg-white text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
        </div>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
          className="h-9 rounded-md border border-input bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
          <option value="">All roles</option>
          <option value="MEMBER">Member</option>
          <option value="VIP">VIP</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-muted/40 border-b">
              {["Name", "Email", "Role", "Listings", "Joined", "Last Active", "Actions"].map((h) => (
                <th key={h} className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground whitespace-nowrap">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">Loading...</td></tr>
              ) : members.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">No members found</td></tr>
              ) : members.map((m) => (
                <tr key={m.id} className={`border-b last:border-0 hover:bg-muted/20 ${m.suspendedAt ? "opacity-50" : ""}`}>
                  <td className="px-4 py-3 font-medium whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">{m.name[0]}</div>
                      {m.name}
                      {m.suspendedAt && <span className="text-[10px] text-red-600 bg-red-50 px-1.5 rounded">Suspended</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{m.email}</td>
                  <td className="px-4 py-3">
                    <Badge variant={m.role === "VIP" ? "vip" : "secondary"} className="text-xs">{m.role}</Badge>
                  </td>
                  <td className="px-4 py-3 text-center font-medium">{m.listingCount}</td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{formatDate(m.createdAt)}</td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{formatDate(m.lastActiveAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {m.role !== "VIP" ? (
                        <button onClick={() => action(m.id, "set_vip")} title="Grant VIP" className="p-1.5 rounded hover:bg-violet-50 text-violet-600 transition-colors">
                          <Star className="h-4 w-4" />
                        </button>
                      ) : (
                        <button onClick={() => action(m.id, "revoke_vip")} title="Revoke VIP" className="p-1.5 rounded hover:bg-muted text-muted-foreground transition-colors">
                          <StarOff className="h-4 w-4" />
                        </button>
                      )}
                      {m.suspendedAt ? (
                        <button onClick={() => action(m.id, "unsuspend")} title="Unsuspend" className="p-1.5 rounded hover:bg-green-50 text-green-600 transition-colors">
                          <ShieldCheck className="h-4 w-4" />
                        </button>
                      ) : (
                        <button onClick={() => action(m.id, "suspend")} title="Suspend" className="p-1.5 rounded hover:bg-amber-50 text-amber-600 transition-colors">
                          <Ban className="h-4 w-4" />
                        </button>
                      )}
                      <button onClick={() => { if (confirm("Delete this member?")) action(m.id, "delete"); }} title="Delete" className="p-1.5 rounded hover:bg-red-50 text-red-600 transition-colors">
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
      <p className="text-xs text-muted-foreground">{members.length} member{members.length !== 1 ? "s" : ""}</p>
    </div>
  );
}
