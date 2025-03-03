import { NextResponse } from "next/server";
import { MagicLinkEmail } from "@/emails/magic-link-email";
import { render } from "@react-email/render";
import { siteConfig } from "@/config/site";

export async function POST(request: Request) {
    const { identifier, url } = await request.json();

    try {
        const html = await render(
            MagicLinkEmail({
                firstName: identifier.split("@")[0], // 使用邮箱前缀作为用户名
                actionUrl: url,
                mailType: "login", // 默认登录类型
                siteName: siteConfig.name,
            })
        );

        return NextResponse.json({ html });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to generate email template" },
            { status: 500 }
        );
    }
}