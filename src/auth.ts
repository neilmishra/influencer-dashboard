import NextAuth, { type DefaultSession } from "next-auth";
import type { JWT } from "next-auth/jwt";
import Credentials from "next-auth/providers/credentials";
import FacebookProvider from "next-auth/providers/facebook";
import GoogleProvider from "next-auth/providers/google";
import TikTokProvider from "next-auth/providers/tiktok";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import type { UserRole } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

declare module "next-auth" {
  interface User {
    role: UserRole;
  }

  interface Session {
    user: {
      id: string;
      role: UserRole;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: UserRole;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      authorization: {
        params: {
          scope: "openid email profile https://www.googleapis.com/auth/youtube.readonly",
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
    FacebookProvider({
      clientId: process.env.META_CLIENT_ID ?? "",
      clientSecret: process.env.META_CLIENT_SECRET ?? "",
      authorization: {
        params: {
          scope: "public_profile,email,instagram_basic,instagram_manage_insights,pages_show_list,pages_read_engagement",
        },
      },
    }),
    TikTokProvider({
      clientId: process.env.TIKTOK_CLIENT_ID ?? "",
      clientSecret: process.env.TIKTOK_CLIENT_SECRET ?? "",
      authorization: {
        params: {
          scope: "user.info.basic,user.info.profile,user.info.stats,video.list",
        },
      },
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = typeof credentials.email === "string"
          ? credentials.email.trim().toLowerCase()
          : "";
        const password = typeof credentials.password === "string" ? credentials.password : "";

        if (!email || !password) return null;

        const user = await prisma.user.findUnique({
          where: { email },
          select: {
            id: true,
            email: true,
            name: true,
            passwordHash: true,
            role: true,
          },
        });

        if (!user?.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      const authToken = token as JWT;
      if (session.user && authToken.id && authToken.role) {
        session.user.id = authToken.id;
        session.user.role = authToken.role;
      }
      return session;
    },
  },
});