import { Resend } from "resend";

const FROM = process.env.EMAIL_FROM ?? "The Fischer Group <onboarding@resend.dev>";

export async function sendVerificationEmail(to: string, name: string, code: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey === "re_YOUR_API_KEY_HERE") {
    console.warn("[email] RESEND_API_KEY not set — skipping verification email");
    return;
  }
  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: FROM,
    to,
    subject: `${code} is your Fischer Group verification code`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;color:#111">
        <h2 style="margin:0 0 8px;font-size:20px">Welcome, ${name}</h2>
        <p style="color:#555;margin:0 0 28px;line-height:1.6">
          Enter this code to verify your email and activate your broker account.
        </p>
        <div style="background:#f4f4f5;border-radius:10px;padding:24px;text-align:center;margin-bottom:28px">
          <span style="font-size:42px;font-weight:700;letter-spacing:12px;color:#111;font-family:monospace">${code}</span>
        </div>
        <p style="font-size:13px;color:#888;margin:0">
          This code expires in <strong>15 minutes</strong>. If you didn't sign up, ignore this email.
        </p>
        <hr style="margin:24px 0;border:none;border-top:1px solid #eee" />
        <p style="font-size:12px;color:#bbb;margin:0">The Fischer Group · Private Broker Network</p>
      </div>
    `,
  });
  if (error) {
    console.error("[email] Resend error:", error);
    throw new Error(error.message);
  }
}
