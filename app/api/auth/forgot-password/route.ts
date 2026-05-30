import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email/send-password-reset-email";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // For security, don't reveal if user exists or not
      return NextResponse.json({ message: "If an account exists, a reset email has been sent." });
    }

    const token = crypto.randomUUID();
    const expires = new Date(Date.now() + 3600000); // 1 hour

    console.log(`[AUTH] Requesting reset for: ${email}`);

    const resetTokenModel = (prisma as any).passwordResetToken;
    
    if (!resetTokenModel) {
      console.error("[AUTH] PasswordResetToken model not found on Prisma Client. Please run npx prisma generate.");
      return NextResponse.json({ error: "System configuration error: Missing model" }, { status: 500 });
    }

    await resetTokenModel.create({
      data: { email, token, expires },
    });
    console.log(`[AUTH] Reset token created in DB`);

    const { data, error: emailError } = await sendPasswordResetEmail(email, token);
    
    if (emailError) {
      console.error("[AUTH] Resend error:", emailError);
      return NextResponse.json({ error: "Email delivery failed" }, { status: 500 });
    }

    console.log(`[AUTH] Email sent successfully:`, data);
    return NextResponse.json({ message: "Reset email sent." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("[AUTH] Forgot password error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
