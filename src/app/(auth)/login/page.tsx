"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Shield, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Suspense } from "react";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const verified = params.get("verified") === "1";
  const tokenError = params.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await signIn("credentials", { email, password, redirect: false });
      if (res?.error) {
        setError(res.error === "Account suspended" ? "Your account has been suspended." : "Invalid email or password.");
      } else {
        router.push("/feed");
        router.refresh();
      }
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
        <p className="text-sm text-muted-foreground">Private listing network — members only</p>
      </div>

      {verified && (
        <div className="flex items-center gap-2 rounded-md bg-green-50 text-green-700 text-sm p-3 border border-green-200">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Email verified! You can now sign in.
        </div>
      )}
      {tokenError === "token-expired" && (
        <div className="rounded-md bg-amber-50 text-amber-700 text-sm p-3 border border-amber-200">
          Verification link expired. Sign in and we'll send a new one.
        </div>
      )}
      {tokenError === "invalid-token" && (
        <div className="rounded-md bg-destructive/10 text-destructive text-sm p-3">
          Invalid verification link. Please try again.
        </div>
      )}

      <form onSubmit={handleSubmit} className="rounded-lg border bg-card p-6 space-y-4">
        {error && <div className="rounded-md bg-destructive/10 text-destructive text-sm p-3">{error}</div>}

        <div className="space-y-1">
          <label className="text-sm font-medium">Email</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Password</label>
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
            className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-primary hover:underline font-medium">Create account</Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return <Suspense><LoginForm /></Suspense>;
}
