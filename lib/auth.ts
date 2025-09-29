import type { NextAuthOptions, Session } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import { z } from "zod";

function looksLikeEmail(v: string) {
  return /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(v);
}
// telefon: cyfry, spacje, +()- ; min 9 cyfr
function looksLikePhone(v: string) {
  const core = v.replace(/[^\d]/g, "");
  return core.length >= 9 && /^[0-9+\-\s()]+$/.test(v);
}

// id do Session.user ---
declare module "next-auth" {
  interface Session {
    user: {
      id: number;
      email: string;
      name?: string | null;
      image?: string | null;
    };
  }
}
declare module "next-auth/jwt" {
  interface JWT {
    id?: number;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  pages: { signIn: "/login" },

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        id: { label: "Email or phone", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const schema = z.object({
          id: z.string().min(1),
          password: z.string().min(6),
        });
        const parsed = schema.safeParse({
          id: credentials?.id,
          password: credentials?.password,
        });
        if (!parsed.success) return null;

        const id = parsed.data.id.trim();
        const password = parsed.data.password;



        
        let user: {
          id: number;
          email: string;
          firstName: string | null;
          passwordHash: string;
        } | null = null;

        if (looksLikeEmail(id)) {
          user = await prisma.user.findUnique({
            where: { email: id.toLowerCase() },
            select: {
              id: true,
              email: true,
              firstName: true,
              passwordHash: true,
            },
          });
        } else if (looksLikePhone(id)) {
          user = await prisma.user.findUnique({
            where: { phone: id },
            select: {
              id: true,
              email: true,
              firstName: true,
              passwordHash: true,
            },
          });
        } else {
          return null;
        }

        if (!user) return null;

        const ok = await verifyPassword(password, user.passwordHash);
        if (!ok) return null;

        return {
          id: String(user.id),
          email: user.email,
          name: user.firstName ?? null,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) {
        token.id = Number(user.id);
        token.email = user.email;
        token.name = user.name ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        (session.user as Session["user"]).id = Number(token.id);
        session.user.email = String(token.email ?? session.user.email);
        session.user.name = (token.name as string) ?? session.user.name ?? null;
      }
      return session;
    },
  },
};
