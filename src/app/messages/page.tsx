"use client";

import { Suspense } from "react";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { MessageSquare, ArrowLeft } from "lucide-react";
import { AvatarImg } from "@/components/ui/avatar-img";
import ChatPanel from "@/components/chat/ChatPanel";
import { formatTimeAgo } from "@/lib/utils";
import type { ConversationWithDetails } from "@/types";
import { connectSocket } from "@/lib/socket";

function MessagesPage() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const user = session?.user as any;

  const [conversations, setConversations] = useState<ConversationWithDetails[]>([]);
  const [active, setActive] = useState<ConversationWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const convParam = searchParams.get("conv");

  const loadConversations = async () => {
    const res = await fetch("/api/conversations");
    const data = await res.json();
    if (Array.isArray(data)) setConversations(data);
    return data;
  };

  useEffect(() => {
    if (!session) return;
    loadConversations().then((data) => {
      if (convParam) {
        const found = data.find((c: any) => c.id === convParam);
        if (found) setActive(found);
      }
    }).finally(() => setLoading(false));
  }, [session, convParam]);

  // Real-time: refresh conversation list on new messages
  useEffect(() => {
    if (!user?.id) return;
    const socket = connectSocket(user.id);
    socket.on("conversation-update", () => {
      loadConversations().then((data) => {
        if (active) {
          const updated = data.find((c: any) => c.id === active.id);
          if (updated) setActive(updated);
        }
      });
    });
    return () => { socket.off("conversation-update"); };
  }, [user?.id, active?.id]);

  const selectConv = (conv: ConversationWithDetails) => {
    setActive(conv);
    router.replace(`/messages?conv=${conv.id}`, { scroll: false });
    // Mark as read by refreshing
    setConversations((prev) => prev.map((c) => c.id === conv.id ? { ...c, unreadCount: 0 } : c));
  };

  const otherUser = (conv: ConversationWithDetails) =>
    conv.participantA.id === user?.id ? conv.participantB : conv.participantA;

  const conversationList = (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b">
        <h2 className="font-semibold text-sm">Messages</h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-sm text-muted-foreground">Loading...</div>
        ) : conversations.length === 0 ? (
          <div className="p-6 text-center text-sm text-muted-foreground">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-30" />
            No conversations yet. Message a broker from any listing.
          </div>
        ) : (
          conversations.map((conv) => {
            const other = otherUser(conv);
            const lastMsg = conv.messages?.[0];
            const isActive = active?.id === conv.id;

            return (
              <button key={conv.id} onClick={() => selectConv(conv)}
                className={`w-full text-left p-3 border-b hover:bg-accent transition-colors ${isActive ? "bg-accent" : ""}`}>
                <div className="flex items-start gap-2.5">
                  <AvatarImg src={(other as any).avatar} name={other.name} size={36} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className="font-medium text-sm truncate">{other.name}</p>
                      {(conv.unreadCount ?? 0) > 0 && (
                        <span className="shrink-0 h-4 w-4 flex items-center justify-center rounded-full bg-primary text-[9px] text-white font-bold">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{conv.listing.title}</p>
                    {lastMsg && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5 opacity-70">{lastMsg.body}</p>
                    )}
                    <p className="text-[10px] text-muted-foreground mt-0.5">{formatTimeAgo(conv.lastMessageAt)}</p>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );

  return (
    <div className="flex h-full border-t overflow-hidden">
      {/* Mobile: show list OR chat, never both */}
      {/* Desktop (md+): always show both columns */}

      {/* Conversation list — full screen on mobile when no active, sidebar on desktop */}
      <div className={`
        flex-col h-full border-r
        ${active ? "hidden md:flex md:w-80 md:shrink-0" : "flex w-full md:w-80 md:shrink-0"}
      `}>
        {conversationList}
      </div>

      {/* Chat panel — full screen on mobile when active, right column on desktop */}
      <div className={`
        flex-col h-full flex-1 overflow-hidden
        ${active ? "flex" : "hidden md:flex"}
      `}>
        {active ? (
          <>
            {/* Mobile back button */}
            <div className="md:hidden flex items-center gap-2 px-3 py-2 border-b bg-background">
              <button
                onClick={() => { setActive(null); router.replace("/messages", { scroll: false }); }}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <ChatPanel conversation={active} />
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-3">
            <MessageSquare className="h-12 w-12 opacity-20" />
            <p className="text-sm">Select a conversation</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MessagesPageWrapper() {
  return <Suspense><MessagesPage /></Suspense>;
}
