import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();

    const resetTokenModel = (prisma as any).passwordResetToken;
    
    if (!resetTokenModel) {
      console.error("[AUTH] PasswordResetToken model not found on Prisma Client.");
      return NextResponse.json({ error: "System configuration error" }, { status: 500 });
    }

    const resetToken = await resetTokenModel.findUnique({
      where: { token },
    });

    if (!resetToken || resetToken.expires < new Date()) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { email: resetToken.email },
      data: { passwordHash },
    });

    // Delete the token after use
    await resetTokenModel.delete({
      where: { id: resetToken.id },
    });

    return NextResponse.json({ message: "Password reset successful." });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
