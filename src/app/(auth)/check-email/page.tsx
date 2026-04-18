import Link from "next/link";
import { Shield, Mail } from "lucide-react";

export default function CheckEmailPage() {
  return (
    <div className="space-y-6 text-center">
      <div className="flex justify-center">
        <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
          <Mail className="h-7 w-7 text-primary" />
        </div>
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Check your email</h1>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
          We sent a verification link to your email address. Click it to activate your account.
        </p>
      </div>
      <div className="rounded-lg border bg-card p-5 text-left space-y-3 text-sm text-muted-foreground">
        <p>• The link expires in <strong className="text-foreground">24 hours</strong></p>
        <p>• Check your spam folder if you don't see it</p>
        <p>• You can still sign in — a reminder will show until verified</p>
      </div>
      <p className="text-sm text-muted-foreground">
        Already verified?{" "}
        <Link href="/login" className="text-primary hover:underline font-medium">Sign in</Link>
      </p>
    </div>
  );
}
