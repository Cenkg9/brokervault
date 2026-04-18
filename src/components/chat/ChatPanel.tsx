"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { Send, Check, CheckCheck, MapPin, ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatDateTime, formatPrice, categoryLabel } from "@/lib/utils";
import type { MessageWithSender, ConversationWithDetails } from "@/types";
import { connectSocket } from "@/lib/socket";
import { AvatarImg } from "@/components/ui/avatar-img";

interface Props {
  conversation: ConversationWithDetails;
}

/**
 * A message bubble that has the listing card embedded at the top —
 * exactly like replying to an Instagram story.
 */
function StoryReplyBubble({
  listing,
  msg,
  isMe,
}: {
  listing: ConversationWithDetails["listing"];
  msg: MessageWithSender;
  isMe: boolean;
}) {
  const photo = listing.photos?.[0];

  return (
    <div className={`flex items-end gap-2 ${isMe ? "justify-end" : "justify-start"}`}>
      {!isMe && (
        <AvatarImg
          src={(msg.sender as any).avatar}
          name={msg.sender.name}
          size={24}
          className="mb-0.5 shrink-0"
        />
      )}

      <div
        className={`max-w-[260px] rounded-2xl overflow-hidden text-sm
          ${isMe
            ? "bg-primary text-primary-foreground rounded-br-sm"
            : "bg-muted rounded-bl-sm border border-border/50"
          }`}
      >
        {/* Listing card — the "story" being replied to */}
        <Link
          href={`/listings/${listing.id}`}
          className="block group relative"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative h-36 w-full bg-black/10">
            {photo ? (
              <Image
                src={photo}
                alt={listing.title}
                fill
                className="object-cover group-hover:brightness-90 transition"
                unoptimized
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-3xl">🏛️</div>
            )}
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            {/* Info overlaid on photo */}
            <div className="absolute bottom-0 inset-x-0 px-3 py-2">
              <p className="text-white text-xs font-semibold leading-tight line-clamp-1">{listing.title}</p>
              <p className="text-white/90 text-xs font-bold">{formatPrice(listing.price)}</p>
              <p className="text-white/70 text-[10px] flex items-center gap-0.5 mt-0.5">
                <MapPin className="h-2.5 w-2.5 shrink-0" />
                {listing.location} · {categoryLabel(listing.category)}
              </p>
            </div>
            {/* View icon */}
            <div className="absolute top-2 right-2 bg-black/40 rounded-full p-1 opacity-0 group-hover:opacity-100 transition">
              <ExternalLink className="h-3 w-3 text-white" />
            </div>
          </div>
        </Link>

        {/* Divider between listing and message */}
        <div className={`h-px ${isMe ? "bg-primary-foreground/20" : "bg-border/60"}`} />

        {/* The actual message text */}
        <div className="px-3.5 py-2">
          <p className="leading-relaxed break-words">{msg.body}</p>
          <div className={`flex items-center gap-1 mt-0.5 text-[10px] ${isMe ? "text-primary-foreground/70 justify-end" : "text-muted-foreground"}`}>
            {formatDateTime(msg.sentAt)}
            {isMe && (msg.readAt ? <CheckCheck className="h-3 w-3" /> : <Check className="h-3 w-3" />)}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Shown when there are no messages yet — just the listing context card, centered.
 */
function ListingContextCard({ listing }: { listing: ConversationWithDetails["listing"] }) {
  const photo = listing.photos?.[0];
  return (
    <div className="flex flex-col items-center gap-3 py-6">
      <p className="text-xs text-muted-foreground">Conversation about</p>
      <Link
        href={`/listings/${listing.id}`}
        className="group w-52 rounded-2xl overflow-hidden border border-border/60 bg-muted hover:shadow-md transition-shadow"
      >
        <div className="relative h-32 bg-black/10">
          {photo ? (
            <Image src={photo} alt={listing.title} fill className="object-cover group-hover:brightness-90 transition" unoptimized />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-3xl">🏛️</div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-0 inset-x-0 px-3 py-2">
            <p className="text-white text-xs font-semibold line-clamp-1">{listing.title}</p>
            <p className="text-white/90 text-xs font-bold">{formatPrice(listing.price)}</p>
          </div>
        </div>
        <div className="px-3 py-2 flex items-center justify-center gap-1 text-xs text-primary font-medium">
          <ExternalLink className="h-3 w-3" /> View listing
        </div>
      </Link>
      <p className="text-xs text-muted-foreground">Send a message to start the conversation</p>
    </div>
  );
}

export default function ChatPanel({ conversation }: Props) {
  const { data: session } = useSession();
  const userId = (session?.user as any)?.id;
  const [messages, setMessages] = useState<MessageWithSender[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const otherUser = conversation.participantA.id === userId
    ? conversation.participantB
    : conversation.participantA;

  // Load messages
  useEffect(() => {
    fetch(`/api/conversations/${conversation.id}/messages`)
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setMessages(data); });
  }, [conversation.id]);

  // Real-time — only add messages from the other person
  useEffect(() => {
    if (!userId) return;
    const socket = connectSocket(userId);
    socket.emit("join-conversation", conversation.id);
    socket.on("new-message", (msg: MessageWithSender) => {
      if (msg.senderId !== userId) {
        setMessages((prev) => prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]);
      }
    });
    return () => {
      socket.emit("leave-conversation", conversation.id);
      socket.off("new-message");
    };
  }, [conversation.id, userId]);

  // Scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sending) return;
    setSending(true);
    const text = input.trim();
    setInput("");
    try {
      const res = await fetch(`/api/conversations/${conversation.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: text }),
      });
      if (res.ok) {
        const msg = await res.json();
        setMessages((prev) => prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]);
      }
    } catch {
      setInput(text);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b px-4 py-3 flex items-center gap-3">
        <AvatarImg src={(otherUser as any).avatar} name={otherUser.name} size={32} />
        <div>
          <p className="text-sm font-medium">{otherUser.name}</p>
          <p className="text-xs text-muted-foreground">{otherUser.email}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        {messages.length === 0 ? (
          /* No messages yet — show centered listing card */
          <ListingContextCard listing={conversation.listing} />
        ) : (
          messages.map((msg, i) => {
            const isMe = msg.senderId === userId;
            const isFirst = i === 0;

            // First message gets the listing card embedded (story-reply style)
            if (isFirst) {
              return (
                <StoryReplyBubble
                  key={msg.id}
                  listing={conversation.listing}
                  msg={msg}
                  isMe={isMe}
                />
              );
            }

            // All other messages are normal bubbles
            return (
              <div key={msg.id} className={`flex items-end gap-2 ${isMe ? "justify-end" : "justify-start"}`}>
                {!isMe && (
                  <AvatarImg src={(msg.sender as any).avatar} name={msg.sender.name} size={24} className="mb-0.5" />
                )}
                <div className={`max-w-[68%] rounded-2xl px-3.5 py-2 text-sm ${isMe ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-muted rounded-bl-sm"}`}>
                  <p className="leading-relaxed break-words">{msg.body}</p>
                  <div className={`flex items-center gap-1 mt-0.5 text-[10px] ${isMe ? "text-primary-foreground/70 justify-end" : "text-muted-foreground"}`}>
                    {formatDateTime(msg.sentAt)}
                    {isMe && (msg.readAt ? <CheckCheck className="h-3 w-3" /> : <Check className="h-3 w-3" />)}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="border-t p-3 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Message ${otherUser.name}...`}
          className="flex-1 h-9 rounded-full border border-input bg-background px-4 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        />
        <Button type="submit" size="icon" disabled={!input.trim() || sending}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
