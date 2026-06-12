import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "ADMIN" | "MEMBER";
      approvalStatus: "PENDING" | "APPROVED" | "REJECTED" | "BLOCKED";
    } & DefaultSession["user"];
  }

  interface User {
    role: "ADMIN" | "MEMBER";
    approvalStatus: "PENDING" | "APPROVED" | "REJECTED" | "BLOCKED";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "ADMIN" | "MEMBER";
    approvalStatus: "PENDING" | "APPROVED" | "REJECTED" | "BLOCKED";
  }
}
