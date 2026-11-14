import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { escapeHtml, sendMail } from "@/lib/email/mailer";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Messages go to CONTACT_EMAIL when set, otherwise to every administrator account. */
async function recipients(): Promise<string[]> {
  if (process.env.CONTACT_EMAIL) return [process.env.CONTACT_EMAIL];
  const admins = await prisma.user.findMany({ where: { role: "ADMIN" }, select: { email: true }, take: 5 });
  return admins.map((a) => a.email);
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const name = typeof body.name === "string" ? body.name.trim().slice(0, 120) : "";
    const email = typeof body.email === "string" ? body.email.trim().slice(0, 200) : "";
    const subject = typeof body.subject === "string" ? body.subject.trim().slice(0, 200) : "";
    const message = typeof body.message === "string" ? body.message.trim().slice(0, 5000) : "";

    if (!name || !message) return NextResponse.json({ error: "Please fill in your name and a message." }, { status: 400 });
    if (!EMAIL_RE.test(email)) return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });

    const to = await recipients();
    if (to.length === 0) {
      console.error("[CONTACT] No recipient configured (set CONTACT_EMAIL).");
      return NextResponse.json({ error: "Messages can't be delivered right now. Please try again later." }, { status: 503 });
    }

    const mail = await sendMail({
      to,
      replyTo: email,
      subject: `[CertGen] ${subject || `Message from ${name}`}`.replace(/[\r\n]+/g, " "),
      html: `
        <div style="font-family:-apple-system,'Segoe UI',Roboto,Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#0f172a;">
          <h2 style="margin:0 0 16px;font-size:18px;">New message from the contact form</h2>
          <p style="margin:0 0 4px;"><strong>From:</strong> ${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</p>
          <p style="margin:0 0 16px;"><strong>Subject:</strong> ${escapeHtml(subject || "—")}</p>
          <div style="background:#f5f4fa;padding:16px;border-radius:10px;white-space:pre-wrap;line-height:1.6;">${escapeHtml(message)}</div>
          <p style="margin:20px 0 0;font-size:13px;color:#94a3b8;">Reply to this email to answer ${escapeHtml(name)} directly.</p>
        </div>`,
    });

    if (!mail.ok) {
      return NextResponse.json({ error: "Your message couldn't be sent right now. Please try again later." }, { status: 502 });
    }
    return NextResponse.json({ sent: true });
  } catch (error) {
    console.error("[CONTACT_ERROR]", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
