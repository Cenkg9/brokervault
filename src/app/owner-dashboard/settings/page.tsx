"use client";

import { useState, useEffect } from "react";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OwnerSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/owner/settings").then((r) => r.json()).then((d) => setSettings(d)).finally(() => setLoading(false));
  }, []);

  const set = (k: string, v: string) => setSettings((s) => ({ ...s, [k]: v }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/owner/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (loading) return <div className="text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-6 max-w-xl">
      <h1 className="text-xl font-bold">Platform Settings</h1>

      <form onSubmit={handleSave} className="rounded-lg border bg-white p-5 space-y-5">
        <div className="space-y-1">
          <label className="text-sm font-medium">Platform Name</label>
          <input value={settings.app_name ?? "BrokerVault"} onChange={(e) => set("app_name", e.target.value)}
            className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
          <p className="text-xs text-muted-foreground">Display name shown across the platform.</p>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Publish delay (hours)</label>
          <input type="number" min="0" max="72" value={settings.publish_delay_hours ?? "12"} onChange={(e) => set("publish_delay_hours", e.target.value)}
            className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
          <p className="text-xs text-muted-foreground">
            How long new listings stay in PENDING state before auto-publishing. Currently: {settings.publish_delay_hours ?? 12}h.
            MEMBER and VIP users are subject to this delay. You can approve listings early from the Listings page.
          </p>
        </div>

        <Button type="submit" disabled={saving}>
          {saving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving...</> : saved ? "Saved!" : <><Save className="h-4 w-4 mr-2" />Save settings</>}
        </Button>
      </form>
    </div>
  );
}
