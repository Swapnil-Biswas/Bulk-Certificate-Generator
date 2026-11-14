import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";

export async function getSession() {
  return getServerSession(authOptions);
}

/**
 * Session for API routes that act on a user's data: only approved members and administrators.
 * (Page routes are already gated by the proxy; APIs are not, so a blocked account must be stopped here.)
 */
export async function getActiveSession() {
  const session = await getSession();
  if (!session?.user?.id) return null;
  const { role, approvalStatus } = session.user;
  return role === "ADMIN" || approvalStatus === "APPROVED" ? session : null;
}
