import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { getActiveSession } from "@/lib/auth/get-session";
import { parseTemplateInput } from "@/lib/templates";

type Context = { params: Promise<{ id: string }> };

const notFound = () => NextResponse.json({ error: "That template no longer exists." }, { status: 404 });
const unauthorized = () => NextResponse.json({ error: "Please log in again." }, { status: 401 });

export async function GET(_req: Request, { params }: Context) {
  try {
    const session = await getActiveSession();
    if (!session) return unauthorized();

    const { id } = await params;
    const template = await prisma.certificateTemplate.findFirst({ where: { id, userId: session.user.id } });
    return template ? NextResponse.json(template) : notFound();
  } catch (error) {
    console.error("[TEMPLATE_GET_ERROR]", error);
    return NextResponse.json({ error: "The template could not be loaded." }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: Context) {
  try {
    const session = await getActiveSession();
    if (!session) return unauthorized();

    const { id } = await params;
    const parsed = parseTemplateInput(await req.json().catch(() => null), { partial: true });
    if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });
    const { name, category, imagePath, fields, canvasMeta } = parsed.data;

    // updateMany scopes the write to the owner without throwing when nothing matches.
    const result = await prisma.certificateTemplate.updateMany({
      where: { id, userId: session.user.id },
      data: {
        ...(name !== undefined && { name }),
        ...(category !== undefined && { category }),
        ...(imagePath !== undefined && { imagePath }),
        ...(fields !== undefined && { fields: fields as Prisma.InputJsonValue }),
        ...(canvasMeta !== undefined && { canvasMeta: canvasMeta as Prisma.InputJsonValue }),
        updatedAt: new Date(),
      },
    });
    return result.count ? NextResponse.json({ id }) : notFound();
  } catch (error) {
    console.error("[TEMPLATE_UPDATE_ERROR]", error);
    return NextResponse.json({ error: "The template could not be saved. Please try again." }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Context) {
  try {
    const session = await getActiveSession();
    if (!session) return unauthorized();

    const { id } = await params;
    const result = await prisma.certificateTemplate.deleteMany({ where: { id, userId: session.user.id } });
    return result.count ? NextResponse.json({ success: true }) : notFound();
  } catch (error) {
    console.error("[TEMPLATE_DELETE_ERROR]", error);
    return NextResponse.json({ error: "The template could not be deleted." }, { status: 500 });
  }
}
