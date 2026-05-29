import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";

export async function getSession() {
  return getServerSession(authOptions);
}
