export const config = {
    runtime: "nodejs", // 强制使用 Node.js Runtime
};

export { auth as middleware } from "@/auth";