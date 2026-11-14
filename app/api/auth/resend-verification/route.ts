import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { issueVerificationEmail } from "@/lib/auth/verification";

const COOLDOWN_MS = 60_000;

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    if (!email) return NextResponse.json({ error: "Enter your email address." }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email }, select: { emailVerified: true } });

    // Same answer whether or not the address has an account.
    const generic = NextResponse.json({ sent: true });
    if (!user || user.emailVerified) return generic;

    // A token lives 24h, so one issued under a minute ago expires more than 23h59m from now.
    const recent = await prisma.verificationToken.findFirst({
      where: { identifier: email, expires: { gt: new Date(Date.now() + 24 * 60 * 60 * 1000 - COOLDOWN_MS) } },
    });
    if (recent) {
      return NextResponse.json({ error: "We just sent a link. Please wait a minute before asking again." }, { status: 429 });
    }

    const mail = await issueVerificationEmail(email);
    if (!mail.ok) {
      return NextResponse.json(
        { error: "We couldn't send the email right now. Please try again later or contact support." },
        { status: 502 }
      );
    }
    return generic;
  } catch (error) {
    console.error("[RESEND_VERIFICATION_ERROR]", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
