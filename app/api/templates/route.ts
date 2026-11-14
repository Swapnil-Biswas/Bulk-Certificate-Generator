import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { getActiveSession } from "@/lib/auth/get-session";
import { listTemplates, parseTemplateInput } from "@/lib/templates";

export async function POST(req: Request) {
  try {
    const session = await getActiveSession();
    if (!session) return NextResponse.json({ error: "Please log in again." }, { status: 401 });

    const parsed = parseTemplateInput(await req.json().catch(() => null), { partial: false });
    if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });
    const { name, category, imagePath, fields, canvasMeta } = parsed.data;

    const template = await prisma.certificateTemplate.create({
      data: {
        name: name!,
        category: category!,
        imagePath: imagePath!,
        fields: fields as Prisma.InputJsonValue,
        canvasMeta: canvasMeta as Prisma.InputJsonValue,
        userId: session.user.id,
      },
      select: { id: true, name: true, category: true, updatedAt: true },
    });
    return NextResponse.json(template);
  } catch (error) {
    console.error("[TEMPLATE_CREATE_ERROR]", error);
    return NextResponse.json({ error: "The template could not be saved. Please try again." }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getActiveSession();
    if (!session) return NextResponse.json({ error: "Please log in again." }, { status: 401 });
    return NextResponse.json(await listTemplates(session.user.id));
  } catch (error) {
    console.error("[TEMPLATE_LIST_ERROR]", error);
    return NextResponse.json({ error: "Templates could not be loaded." }, { status: 500 });
  }
}
