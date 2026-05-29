import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/get-session";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  const session = await getSession();

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { id } = await context.params;

  const body = await request.json();
  const { approvalStatus, role } = body;

  const updatedUser = await prisma.user.update({
    where: {
      id,
    },
    data: {
      ...(approvalStatus && { approvalStatus }),
      ...(role && { role }),
    },
  });

  return NextResponse.json(updatedUser);
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  const session = await getSession();

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { id } = await context.params;

  await prisma.user.delete({
    where: {
      id,
    },
  });

  return NextResponse.json({ success: true });
}
