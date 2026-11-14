import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email/send-password-reset-email";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    if (!email) return NextResponse.json({ error: "Enter your email address." }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });

    // Same answer whether or not the address has an account.
    const generic = NextResponse.json({ message: "If an account exists, a reset email has been sent." });
    if (!user) return generic;

    const token = crypto.randomUUID();
    await prisma.$transaction([
      prisma.passwordResetToken.deleteMany({ where: { email } }),
      prisma.passwordResetToken.create({
        data: { email, token, expires: new Date(Date.now() + 60 * 60 * 1000) },
      }),
    ]);

    const mail = await sendPasswordResetEmail(email, token);
    if (!mail.ok) {
      return NextResponse.json(
        { error: "We couldn't send the reset email right now. Please try again later." },
        { status: 502 }
      );
    }
    return generic;
  } catch (error) {
    console.error("[FORGOT_PASSWORD_ERROR]", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
