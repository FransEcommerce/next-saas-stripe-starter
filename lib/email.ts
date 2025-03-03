import { MagicLinkEmail } from "@/emails/magic-link-email";
import { EmailConfig } from "next-auth/providers/email";
import { env } from "@/env.mjs";
import { siteConfig } from "@/config/site";
import { render } from "@react-email/render";

export const sendVerificationRequest: EmailConfig["sendVerificationRequest"] =
  async ({ identifier, url, provider }) => {
    const authSubject = `Sign-in link for ${siteConfig.name}`;

    try {
      const html = await render(
        MagicLinkEmail({
          firstName: identifier.split("@")[0], // 使用邮箱前缀作为用户名
          actionUrl: url,
          mailType: "login", // 默认登录类型
          siteName: siteConfig.name,
        })
      );

      const response = await fetch(`${env.NEXTAUTH_URL}/api/send-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: identifier,
          subject: authSubject,
          html,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send email");
      }
    } catch (error) {
      throw new Error("Failed to send verification email.");
    }
  };