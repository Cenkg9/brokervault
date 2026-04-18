"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Camera, Loader2, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";
import Image from "next/image";

interface Profile {
  id: string; name: string; email: string; role: string;
  country: string | null; phone: string | null; avatar: string | null;
  emailVerified: boolean; createdAt: string;
}

const COUNTRIES = [
  "United Arab Emirates","United Kingdom","United States","France","Monaco","Switzerland",
  "Germany","Italy","Spain","Portugal","Netherlands","Belgium","Luxembourg","Austria",
  "Sweden","Norway","Denmark","Finland","Singapore","Hong Kong","Japan","Australia",
  "Canada","Brazil","South Africa","Saudi Arabia","Qatar","Kuwait","Bahrain","Oman",
  "Turkey","Greece","Cyprus","Malta","Ireland","New Zealand","Mexico","Argentina","Other",
];

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", country: "" });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return; }
    fetch("/api/user/profile").then((r) => r.json()).then((data) => {
      setProfile(data);
      setForm({ name: data.name ?? "", phone: data.phone ?? "", country: data.country ?? "" });
      if (data.avatar) setAvatarPreview(data.avatar);
    });
  }, [status]);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Local preview
    setAvatarPreview(URL.createObjectURL(file));
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/user/avatar", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Upload failed"); return; }
      setAvatarPreview(data.avatar);
      setSuccess("Profile picture updated.");
    } catch {
      setError("Upload failed. Try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setSuccess(""); setError("");
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, phone: form.phone || null, country: form.country || null }),
      });
      if (!res.ok) { setError("Failed to save. Try again."); return; }
      setSuccess("Profile saved successfully.");
    } finally {
      setSaving(false);
    }
  };

  if (!profile) return (
    <div className="flex flex-col h-screen bg-background">
      <Navbar />
      <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">Loading…</div>
    </div>
  );

  const initials = profile.name?.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <h1 className="text-2xl font-bold mb-6">Account settings</h1>

        {/* Email verification banner */}
        {!profile.emailVerified && (
          <div className="mb-6 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium">Email not verified</p>
              <p className="text-amber-700 mt-0.5">Check your inbox for the verification email we sent when you signed up.</p>
            </div>
          </div>
        )}
        {profile.emailVerified && (
          <div className="mb-6 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            Email verified
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Avatar */}
          <div className="rounded-lg border bg-card p-6">
            <h2 className="font-semibold mb-4">Profile picture</h2>
            <div className="flex items-center gap-6">
              <div className="relative shrink-0">
                <div className="h-20 w-20 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center">
                  {avatarPreview ? (
                    <Image src={avatarPreview} alt="Avatar" width={80} height={80} className="object-cover w-full h-full" unoptimized />
                  ) : (
                    <span className="text-2xl font-bold text-primary">{initials}</span>
                  )}
                </div>
                {uploading && (
                  <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                    <Loader2 className="h-5 w-5 text-white animate-spin" />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
                  <Camera className="h-4 w-4 mr-2" />
                  {uploading ? "Uploading…" : "Change photo"}
                </Button>
                <p className="text-xs text-muted-foreground">JPG, PNG or WebP · Max 5 MB</p>
              </div>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleAvatarChange} />
            </div>
          </div>

          {/* Profile info */}
          <div className="rounded-lg border bg-card p-6 space-y-4">
            <h2 className="font-semibold">Personal information</h2>

            {success && (
              <div className="flex items-center gap-2 rounded-md bg-green-50 text-green-700 text-sm p-3 border border-green-200">
                <CheckCircle2 className="h-4 w-4 shrink-0" />{success}
              </div>
            )}
            {error && (
              <div className="rounded-md bg-destructive/10 text-destructive text-sm p-3">{error}</div>
            )}

            <div className="space-y-1">
              <label className="text-sm font-medium">Full name</label>
              <input type="text" required value={form.name} onChange={(e) => set("name", e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Email</label>
              <input type="email" value={profile.email} disabled
                className="w-full h-9 rounded-md border border-input bg-muted px-3 text-sm text-muted-foreground cursor-not-allowed" />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Phone number</label>
              <input type="tel" placeholder="+44 7700 900000" value={form.phone} onChange={(e) => set("phone", e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Country</label>
              <select value={form.country} onChange={(e) => set("country", e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
                <option value="">Select your country</option>
                {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Member since</label>
              <p className="text-sm text-muted-foreground">{new Date(profile.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>
            </div>

            <Button type="submit" disabled={saving}>
              {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving…</> : "Save changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
