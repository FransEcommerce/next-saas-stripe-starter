import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { env } from "@/env.mjs";

export const runtime = "nodejs"; // 强制使用 Node.js 环境

// 创建邮件传输器
const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: parseInt(env.SMTP_PORT),
    secure: env.SMTP_SECURE === "true",
    auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASSWORD,
    },
    pool: true, // 启用连接池
    maxConnections: 50, // 最大连接数
    maxMessages: 100, // 每个连接最大消息数
    connectionTimeout: 30000, // 连接超时时间（10秒）
    socketTimeout: 30000, // 套接字超时时间（10秒）
    debug: true, // 开启调试
    logger: true, // 开启日志
});

interface SendMailOptions {
    to: string;
    subject: string;
    html: string;
}

export async function sendMail({ to, subject, html }: SendMailOptions) {
    try {
        // 验证配置是否正确
        console.log("Verifying SMTP configuration...");
        console.log("SMTP Settings:", {
            host: env.SMTP_HOST,
            port: env.SMTP_PORT,
            secure: env.SMTP_SECURE,
            user: env.SMTP_USER,
        });

        // 调试日志：检查发件人名称和邮箱
        console.log("SMTP_FROM_NAME:", env.SMTP_FROM_NAME);
        console.log("SMTP_FROM:", env.SMTP_FROM);

        await transporter.verify();
        console.log("SMTP Configuration verified successfully");
        console.log("SMTP_FROM_NAME:", env.SMTP_FROM_NAME);
        console.log("SMTP_FROM:", env.SMTP_FROM);
        console.log("Sending email to:", to);
        const info = await transporter.sendMail({
            from: `"${env.SMTP_FROM_NAME}" <${env.SMTP_FROM}>`, // 使用 SMTP_FROM_NAME
            to,
            subject,
            html,
            priority: "high", // 设置高优先级
        });
        console.log("Message sent: %s", info.messageId);
        return info;
    } catch (error) {
        console.error("Error sending email:", error);
        throw error;
    }
}

// 导出 POST 方法
export async function POST(request: Request) {
    const { to, subject, html } = await request.json();

    try {
        const info = await sendMail({ to, subject, html });
        return NextResponse.json({ success: true, messageId: info.messageId });
    } catch (error) {
        console.error("Failed to send email:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Failed to send email" },
            { status: 500 }
        );
    }
}