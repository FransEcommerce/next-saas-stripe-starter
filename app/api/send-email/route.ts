import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { env } from "@/env.mjs";

export const runtime = "nodejs";

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
    debug: false, // 开启调试
    logger: false, // 开启日志
});

interface SendMailOptions {
    to: string;
    subject: string;
    html: string;
}

export async function sendMail({ to, subject, html }: SendMailOptions) {
    try {
        await transporter.verify();
        const info = await transporter.sendMail({
            from: `"${env.SMTP_FROM_NAME}" <${env.SMTP_FROM}>`,
            to,
            subject,
            html,
            priority: "high",
        });
        return info;
    } catch (error) {
        throw error;
    }
}

export async function POST(request: Request) {
    const { to, subject, html } = await request.json();

    try {
        const info = await sendMail({ to, subject, html });
        return NextResponse.json({ success: true, messageId: info.messageId });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error.message || "Failed to send email" },
            { status: 500 }
        );
    }
}