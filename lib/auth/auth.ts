import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcrypt";

import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  useSecureCookies: process.env.NODE_ENV === "production",
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production" ? `__Secure-next-auth.session-token` : `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        // Shared across www and the apex domain in production; host-only elsewhere so local logins work.
        ...(process.env.NODE_ENV === "production" && { domain: ".certificategenerator.space" }),
      },
    },
  },

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      name: "Credentials",

      credentials: {
        email: {
          label: "Email",
          type: "email",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = credentials.email.trim().toLowerCase();
        const user = await prisma.user.findUnique({ where: { email } });

        // Same outcome for an unknown address and a wrong password.
        if (!user || !(await bcrypt.compare(credentials.password, user.passwordHash).catch(() => false))) {
          return null;
        }

        // Error codes are mapped to friendly messages on the login page.
        if (!user.emailVerified) throw new Error("EmailNotVerified");
        if (user.approvalStatus === "PENDING" && user.role !== "ADMIN") throw new Error("PendingApproval");
        if (user.approvalStatus !== "APPROVED" && user.role !== "ADMIN") throw new Error("AccessDenied");

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          approvalStatus: user.approvalStatus,
        };
      },
    }),
  ],

  pages: {
    signIn: "/login",
  },

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== "google") return true;

      const email = user.email?.toLowerCase();
      if (!email) return "/login?error=OAuthSignin";

      const existingUser = await prisma.user.findUnique({ where: { email } });

      if (!existingUser) {
        // First visit with Google: create the account ourselves (our users need fields the
        // default adapter doesn't set), then send them to wait for approval like everyone else.
        await prisma.user.create({
          data: {
            name: user.name?.trim() || email.split("@")[0],
            email,
            emailVerified: new Date(), // Google has already confirmed the address.
            passwordHash: `google:${crypto.randomUUID()}`, // not a valid hash, so password login can't match
            approvalStatus: "PENDING",
          },
        });
        return "/login?error=PendingApproval&new=1";
      }

      if (existingUser.role !== "ADMIN") {
        if (existingUser.approvalStatus === "PENDING") return "/login?error=PendingApproval";
        if (existingUser.approvalStatus !== "APPROVED") return "/login?error=AccessDenied";
      }

      if (!existingUser.emailVerified) {
        await prisma.user.update({ where: { id: existingUser.id }, data: { emailVerified: new Date() } });
      }
      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.approvalStatus = user.approvalStatus;
      }

      // Re-fetch user from DB to ensure approvalStatus is up to date in token for subsequent requests
      if (token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
          select: { approvalStatus: true, role: true, id: true }
        });

        if (dbUser) {
          token.approvalStatus = dbUser.approvalStatus;
          token.role = dbUser.role;
          token.id = dbUser.id;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.approvalStatus = token.approvalStatus;
        
      }

      return session;
    },
  },
};

export default NextAuth(authOptions);
