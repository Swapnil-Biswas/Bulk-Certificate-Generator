import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations/auth";
import { issueVerificationEmail } from "@/lib/auth/verification";

export async function POST(req: Request) {
  try {
    const parsed = registerSchema.safeParse(await req.json());
    if (!parsed.success) {
      const first = parsed.error.issues[0]?.message || "Please check the details you entered.";
      return NextResponse.json({ error: first }, { status: 400 });
    }

    const { name, email, password } = parsed.data;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists. Try logging in instead." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.user.create({
      data: { name: name.trim(), email, passwordHash, approvalStatus: "PENDING" },
    });

    // The account exists either way; tell the client whether the email actually went out.
    const mail = await issueVerificationEmail(email);

    return NextResponse.json({ emailSent: mail.ok }, { status: 201 });
  } catch (error) {
    console.error("[REGISTER_ERROR]", error);
    return NextResponse.json({ error: "Something went wrong on our side. Please try again." }, { status: 500 });
  }
}
