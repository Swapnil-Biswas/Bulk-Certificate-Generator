import { Resend } from "resend";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { name, email, subject, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Replace this with your actual email when provided
    const targetEmail = process.env.CONTACT_EMAIL || "swapnil@certificategenerator.space";

    const { data, error } = await resend.emails.send({
      from: "CertGen Support <onboarding@resend.dev>",
      to: [targetEmail],
      subject: `[CertGen Support] ${subject || "Inquiry from " + name}`,
      replyTo: email,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <h2 style="color: #7c3aed; border-bottom: 2px solid #7c3aed; padding-bottom: 10px;">New Support Inquiry</h2>
          <p><strong>From:</strong> ${name} (${email})</p>
          <p><strong>Subject:</strong> ${subject || "N/A"}</p>
          <div style="background: #f4f4f4; padding: 15px; border-radius: 8px; margin-top: 20px;">
            <p style="white-space: pre-wrap;">${message}</p>
          </div>
          <p style="font-size: 12px; color: #666; margin-top: 30px; border-top: 1px solid #eee; pt: 10px;">
            This email was sent from the CertGen Contact Form.
          </p>
        </div>
      `,
    });

    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    return NextResponse.json({ message: "Inquiry transmitted successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
