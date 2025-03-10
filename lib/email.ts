import { env } from "@/env.mjs";
import { siteConfig } from "@/config/site";

interface SendMagicLinkEmailParams {
  identifier: string;
  url: string;
}

export const sendMagicLinkEmail = async ({ identifier, url }: SendMagicLinkEmailParams) => {
  const authSubject = `Sign-in link for - ${siteConfig.name}`;

  try {
    // 调用 API 路由生成邮件模板
    const response = await fetch(`${env.NEXT_PUBLIC_APP_URL}/api/send-magic-link`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        identifier,
        url,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to generate email template");
    }

    const { html } = await response.json();

    // 发送邮件
    const sendEmailResponse = await fetch(`${env.NEXT_PUBLIC_APP_URL}/api/send-email`, {
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

    if (!sendEmailResponse.ok) {
      throw new Error("Failed to send email");
    }
  } catch (error) {
    throw new Error("Failed to send verification email.");
  }
};