import { createAuthClient } from "better-auth/react";
import { magicLinkClient } from "better-auth/client/plugins";
import { env } from "@/env.mjs";

export const authClient = createAuthClient({
    baseURL: env.NEXT_PUBLIC_APP_URL,
    plugins: [
        magicLinkClient()
    ]
});

export const { signIn, useSession } = authClient;
export const { signOut: originalSignOut } = authClient;

// 自定义登出函数，支持 callbackUrl 参数
export const signOut = async (options?: { callbackUrl?: string }) => {
    await originalSignOut();
    
    // 如果提供了回调 URL，则重定向到该 URL
    if (options?.callbackUrl) {
        window.location.href = options.callbackUrl;
    } else {
        // 默认重定向到首页
        window.location.href = "/";
    }
};

// 社交登录函数
export const signInGoogle = async () => {
    const data = await signIn.social({
        provider: "google"
    });
    return data;
};

// 魔法链接登录函数
export const signInMagicLink = async (email: string) => {
    const data = await signIn.magicLink({
        email,
    });
    return data;
};

// 适配 Better Auth 的 session 到我们的应用需要的结构
export function useSessionAdapter() {
    const session = useSession();
    
    // 创建一个兼容 NextAuth 的 session 结构
    return {
        data: session.data ? {
            ...session.data,
            user: {
                ...session.data.user,
                // 如果用户对象中已经有 role 属性，则使用它，否则默认为 USER
                role: (session.data.user as any).role || "USER"
            }
        } : null,
        status: session.isPending ? "loading" : session.data ? "authenticated" : "unauthenticated",
        update: async () => {
            // 这是一个空操作，因为 Better Auth 没有提供 update 方法
            return null;
        }
    };
}
