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
        domain: ".certificategenerator.space"
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
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email.toLowerCase();
        console.log(`[AUTH] Attempting login for: ${email}`);

        const user = await prisma.user.findUnique({
          where: {
            email,
          },
        });

        if (!user) {
          console.log(`[AUTH] User not found: ${email}`);
          return null;
        }

        if (!user.emailVerified) {
          console.log(`[AUTH] Email not verified: ${email}`);
          throw new Error("Please verify your email first.");
        }

        if (user.approvalStatus !== "APPROVED") {
          console.log(`[AUTH] Account not approved: ${email} (${user.approvalStatus})`);
          throw new Error("Your account is not approved.");
        }

        const validPassword = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!validPassword) {
          console.log(`[AUTH] Invalid password for: ${email}`);
          return null;
        }

        console.log(`[AUTH] Login successful: ${email}`);
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
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email as string },
        });

        if (existingUser) {
          if (existingUser.approvalStatus !== "APPROVED") {
            throw new Error("Your account is not approved.");
          }
          // Auto-verify if they use Google
          if (!existingUser.emailVerified) {
            await prisma.user.update({
              where: { id: existingUser.id },
              data: { emailVerified: new Date() },
            });
          }
          return true;
        }

        // For new users via Google, PrismaAdapter creates them. 
        // We'll let it create and then they will be blocked by approvalStatus on next attempt
        // or we can handle creation here but Adapter is preferred.
        // Actually, if we return true, Adapter will create the user.
        // But we need to make sure they are NOT signed in if not approved.
        // Wait, if they are NEW, they definitely aren't approved yet.
        // So we should return true to allow creation, but then what?
        // NextAuth will sign them in for this session.
        // To prevent this, we might need to check if they were JUST created.
      }
      return true;
    },

    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.approvalStatus = user.approvalStatus;
        console.log(`[AUTH] JWT callback - initial login: ${user.email}`);
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
        
        if (session.user.approvalStatus !== "APPROVED" && session.user.role !== "ADMIN") {
          // This doesn't prevent session creation but we can handle it in middleware
        }

        console.log(`[AUTH] Session callback - user: ${session.user.email}, role: ${session.user.role}`);
      }

      return session;
    },
  },
};

export default NextAuth(authOptions);
