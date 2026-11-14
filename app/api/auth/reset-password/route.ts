import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const token = typeof body.token === "string" ? body.token : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!token) return NextResponse.json({ error: "This reset link is incomplete." }, { status: 400 });
    if (password.length < 8 || password.length > 128) {
      return NextResponse.json({ error: "Password must be between 8 and 128 characters." }, { status: 400 });
    }

    const resetToken = await prisma.passwordResetToken.findUnique({ where: { token } });
    if (!resetToken || resetToken.expires < new Date()) {
      return NextResponse.json(
        { error: "This reset link has expired or was already used. Request a new one from the login page." },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.$transaction([
      prisma.user.update({
        where: { email: resetToken.email },
        data: { passwordHash },
      }),
      // Receiving the reset email also proves the address belongs to them.
      prisma.user.updateMany({
        where: { email: resetToken.email, emailVerified: null },
        data: { emailVerified: new Date() },
      }),
      prisma.passwordResetToken.deleteMany({ where: { email: resetToken.email } }),
    ]);

    return NextResponse.json({ message: "Password updated." });
  } catch (error) {
    console.error("[RESET_PASSWORD_ERROR]", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
