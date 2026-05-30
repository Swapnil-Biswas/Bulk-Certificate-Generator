import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/get-session";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { name, count, templateName, format } = body;

    const batch = await prisma.certificateBatch.create({
      data: {
        name,
        count,
        templateName,
        format: format || "PNG",
        status: "Completed",
        userId: session.user.id,
      },
    });

    return NextResponse.json(batch);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
