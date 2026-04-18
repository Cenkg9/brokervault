"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const COUNTRIES = [
  "United Arab Emirates","United Kingdom","United States","France","Monaco","Switzerland",
  "Germany","Italy","Spain","Portugal","Netherlands","Belgium","Luxembourg","Austria",
  "Sweden","Norway","Denmark","Finland","Singapore","Hong Kong","Japan","Australia",
  "Canada","Brazil","South Africa","Saudi Arabia","Qatar","Kuwait","Bahrain","Oman",
  "Turkey","Greece","Cyprus","Malta","Ireland","New Zealand","Mexico","Argentina","Other",
];

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", phone: "", country: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) { setError("Passwords do not match"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          country: form.country || undefined,
          phone: form.phone || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Registration failed"); return; }

      // Sign in silently then redirect to OTP verification
      await signIn("credentials", { email: form.email, password: form.password, redirect: false });
      router.push(`/verify-email?email=${encodeURIComponent(form.email)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="flex justify-center">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Shield className="h-6 w-6 text-primary" />
          </div>
        </div>
        <h1 className="text-2xl font-bold">The Fischer Group</h1>
        <p className="text-sm text-muted-foreground">Create your broker account</p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-lg border bg-card p-6 space-y-4">
        {error && <div className="rounded-md bg-destructive/10 text-destructive text-sm p-3">{error}</div>}

        {/* Name */}
        <div className="space-y-1">
          <label className="text-sm font-medium">Full name</label>
          <input type="text" required placeholder="James Harrington" value={form.name} onChange={(e) => set("name", e.target.value)}
            className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
        </div>

        {/* Email */}
        <div className="space-y-1">
          <label className="text-sm font-medium">Email</label>
          <input type="email" required placeholder="james@example.com" value={form.email} onChange={(e) => set("email", e.target.value)}
            className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
        </div>

        {/* Phone */}
        <div className="space-y-1">
          <label className="text-sm font-medium">Phone number</label>
          <input type="tel" placeholder="+44 7700 900000" value={form.phone} onChange={(e) => set("phone", e.target.value)}
            className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
        </div>

        {/* Country */}
        <div className="space-y-1">
          <label className="text-sm font-medium">Country</label>
          <select value={form.country} onChange={(e) => set("country", e.target.value)}
            className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
            <option value="">Select your country</option>
            {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Password */}
        <div className="space-y-1">
          <label className="text-sm font-medium">Password</label>
          <input type="password" required placeholder="Min. 8 characters" value={form.password} onChange={(e) => set("password", e.target.value)}
            className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
        </div>

        {/* Confirm password */}
        <div className="space-y-1">
          <label className="text-sm font-medium">Confirm password</label>
          <input type="password" required placeholder="" value={form.confirm} onChange={(e) => set("confirm", e.target.value)}
            className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create account"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Already a member?{" "}
        <Link href="/login" className="text-primary hover:underline font-medium">Sign in</Link>
      </p>
    </div>
  );
}
