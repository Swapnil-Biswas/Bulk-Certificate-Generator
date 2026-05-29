import { resend } from "@/lib/email/resend";

export async function sendVerificationEmail(
  email: string,
  token: string
) {
  const verifyUrl = `http://localhost:3000/verify-email?token=${token}`;

  const result = await resend.emails.send({
    from: "CertGen <noreply@mail.certificategenerator.space>",
    to: email,
    subject: "Verify your email address",
    html: `
      <div style="font-family: Arial, sans-serif;">
        <h2>Verify your email</h2>
        <p>Click the button below to verify your email address.</p>
        <a
          href="${verifyUrl}"
          style="
            display:inline-block;
            padding:12px 20px;
            background:#000;
            color:#fff;
            text-decoration:none;
            border-radius:8px;
          "
        >
          Verify Email
        </a>
      </div>
    `,
  });
  console.log(result);
}
