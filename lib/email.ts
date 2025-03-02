import { MagicLinkEmail } from "@/emails/magic-link-email";
import { env } from "@/env.mjs";

export const sendVerificationRequest = async ({ identifier, url }: { identifier: string; url: string }) => {
  const html = MagicLinkEmail({
    firstName: "User",
    actionUrl: url,
    mailType: "login",
    siteName: "Your App",
  });

  let retries = 3;
  while (retries > 0) {
    try {
      const response = await fetch(`${env.NEXTAUTH_URL}/api/send-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: identifier,
          subject: "Your Sign-In Link",
          html,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to send verification email.");
      }
      return;
    } catch (error) {
      retries--;
      if (retries === 0) {
        throw new Error("Failed to send verification email after multiple attempts.");
      }
      await new Promise((resolve) => setTimeout(resolve, 1000)); // 等待1秒后重试
    }
  }
};