import { resend } from "@/lib/email/resend";

export async function sendPasswordResetEmail(
  email: string,
  token: string
) {
  const resetUrl = `http://localhost:3000/reset-password?token=${token}`;

  const result = await resend.emails.send({
    from: "CertGen <noreply@mail.certificategenerator.space>",
    to: email,
    subject: "Reset your password",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 16px;">
        <h2 style="color: #0f172a; margin-bottom: 16px;">Reset your password</h2>
        <p style="color: #64748b; font-size: 16px; line-height: 1.5; margin-bottom: 24px;">
          You requested to reset your password for your CertGen account. Click the button below to set a new password.
        </p>
        <a
          href="${resetUrl}"
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
          Reset Password
        </a>
        <p style="color: #94a3b8; font-size: 12px; margin-top: 32px; border-top: 1px solid #f1f5f9; pt-16;">
          If you didn't request this, you can safely ignore this email. This link will expire in 1 hour.
        </p>
      </div>
    `,
  });
  console.log(result);
  return result;
}
