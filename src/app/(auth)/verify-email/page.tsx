"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Shield, Loader2, CheckCircle2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

function VerifyEmailForm() {
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get("email") ?? "";

  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  // Auto-focus first box
  useEffect(() => { inputs.current[0]?.focus(); }, []);

  const handleChange = (i: number, val: string) => {
    const v = val.replace(/\D/g, "").slice(-1); // digits only, 1 char
    const next = [...digits];
    next[i] = v;
    setDigits(next);
    setError("");
    if (v && i < 5) inputs.current[i + 1]?.focus();
    // Auto-submit when all 6 filled
    if (v && next.every((d) => d !== "")) submitCode(next.join(""));
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      inputs.current[i - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      const next = pasted.split("");
      setDigits(next);
      inputs.current[5]?.focus();
      submitCode(pasted);
    }
  };

  const submitCode = async (code: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Invalid code");
        setDigits(["", "", "", "", "", ""]);
        inputs.current[0]?.focus();
      } else {
        router.push("/login?verified=1");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setResent(false);
    try {
      await fetch("/api/auth/verify-email", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setResent(true);
      setDigits(["", "", "", "", "", ""]);
      inputs.current[0]?.focus();
    } finally {
      setResending(false);
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
        <h1 className="text-2xl font-bold">Check your email</h1>
        <p className="text-sm text-muted-foreground">
          We sent a 6-digit code to<br />
          <span className="font-medium text-foreground">{email}</span>
        </p>
      </div>

      <div className="rounded-lg border bg-card p-6 space-y-5">
        {error && (
          <div className="rounded-md bg-destructive/10 text-destructive text-sm p-3 text-center">{error}</div>
        )}
        {resent && (
          <div className="flex items-center justify-center gap-2 rounded-md bg-green-50 text-green-700 text-sm p-3 border border-green-200">
            <CheckCircle2 className="h-4 w-4" /> New code sent!
          </div>
        )}

        {/* OTP boxes */}
        <div className="flex justify-center gap-2" onPaste={handlePaste}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => { inputs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className={`w-11 h-14 text-center text-xl font-bold rounded-lg border-2 bg-background focus:outline-none transition-colors ${
                d ? "border-primary text-foreground" : "border-input text-muted-foreground"
              } ${error ? "border-destructive" : ""} focus:border-primary`}
            />
          ))}
        </div>

        <Button
          className="w-full"
          disabled={loading || digits.some((d) => !d)}
          onClick={() => submitCode(digits.join(""))}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify account"}
        </Button>

        <div className="text-center">
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1.5 mx-auto transition-colors"
          >
            {resending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
            Resend code
          </button>
        </div>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Already verified?{" "}
        <Link href="/login" className="text-primary hover:underline font-medium">Sign in</Link>
      </p>
    </div>
  );
}

export default function VerifyEmailPage() {
  return <Suspense><VerifyEmailForm /></Suspense>;
}
