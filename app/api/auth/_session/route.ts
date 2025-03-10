import { auth } from "@/auth";
import { NextResponse } from "next/server";

export const runtime = "nodejs"; // 确保在 Node.js 环境中运行，而不是 Edge

export async function GET(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });
    
    return NextResponse.json(session);
  } catch (error) {
    console.error("Session API error:", error);
    return NextResponse.json(
      { error: "Failed to get session" },
      { status: 500 }
    );
  }
}
