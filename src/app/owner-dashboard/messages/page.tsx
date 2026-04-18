"use client";

import { useState, useEffect } from "react";
import { Trash2, Eye } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Conv {
  id: string;
  listing: { id: string; title: string };
  participantA: { id: string; name: string; email: string };
  participantB: { id: string; name: string; email: string };
  _count: { messages: number };
  lastMessageAt: string;
}

export default function OwnerMessagesPage() {
  const [convs, setConvs] = useState<Conv[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => fetch("/api/owner/conversations").then((r) => r.json()).then((d) => { if (Array.isArray(d)) setConvs(d); });

  useEffect(() => { load().finally(() => setLoading(false)); }, []);

  const deleteConv = async (id: string) => {
    if (!confirm("Delete this conversation? All messages will be lost.")) return;
    await fetch("/api/owner/conversations", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    load();
  };

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold">Conversations</h1>

      <div className="rounded-lg border bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-muted/40 border-b">
              {["Participants", "Listing", "Messages", "Last activity", "Actions"].map((h) => (
                <th key={h} className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Loading...</td></tr>
              ) : convs.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No conversations yet</td></tr>
              ) : convs.map((c) => (
                <tr key={c.id} className="border-b last:border-0 hover:bg-muted/20">
                  <td className="px-4 py-3">
                    <div className="text-xs space-y-0.5">
                      <p className="font-medium">{c.participantA.name}</p>
                      <p className="text-muted-foreground">{c.participantA.email}</p>
                      <p className="text-muted-foreground">↕ {c.participantB.name}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <a href={`/listings/${c.listing.id}`} className="text-xs hover:text-primary hover:underline line-clamp-2 max-w-[160px]">
                      {c.listing.title}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-center font-medium">{c._count.messages}</td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{formatDate(c.lastMessageAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <a href={`/messages?conv=${c.id}`} className="p-1.5 rounded hover:bg-blue-50 text-blue-600 transition-colors" title="View thread">
                        <Eye className="h-4 w-4" />
                      </a>
                      <button onClick={() => deleteConv(c.id)} className="p-1.5 rounded hover:bg-red-50 text-red-600 transition-colors" title="Delete">
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
      <p className="text-xs text-muted-foreground">{convs.length} conversation{convs.length !== 1 ? "s" : ""}</p>
    </div>
  );
}
