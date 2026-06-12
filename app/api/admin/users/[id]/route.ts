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
  
  console.log(`[ADMIN API] Updating user ${id}:`, body);

  const { approvalStatus, role } = body;

  try {
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(approvalStatus && { approvalStatus }),
        ...(role && { role }),
      },
    });

    console.log(`[ADMIN API] Update successful for ${id}`);
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error(`[ADMIN API] Update failed for ${id}:`, error);
    return NextResponse.json({ error: "Database update failed" }, { status: 500 });
  }
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

  try {
    await prisma.user.delete({
      where: {
        id,
      },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
