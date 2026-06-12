import { resend } from "@/lib/email/resend";

export async function sendVerificationEmail(
  email: string,
  token: string
) {
  const verifyUrl = `https://certificategenerator.space/verify-email?token=${token}`;

  const result = await resend.emails.send({
    from: "CertGen <noreply@mail.certificategenerator.space>",
    to: email,
    subject: "Verify your CertGen account",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 16px;">
        <h2 style="color: #0f172a; margin-bottom: 16px;">Welcome to CertGen Studio</h2>
        <p style="color: #64748b; font-size: 16px; line-height: 1.5; margin-bottom: 24px;">
          Thanks for joining CertGen! Please click the button below to verify your email address and activate your design studio.
        </p>
        <a
          href="${verifyUrl}"
          style="
            display: inline-block;
            padding: 14px 28px;
            background-color: #7c3aed;
            color: #ffffff;
            text-decoration: none;
            border-radius: 12px;
            font-weight: bold;
            font-size: 14px;
          "
        >
          Verify Email Address
        </a>
        <p style="color: #94a3b8; font-size: 12px; margin-top: 32px; border-top: 1px solid #f1f5f9; padding-top: 16px;">
          If you didn't create an account, you can safely ignore this email.
        </p>
      </div>
    `,
  });
  console.log(result);
}
