"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, Clock, Bookmark, BookmarkCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn, formatPrice, formatTimeAgo, getPublishCountdown, isNewListing, categoryLabel } from "@/lib/utils";
import type { ListingWithBroker } from "@/types";
import { useState } from "react";
import { AvatarImg } from "@/components/ui/avatar-img";

interface Props {
  listing: ListingWithBroker;
  role?: string;
}

export default function ListingCard({ listing, role }: Props) {
  const [saved, setSaved] = useState(listing.isSaved ?? false);
  const isPending = listing.status === "PENDING";
  const isNew = isNewListing(listing.publishedAt);

  const toggleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const method = saved ? "DELETE" : "POST";
    await fetch(`/api/listings/${listing.id}/save`, { method });
    setSaved(!saved);
  };

  const photo = listing.photos?.[0];

  return (
    <Link href={`/listings/${listing.id}`} className={cn("group block rounded-lg border bg-card overflow-hidden hover:shadow-md transition-shadow select-none", isPending && "opacity-90")}>
      {/* Photo */}
      <div className="relative aspect-[4/3] bg-muted overflow-hidden">
        {photo ? (
          <Image src={photo} alt={listing.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" unoptimized draggable={false} />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-4xl">🏛️</div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {isPending && (
            <Badge variant="pending" className="text-[10px]">
              {role === "VIP" || role === "OWNER"
                ? `Publishes in ${getPublishCountdown(listing.publishAt)}`
                : "Coming soon"}
            </Badge>
          )}
          {isNew && !isPending && <Badge variant="success" className="text-[10px]">New</Badge>}
        </div>

        {/* Save button */}
        <button onClick={toggleSave} className="absolute top-2 right-2 p-1.5 rounded-md bg-white/80 hover:bg-white transition-colors">
          {saved ? <BookmarkCheck className="h-4 w-4 text-primary" /> : <Bookmark className="h-4 w-4 text-muted-foreground" />}
        </button>

        {/* Category tag */}
        <div className="absolute bottom-2 left-2">
          <span className="text-[10px] font-medium bg-black/50 text-white px-2 py-0.5 rounded">
            {categoryLabel(listing.category)}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="font-semibold text-sm leading-tight line-clamp-2 mb-1">{listing.title}</p>
        <p className="text-lg font-bold text-primary">{formatPrice(listing.price)}</p>

        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{listing.location}</span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {isPending ? "Pending" : formatTimeAgo(listing.publishedAt ?? listing.submittedAt)}
          </span>
        </div>

        <div className="mt-2 pt-2 border-t flex items-center gap-1.5 text-xs text-muted-foreground">
          <AvatarImg src={(listing.submittedBy as any).avatar} name={listing.submittedBy.name} size={16} />
          <span className="truncate">{listing.submittedBy.name}</span>
        </div>
      </div>
    </Link>
  );
}
