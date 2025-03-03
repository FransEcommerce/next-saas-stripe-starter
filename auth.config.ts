import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import { env } from "@/env.mjs";
import { sendVerificationRequest } from "@/lib/email";

export default {
  providers: [
    Google({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    }),
    {
      id: "email",
      type: "email",
      name: "Email",
      from: env.SMTP_FROM, // 发件人地址
      maxAge: 24 * 60 * 60, // 魔术链接有效期（24小时）
      options: {}, // 添加 options 属性
      sendVerificationRequest,
    },
  ],
  pages: {
    error: "/login", // 将错误页面重定向到登录页面
  },
  trustHost: true,
} satisfies NextAuthConfig;