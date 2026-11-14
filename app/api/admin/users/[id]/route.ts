import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/get-session";
import { issueVerificationEmail } from "@/lib/auth/verification";

type RouteContext = { params: Promise<{ id: string }> };

const STATUSES = ["PENDING", "APPROVED", "REJECTED", "BLOCKED"] as const;
const ROLES = ["ADMIN", "MEMBER"] as const;

const safeUser = {
  id: true,
  name: true,
  email: true,
  role: true,
  approvalStatus: true,
  emailVerified: true,
} as const;

function fail(error: string, status: number) {
  return NextResponse.json({ error }, { status });
}

async function requireAdmin() {
  const session = await getSession();
  return session && session.user.role === "ADMIN" ? session : null;
}

/** True when `id` is the only administrator who can still sign in. */
async function isLastActiveAdmin(id: string) {
  const others = await prisma.user.count({
    where: { role: "ADMIN", approvalStatus: "APPROVED", id: { not: id } },
  });
  return others === 0;
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const session = await requireAdmin();
  if (!session) return fail("Only administrators can do this.", 403);

  const { id } = await context.params;
  const body = await request.json().catch(() => ({}));
  const { approvalStatus, role, action } = body as { approvalStatus?: string; role?: string; action?: string };

  const target = await prisma.user.findUnique({ where: { id }, select: safeUser });
  if (!target) return fail("That user no longer exists.", 404);

  try {
    if (action === "verifyEmail") {
      const user = await prisma.user.update({
        where: { id },
        data: { emailVerified: target.emailVerified ?? new Date() },
        select: safeUser,
      });
      await prisma.verificationToken.deleteMany({ where: { identifier: target.email } });
      return NextResponse.json(user);
    }

    if (action === "resendVerification") {
      if (target.emailVerified) return fail("This email address is already confirmed.", 400);
      const mail = await issueVerificationEmail(target.email);
      if (!mail.ok) return fail(`The email could not be sent: ${mail.error}`, 502);
      return NextResponse.json(target);
    }

    const data: { approvalStatus?: (typeof STATUSES)[number]; role?: (typeof ROLES)[number] } = {};

    if (approvalStatus !== undefined) {
      if (!STATUSES.includes(approvalStatus as (typeof STATUSES)[number])) return fail("Unknown status.", 400);
      data.approvalStatus = approvalStatus as (typeof STATUSES)[number];
    }
    if (role !== undefined) {
      if (!ROLES.includes(role as (typeof ROLES)[number])) return fail("Unknown role.", 400);
      data.role = role as (typeof ROLES)[number];
    }
    if (!data.approvalStatus && !data.role) return fail("Nothing to update.", 400);

    const losesAdminAccess =
      target.role === "ADMIN" &&
      ((data.role && data.role !== "ADMIN") || (data.approvalStatus && data.approvalStatus !== "APPROVED"));
    if (losesAdminAccess) {
      if (id === session.user.id) return fail("You can't remove your own administrator access.", 400);
      if (await isLastActiveAdmin(id)) return fail("This is the only administrator. Promote someone else first.", 400);
    }

    const user = await prisma.user.update({ where: { id }, data, select: safeUser });
    console.log(`[ADMIN] ${session.user.email} updated ${user.email}:`, data);
    return NextResponse.json(user);
  } catch (error) {
    console.error("[ADMIN_UPDATE_ERROR]", error);
    return fail("The change could not be saved. Please try again.", 500);
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const session = await requireAdmin();
  if (!session) return fail("Only administrators can do this.", 403);

  const { id } = await context.params;
  if (id === session.user.id) return fail("You can't delete your own account from here.", 400);

  const target = await prisma.user.findUnique({ where: { id }, select: { email: true, role: true } });
  if (!target) return fail("That user no longer exists.", 404);
  if (target.role === "ADMIN" && (await isLastActiveAdmin(id))) {
    return fail("This is the only administrator. Promote someone else first.", 400);
  }

  try {
    await prisma.$transaction([
      prisma.verificationToken.deleteMany({ where: { identifier: target.email } }),
      prisma.passwordResetToken.deleteMany({ where: { email: target.email } }),
      prisma.user.delete({ where: { id } }),
    ]);
    console.log(`[ADMIN] ${session.user.email} deleted ${target.email}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[ADMIN_DELETE_ERROR]", error);
    return fail("The account could not be deleted. Please try again.", 500);
  }
}
