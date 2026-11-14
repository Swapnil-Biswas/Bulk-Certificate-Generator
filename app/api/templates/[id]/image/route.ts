import { prisma } from "@/lib/prisma";
import { getActiveSession } from "@/lib/auth/get-session";

/** Serves a template's background as a real image, so list pages don't have to embed it. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getActiveSession();
  if (!session) return new Response(null, { status: 401 });

  const { id } = await params;
  const template = await prisma.certificateTemplate.findFirst({
    where: { id, userId: session.user.id },
    select: { imagePath: true },
  });

  const match = template?.imagePath.match(/^data:(image\/[a-z0-9.+-]+);base64,/i);
  if (!template || !match) return new Response(null, { status: 404 });

  const bytes = Buffer.from(template.imagePath.slice(match[0].length), "base64");
  return new Response(bytes, {
    headers: {
      "Content-Type": match[1],
      "Content-Length": String(bytes.length),
      // The URL carries the template's last-edit time, so a cached copy never goes stale.
      "Cache-Control": "private, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
