"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin, Clock, MessageSquare, Bookmark, BookmarkCheck,
  ChevronLeft, ChevronRight, ArrowLeft, Tag
} from "lucide-react";
import { AvatarImg } from "@/components/ui/avatar-img";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice, formatDate, formatTimeAgo, getPublishCountdown, isNewListing, categoryLabel } from "@/lib/utils";
import Navbar from "@/components/layout/Navbar";
import type { ListingWithBroker } from "@/types";

export default function ListingDetailPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession();
  const router = useRouter();
  const user = session?.user as any;

  const [listing, setListing] = useState<ListingWithBroker | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [photoIndex, setPhotoIndex] = useState(0);
  const [saved, setSaved] = useState(false);
  const [startingChat, setStartingChat] = useState(false);
  const [mapCoords, setMapCoords] = useState<{ lat: number; lon: number } | null>(null);

  useEffect(() => {
    if (!session) return;
    fetch(`/api/listings/${params.id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then((data) => { setListing(data); setSaved(data.isSaved); })
      .catch(() => setError("Listing not found"))
      .finally(() => setLoading(false));
  }, [params.id, session]);

  // Geocode location for map
  useEffect(() => {
    if (!listing?.location) return;
    fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(listing.location)}&format=json&limit=1`,
      { headers: { "User-Agent": "TheFischerGroup/1.0" } }
    )
      .then((r) => r.json())
      .then((data) => {
        if (data[0]) setMapCoords({ lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) });
      })
      .catch(() => {});
  }, [listing?.location]);

  const toggleSave = async () => {
    if (!listing) return;
    const method = saved ? "DELETE" : "POST";
    await fetch(`/api/listings/${listing.id}/save`, { method });
    setSaved(!saved);
  };

  const startChat = async () => {
    if (!listing || !user) return;
    setStartingChat(true);
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId: listing.id, brokerId: listing.submittedBy.id }),
      });
      const conv = await res.json();
      router.push(`/messages?conv=${conv.id}`);
    } finally {
      setStartingChat(false);
    }
  };

  if (!session) return <><Navbar /><div className="flex justify-center items-center min-h-[60vh]"><Link href="/login" className="text-primary hover:underline">Sign in to view</Link></div></>;
  if (loading) return <><Navbar /><div className="flex justify-center items-center min-h-[60vh] text-muted-foreground">Loading...</div></>;
  if (error || !listing) return <><Navbar /><div className="flex flex-col items-center justify-center min-h-[60vh] gap-2"><p className="text-muted-foreground">Listing not found.</p><Link href="/feed" className="text-primary hover:underline text-sm">← Back to listings</Link></div></>;

  const photos = listing.photos.length > 0 ? listing.photos : [];
  const isPending = listing.status === "PENDING";
  const isOwn = user?.id === listing.submittedBy.id;

  return (
    <>
    <Navbar />
    <div className="mx-auto max-w-[1400px] px-4 lg:px-6 py-6">
      {/* Back */}
      <Link href="/feed" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-5">
        <ArrowLeft className="h-4 w-4" /> Back to listings
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
        {/* LEFT: Photos + Description */}
        <div className="space-y-6">
          {/* Photo carousel */}
          <div className="relative rounded-xl overflow-hidden bg-muted aspect-[16/10]">
            {photos.length > 0 ? (
              <>
                <Image src={photos[photoIndex]} alt={listing.title} fill className="object-cover" unoptimized />
                {photos.length > 1 && (
                  <>
                    <button onClick={() => setPhotoIndex((i) => (i - 1 + photos.length) % photos.length)} className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white hover:bg-black/60">
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button onClick={() => setPhotoIndex((i) => (i + 1) % photos.length)} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white hover:bg-black/60">
                      <ChevronRight className="h-5 w-5" />
                    </button>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {photos.map((_, i) => (
                        <button key={i} onClick={() => setPhotoIndex(i)} className={`h-1.5 rounded-full transition-all ${i === photoIndex ? "w-4 bg-white" : "w-1.5 bg-white/50"}`} />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-6xl">🏛️</div>
            )}

            {/* Badges */}
            <div className="absolute top-3 left-3 flex gap-2">
              {isPending && (
                <Badge variant="pending">
                  {user?.role === "VIP" || user?.role === "OWNER"
                    ? `Publishes in ${getPublishCountdown(listing.publishAt)}`
                    : "Coming soon"}
                </Badge>
              )}
              {isNewListing(listing.publishedAt) && !isPending && <Badge variant="success">New today</Badge>}
            </div>
          </div>

          {/* Thumbnail strip */}
          {photos.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {photos.map((p, i) => (
                <button key={i} onClick={() => setPhotoIndex(i)} className={`relative h-16 w-24 shrink-0 rounded overflow-hidden border-2 transition-colors ${i === photoIndex ? "border-primary" : "border-transparent"}`}>
                  <Image src={p} alt="" fill className="object-cover" unoptimized />
                </button>
              ))}
            </div>
          )}

          {/* Description */}
          <div className="rounded-lg border p-5 space-y-3">
            <h1 className="text-2xl font-bold">{listing.title}</h1>
            <div className="flex items-center gap-3 flex-wrap text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{listing.location}</span>
              <span className="flex items-center gap-1"><Tag className="h-4 w-4" />{categoryLabel(listing.category)}</span>
              <span className="flex items-center gap-1"><Clock className="h-4 w-4" />
                {isPending ? `Publishes ${formatDate(listing.publishAt)}` : `Posted ${formatTimeAgo(listing.publishedAt ?? listing.submittedAt)}`}
              </span>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">{listing.description}</p>
          </div>

          {/* Location map */}
          <div className="rounded-xl border overflow-hidden h-64">
            {mapCoords ? (
              <iframe
                title="Location map"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${mapCoords.lon - 0.04},${mapCoords.lat - 0.04},${mapCoords.lon + 0.04},${mapCoords.lat + 0.04}&layer=mapnik&marker=${mapCoords.lat},${mapCoords.lon}`}
                className="w-full h-full border-0"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground text-sm gap-1.5 animate-pulse">
                <MapPin className="h-4 w-4" /> {listing.location}
              </div>
            )}
          </div>
          {mapCoords && (
            <a
              href={`https://www.openstreetmap.org/?mlat=${mapCoords.lat}&mlon=${mapCoords.lon}#map=13/${mapCoords.lat}/${mapCoords.lon}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground -mt-3"
            >
              <MapPin className="h-3 w-3" /> Open in OpenStreetMap ↗
            </a>
          )}
        </div>

        {/* RIGHT: Price, broker, CTA */}
        <div className="space-y-4">
          {/* Price card */}
          <div className="rounded-lg border p-5 space-y-4 sticky top-[calc(3.5rem+1rem)]">
            <div>
              <p className="text-3xl font-bold text-primary">{formatPrice(listing.price)}</p>
              <p className="text-sm text-muted-foreground">{categoryLabel(listing.category)}</p>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-1 border-b"><span className="text-muted-foreground">Location</span><span className="font-medium">{listing.location}</span></div>
              <div className="flex justify-between py-1 border-b"><span className="text-muted-foreground">Status</span>
                <Badge variant={isPending ? "pending" : "success"} className="text-xs">{isPending ? "Coming soon" : "Active"}</Badge>
              </div>
              <div className="flex justify-between py-1 border-b"><span className="text-muted-foreground">Posted</span><span className="font-medium">{formatDate(listing.submittedAt)}</span></div>
              {!isPending && listing.publishedAt && (
                <div className="flex justify-between py-1"><span className="text-muted-foreground">Published</span><span className="font-medium">{formatDate(listing.publishedAt)}</span></div>
              )}
            </div>

            {/* Save button */}
            <Button variant="outline" className="w-full" onClick={toggleSave}>
              {saved ? <><BookmarkCheck className="h-4 w-4 mr-2 text-primary" />Saved</> : <><Bookmark className="h-4 w-4 mr-2" />Save listing</>}
            </Button>

            {/* Message broker CTA */}
            {!isOwn && (
              <Button className="w-full" onClick={startChat} disabled={startingChat}>
                <MessageSquare className="h-4 w-4 mr-2" />
                {startingChat ? "Opening chat..." : "Message broker"}
              </Button>
            )}

            {isOwn && (
              <div className="text-xs text-center text-muted-foreground bg-muted rounded p-2">This is your listing</div>
            )}
          </div>

          {/* Broker card */}
          <div className="rounded-lg border p-4 space-y-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Listed by</p>
            <div className="flex items-center gap-3">
              <AvatarImg src={(listing.submittedBy as any).avatar} name={listing.submittedBy.name} size={40} />
              <div>
                <p className="font-medium text-sm">{listing.submittedBy.name}</p>
                <div className="flex items-center gap-1.5">
                  <p className="text-xs text-muted-foreground">{listing.submittedBy.email}</p>
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Member since {formatDate(listing.submittedBy.createdAt)}</p>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
