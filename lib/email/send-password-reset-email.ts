import { actionEmail, sendMail } from "@/lib/email/mailer";
import { siteUrl } from "@/lib/site";

export function sendPasswordResetEmail(email: string, token: string) {
  const url = `${siteUrl()}/reset-password?token=${token}`;
  return sendMail({
    to: email,
    subject: "Reset your CertGen password",
    html: actionEmail({
      heading: "Reset your password",
      body: "We received a request to reset the password for your CertGen account. Choose a new one with the button below.",
      buttonLabel: "Choose a new password",
      url,
      footnote: "This link expires in 1 hour. If you didn't ask for it, you can ignore this email — your password stays the same.",
    }),
  });
}
