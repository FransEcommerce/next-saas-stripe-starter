import { betterAuth } from "better-auth";
import { magicLink } from "better-auth/plugins";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/db";
import { env } from "@/env.mjs";
import { sendMagicLinkEmail } from "@/lib/email";
import { createAuthMiddleware } from "better-auth/api";
import { headers } from "next/headers";

const FREE_PLAN_ID = env.FREE_PLAN_ID || "free";

// 检测是否在 Edge Runtime 中运行
const isEdgeRuntime = typeof process !== 'undefined' && process.env.NEXT_RUNTIME === 'edge';

export const auth = betterAuth({
  // 在 Edge Runtime 中使用内存适配器
  database: prismaAdapter(prisma, {
    provider: "postgresql", // 根据您的数据库类型设置
  }),
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  
  // 高级配置
  advanced: {
    cookiePrefix: "better-auth",
    cookies: {
      session_token: {
        name: "session_token",
        attributes: {
          secure: process.env.NODE_ENV === "production",
        }
      }
    }
  },

  // 社交登录提供商
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID as string,
      clientSecret: env.GOOGLE_CLIENT_SECRET as string,
    },
  },

  // 插件
  plugins: [
    magicLink({
      sendMagicLink: async ({ email, token, url }, request) => {
        await sendMagicLinkEmail({ identifier: email, url });
      }
    })
  ],

  // 使用 hooks 系统
  hooks: {
    // 在用户创建后执行
    after: createAuthMiddleware(async (ctx) => {
      // 处理用户创建和登录事件
      if (
        ctx.path === "/sign-up/email" || 
        ctx.path === "/sign-up/oauth" || 
        ctx.path.includes("/callback/") || 
        ctx.path === "/magic-link/verify" ||
        ctx.path === "/sign-in/magic-link"
      ) {
        // 获取新创建的会话和用户
        const newSession = ctx.context?.newSession;
        if (newSession && newSession.user) {
          const user = newSession.user;
          
          try {
            // 检查用户是否已经有订阅
            const existingUser = await prisma.user.findUnique({
              where: { id: user.id },
              include: { subscriptions: true }
            });
            
            if (existingUser) {
              // 如果是通过邮件登录且用户没有名字，则使用邮箱前缀作为名字
              if (
                (ctx.path === "/sign-in/magic-link" || ctx.path === "/magic-link/verify") && 
                existingUser.email && 
                (!existingUser.name || existingUser.name.trim() === "")
              ) {
                const emailPrefix = existingUser.email.split('@')[0];
                await prisma.user.update({
                  where: { id: existingUser.id },
                  data: { name: emailPrefix }
                });
              }
              
              // 检查并创建订阅
              if (!existingUser.subscriptions || existingUser.subscriptions.length === 0) {
                await prisma.subscription.create({
                  data: {
                    userId: user.id,
                    planId: FREE_PLAN_ID,
                    status: "ACTIVE",
                    startDate: new Date(),
                    priceAmount: 0,
                    currency: "USD",
                  }
                });
              }
            }
          } catch (error) {
            console.error("Error in after hook:", error);
          }
        } else {
          // 尝试从请求中获取会话
          try {
            const session = await auth.api.getSession({
              headers: headers(),
            });
            if (session && session.user) {
              // 检查用户是否已经有订阅
              const existingUser = await prisma.user.findUnique({
                where: { id: session.user.id },
                include: { subscriptions: true }
              });
              
              if (existingUser) {
                // 如果是通过邮件登录且用户没有名字，则使用邮箱前缀作为名字
                if (
                  (ctx.path === "/sign-in/magic-link" || ctx.path === "/magic-link/verify") && 
                  existingUser.email && 
                  (!existingUser.name || existingUser.name.trim() === "")
                ) {
                  const emailPrefix = existingUser.email.split('@')[0];
                  await prisma.user.update({
                    where: { id: existingUser.id },
                    data: { name: emailPrefix }
                  });
                }
                
                // 检查并创建订阅
                if (!existingUser.subscriptions || existingUser.subscriptions.length === 0) {
                  await prisma.subscription.create({
                    data: {
                      userId: session.user.id,
                      planId: FREE_PLAN_ID,
                      status: "ACTIVE",
                      startDate: new Date(),
                      priceAmount: 0,
                      currency: "USD",
                    }
                  });
                }
              }
            }
          } catch (error) {
            console.error("Error getting session:", error);
          }
        }
      }
    }),
  },

  // 回调函数
  callbacks: {
    async session({ session, user }) {
      if (session && user) {
        // 确保用户 ID 被添加到会话中
        session.user.id = user.id;
        
        // 从数据库获取完整的用户信息，包括角色
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { 
            role: true,
            subscriptions: true,
            email: true,
            name: true
          }
        });
        
        // 添加用户角色到会话中
        if (dbUser) {
          session.user.role = dbUser.role;
          
          // 如果用户没有名字但有邮箱，使用邮箱前缀作为名字
          if (dbUser.email && (!dbUser.name || dbUser.name.trim() === "")) {
            const emailPrefix = dbUser.email.split('@')[0];
            try {
              await prisma.user.update({
                where: { id: user.id },
                data: { name: emailPrefix }
              });
              // 更新会话中的用户名
              session.user.name = emailPrefix;
            } catch (error) {
              console.error("Error updating user name in session callback:", error);
            }
          }
          
          // 检查用户是否有订阅，如果没有则创建
          if (!dbUser.subscriptions || dbUser.subscriptions.length === 0) {
            try {
              // 创建默认订阅计划
              await prisma.subscription.create({
                data: {
                  userId: user.id,
                  planId: FREE_PLAN_ID,
                  status: "ACTIVE",
                  startDate: new Date(),
                  priceAmount: 0,
                  currency: "USD",
                }
              });
            } catch (error) {
              console.error("Error creating subscription in session callback:", error);
            }
          }
        }
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },
});

// 导出类型
export type Auth = typeof auth;