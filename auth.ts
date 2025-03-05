import authConfig from "@/auth.config";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { UserRole } from "@prisma/client";
import NextAuth, { type DefaultSession } from "next-auth";
import { prisma } from "@/lib/db";
import { getUserById } from "@/lib/user";
import { env } from "@/env.mjs";

const FREE_PLAN_ID = env.FREE_PLAN_ID;

declare module "next-auth" {
  interface Session {
    user: {
      role: UserRole;
    } & DefaultSession["user"];
  }
}

export const {
  handlers: { GET, POST },
  auth,
} = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      // 确保 user.email 存在
      if (!user.email) {
        throw new Error("User email is required");
      }
    
      // 检查用户是否存在
      const existingUser = await prisma.user.findUnique({
        where: { email: user.email },
      });
    
      // 如果用户不存在，创建新用户并分配默认订阅计划
      if (!existingUser) {
        // 如果是邮箱登录，使用邮箱前缀作为用户名
        const name = account?.provider === "email" ? user.email.split("@")[0] : user.name || user.email.split("@")[0];
    
        const newUser = await prisma.user.create({
          data: {
            email: user.email,
            name: name, // 使用邮箱前缀或 Google 提供的用户名
            image: profile?.picture, // 保存 Google 提供的头像
            role: UserRole.USER, // 设置默认角色
            subscriptions: {
              create: {
                planId: FREE_PLAN_ID,
                status: "ACTIVE",
                startDate: new Date(),
                // currentPeriodStart: new Date(),
                // currentPeriodEnd: new Date(new Date().setFullYear(new Date().getFullYear() + 1)), // 默认订阅一年
                priceAmount: 0, // 默认免费
                currency: "USD",
              },
            },
          },
        });
    
        // 如果是 OAuth 登录（如 Google），关联账户
        if (account && account.provider !== "email") {
          await prisma.account.create({
            data: {
              userId: newUser.id,
              type: account.type,
              provider: account.provider,
              providerAccountId: account.providerAccountId,
              refresh_token: account.refresh_token,
              access_token: account.access_token,
              expires_at: account.expires_at,
              token_type: account.token_type,
              scope: account.scope,
              id_token: account.id_token,
            },
          });
        }
      }
    
      return true;
    },
    async session({ token, session }) {
      if (session.user) {
        if (token.sub) {
          session.user.id = token.sub;
        }

        if (token.email) {
          session.user.email = token.email;
        }

        if (token.role) {
          session.user.role = token.role;
        }

        session.user.name = token.name;
        session.user.image = token.picture;
      }

      return session;
    },
    async jwt({ token }) {
      if (!token.sub) return token;

      const dbUser = await getUserById(token.sub);

      if (!dbUser) return token;

      token.name = dbUser.name;
      token.email = dbUser.email;
      token.picture = dbUser.image;
      token.role = dbUser.role;

      return token;
    },
  },
  ...authConfig,
});