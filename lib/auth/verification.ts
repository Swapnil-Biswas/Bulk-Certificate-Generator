import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email/send-verification-email";
import { generateVerificationToken } from "@/lib/utils/token";

/** Replaces any earlier verification link for this address with a fresh one and emails it. */
export async function issueVerificationEmail(email: string) {
  const token = generateVerificationToken();
  await prisma.$transaction([
    prisma.verificationToken.deleteMany({ where: { identifier: email } }),
    prisma.verificationToken.create({
      data: { identifier: email, token, expires: new Date(Date.now() + 24 * 60 * 60 * 1000) },
    }),
  ]);
  return sendVerificationEmail(email, token);
}
