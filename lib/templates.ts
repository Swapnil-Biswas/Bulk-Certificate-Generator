import { prisma } from "@/lib/prisma";

const MAX_IMAGE_CHARS = 24 * 1024 * 1024; // ~17 MB of image data once base64-decoded
const CATEGORIES = ["Custom", "Participation", "Achievement", "Workshop", "Appreciation"];

export type TemplateInput = {
  name?: string;
  category?: string;
  imagePath?: string;
  fields?: unknown[];
  canvasMeta?: Record<string, unknown>;
};

/** Validates a template payload from the editor. Returns the cleaned data or a message for the user. */
export function parseTemplateInput(body: unknown, { partial }: { partial: boolean }): { data: TemplateInput } | { error: string } {
  if (!body || typeof body !== "object") return { error: "Invalid request." };
  const b = body as Record<string, unknown>;
  const data: TemplateInput = {};

  if (b.name !== undefined || !partial) {
    const name = typeof b.name === "string" ? b.name.trim().slice(0, 120) : "";
    data.name = name || "Untitled template";
  }
  if (b.category !== undefined || !partial) {
    data.category = typeof b.category === "string" && CATEGORIES.includes(b.category) ? b.category : "Custom";
  }
  if (b.imagePath !== undefined || !partial) {
    const image = b.imagePath;
    // Backgrounds are stored inline; a temporary blob: URL would stop working once the tab closes.
    if (typeof image !== "string" || !image.startsWith("data:image/")) {
      if (!partial) return { error: "Upload a certificate image before saving." };
    } else if (image.length > MAX_IMAGE_CHARS) {
      return { error: "The background image is too large to save. Use an image under 12 MB." };
    } else {
      data.imagePath = image;
    }
  }
  if (b.fields !== undefined || !partial) {
    if (!Array.isArray(b.fields) || b.fields.length > 200) return { error: "The template's fields are invalid." };
    data.fields = b.fields;
  }
  if (b.canvasMeta !== undefined || !partial) {
    data.canvasMeta = b.canvasMeta && typeof b.canvasMeta === "object" ? (b.canvasMeta as Record<string, unknown>) : {};
  }
  return { data };
}

/**
 * Template list without the (large) inline background images.
 * `hasImage` says whether a preview can be served from /api/templates/[id]/image.
 */
export async function listTemplates(
  userId: string,
  options: { q?: string; category?: string; take?: number } = {}
) {
  const templates = await prisma.certificateTemplate.findMany({
    where: {
      userId,
      ...(options.q && { name: { contains: options.q, mode: "insensitive" } }),
      ...(options.category && { category: options.category }),
    },
    orderBy: { updatedAt: "desc" },
    take: options.take,
    select: { id: true, name: true, category: true, updatedAt: true },
  });
  if (templates.length === 0) return [];

  const withImage = await prisma.$queryRaw<{ id: string }[]>`
    SELECT id FROM "CertificateTemplate"
    WHERE "userId" = ${userId} AND "imagePath" LIKE 'data:image/%'
  `;
  const ids = new Set(withImage.map((row) => row.id));

  return templates.map((t) => ({
    ...t,
    // Versioned by last edit so browsers can cache previews indefinitely.
    previewUrl: ids.has(t.id) ? `/api/templates/${t.id}/image?v=${t.updatedAt.getTime()}` : null,
  }));
}
