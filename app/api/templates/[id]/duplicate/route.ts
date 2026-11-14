import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { getActiveSession } from "@/lib/auth/get-session";

/** Copies a template on the server, so the (large) background never has to round-trip through the browser. */
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getActiveSession();
    if (!session) return NextResponse.json({ error: "Please log in again." }, { status: 401 });

    const { id } = await params;
    const source = await prisma.certificateTemplate.findFirst({ where: { id, userId: session.user.id } });
    if (!source) return NextResponse.json({ error: "That template no longer exists." }, { status: 404 });

    const copy = await prisma.certificateTemplate.create({
      data: {
        name: `${source.name} (copy)`.slice(0, 120),
        category: source.category,
        imagePath: source.imagePath,
        fields: source.fields as Prisma.InputJsonValue,
        canvasMeta: source.canvasMeta as Prisma.InputJsonValue,
        userId: session.user.id,
      },
      select: { id: true },
    });
    return NextResponse.json(copy);
  } catch (error) {
    console.error("[TEMPLATE_DUPLICATE_ERROR]", error);
    return NextResponse.json({ error: "The template could not be duplicated." }, { status: 500 });
  }
}
