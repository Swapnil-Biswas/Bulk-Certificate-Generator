import { resend } from "@/lib/email/resend";

const FROM = process.env.EMAIL_FROM || "CertGen <noreply@mail.certificategenerator.space>";

export type MailResult = { ok: true } | { ok: false; error: string };

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Sends one email and reports the outcome instead of throwing, so callers can tell the user what happened. */
export async function sendMail(options: {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}): Promise<MailResult> {
  try {
    const { error } = await resend.emails.send({ from: FROM, ...options });
    if (error) {
      console.error(`[EMAIL] "${options.subject}" was not sent: ${error.name} — ${error.message}`);
      return { ok: false, error: error.message };
    }
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown email error";
    console.error(`[EMAIL] "${options.subject}" failed: ${message}`);
    return { ok: false, error: message };
  }
}

/** Shared layout for transactional emails: one heading, one paragraph, one button. */
export function actionEmail(options: {
  heading: string;
  body: string;
  buttonLabel: string;
  url: string;
  footnote: string;
}): string {
  const { heading, body, buttonLabel, url, footnote } = options;
  return `
  <div style="background:#f5f4fa;padding:32px 16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
    <div style="max-width:520px;margin:0 auto;background:#ffffff;border:1px solid #e7e5f0;border-radius:16px;padding:36px;">
      <p style="margin:0 0 28px;font-size:16px;font-weight:700;color:#0f172a;">CertGen</p>
      <h1 style="margin:0 0 12px;font-size:22px;line-height:1.3;color:#0f172a;">${heading}</h1>
      <p style="margin:0 0 28px;font-size:15px;line-height:1.6;color:#475569;">${body}</p>
      <a href="${url}" style="display:inline-block;padding:13px 26px;background:#7c3aed;color:#ffffff;text-decoration:none;border-radius:10px;font-weight:600;font-size:15px;">${buttonLabel}</a>
      <p style="margin:28px 0 0;font-size:13px;line-height:1.6;color:#94a3b8;">Button not working? Paste this link into your browser:<br><a href="${url}" style="color:#7c3aed;word-break:break-all;">${url}</a></p>
      <p style="margin:24px 0 0;padding-top:20px;border-top:1px solid #eef0f4;font-size:13px;line-height:1.6;color:#94a3b8;">${footnote}</p>
    </div>
  </div>`;
}
