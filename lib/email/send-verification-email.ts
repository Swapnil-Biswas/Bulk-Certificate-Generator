import { actionEmail, sendMail } from "@/lib/email/mailer";
import { siteUrl } from "@/lib/site";

export function sendVerificationEmail(email: string, token: string) {
  const url = `${siteUrl()}/verify-email?token=${token}`;
  return sendMail({
    to: email,
    subject: "Confirm your email for CertGen",
    html: actionEmail({
      heading: "Confirm your email address",
      body: "Thanks for signing up for CertGen. Confirm this is your email address to finish creating your account.",
      buttonLabel: "Confirm email",
      url,
      footnote: "This link expires in 24 hours. If you didn't create an account, you can ignore this email.",
    }),
  });
}
