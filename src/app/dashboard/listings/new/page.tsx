"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2, ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

const CATEGORIES = [
  { value: "REAL_ESTATE", label: "Real Estate" },
  { value: "LUXURY_CARS", label: "Luxury Cars" },
  { value: "YACHTS", label: "Yachts" },
  { value: "OTHER", label: "Other" },
];

export default function NewListingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: "", description: "", category: "REAL_ESTATE",
    price: "", location: "",
  });
  const [priceDisplay, setPriceDisplay] = useState("");

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Strip everything except digits
    const raw = e.target.value.replace(/\D/g, "");
    setForm((f) => ({ ...f, price: raw }));
    setPriceDisplay(raw ? Number(raw).toLocaleString("en-US") : "");
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    const remaining = 10 - photos.length;
    const toUpload = files.slice(0, remaining);

    setUploading(true);
    try {
      const urls = await Promise.all(
        toUpload.map(async (file) => {
          const fd = new FormData();
          fd.append("file", file);
          const res = await fetch("/api/listings/upload", { method: "POST", body: fd });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Upload failed");
          return data.url as string;
        })
      );
      setPhotos((p) => [...p, ...urls]);
    } catch (err: any) {
      setError(err.message ?? "Photo upload failed");
    } finally {
      setUploading(false);
      // reset so same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removePhoto = (i: number) => setPhotos((p) => p.filter((_, j) => j !== i));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, price: Number(form.price), photos }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to create listing"); return; }
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  if (!session) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Post a new listing</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Your listing will be reviewed and published automatically after 12 hours.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-lg border bg-card p-6 space-y-5">
        {error && <div className="rounded-md bg-destructive/10 text-destructive text-sm p-3">{error}</div>}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Title */}
          <div className="sm:col-span-2 space-y-1">
            <label className="text-sm font-medium">Title *</label>
            <input required value={form.title} onChange={(e) => set("title", e.target.value)}
              placeholder="e.g. Penthouse Suite — City Center"
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
          </div>

          {/* Category */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Category *</label>
            <select required value={form.category} onChange={(e) => set("category", e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
              {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>

          {/* Price */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Price (EUR) *</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">€</span>
              <input
                required
                inputMode="numeric"
                value={priceDisplay}
                onChange={handlePriceChange}
                placeholder="1,500,000"
                className="w-full h-9 rounded-md border border-input bg-background pl-7 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>

          {/* Location */}
          <div className="sm:col-span-2 space-y-1">
            <label className="text-sm font-medium">Location *</label>
            <input required value={form.location} onChange={(e) => set("location", e.target.value)}
              placeholder="e.g. Monaco, Monte-Carlo"
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
          </div>

          {/* Description */}
          <div className="sm:col-span-2 space-y-1">
            <label className="text-sm font-medium">Description *</label>
            <textarea required value={form.description} onChange={(e) => set("description", e.target.value)}
              rows={5} placeholder="Describe the listing in detail..."
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none" />
          </div>

          {/* Photos */}
          <div className="sm:col-span-2 space-y-2">
            <label className="text-sm font-medium">
              Photos (up to 10) <span className="text-muted-foreground font-normal">— {photos.length}/10</span>
            </label>

            {/* Upload zone */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || photos.length >= 10}
              className="w-full h-24 rounded-lg border-2 border-dashed border-input hover:border-primary/50 hover:bg-muted/40 transition-colors flex flex-col items-center justify-center gap-1.5 text-muted-foreground disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <><Loader2 className="h-5 w-5 animate-spin" /><span className="text-xs">Uploading…</span></>
              ) : (
                <><ImagePlus className="h-5 w-5" /><span className="text-xs">Click to add photos</span><span className="text-xs opacity-60">JPG, PNG, WebP or GIF · max 10MB each</span></>
              )}
            </button>

            {/* Thumbnails */}
            {photos.length > 0 && (
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 mt-2">
                {photos.map((url, i) => (
                  <div key={i} className="relative aspect-square rounded-md overflow-hidden border border-input group">
                    <Image src={url} alt={`photo ${i + 1}`} fill className="object-cover" sizes="120px" />
                    <button
                      type="button"
                      onClick={() => removePhoto(i)}
                      className="absolute top-0.5 right-0.5 bg-black/60 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3 text-white" />
                    </button>
                  </div>
                ))}
                {/* Add more slot */}
                {photos.length < 10 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="aspect-square rounded-md border-2 border-dashed border-input flex items-center justify-center text-muted-foreground hover:border-primary/50 hover:bg-muted/40 transition-colors disabled:opacity-50"
                  >
                    <ImagePlus className="h-5 w-5" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={loading || uploading}>
            {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Submitting…</> : "Submit listing"}
          </Button>
          <Button type="button" variant="ghost" onClick={() => router.push("/dashboard")}>Cancel</Button>
        </div>

        <p className="text-xs text-muted-foreground border-t pt-3">
          Your listing will be published automatically in approximately 12 hours. You can track the countdown on your dashboard.
        </p>
      </form>
    </div>
  );
}
