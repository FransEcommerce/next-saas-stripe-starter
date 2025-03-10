import { auth } from "@/auth";
import { deleteUser } from "@/app/(protected)/admin/users/actions";
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";

export async function DELETE(req: NextRequest) {
  try {
    // 使用 Better Auth 的 API 获取会话
    const session = await auth.api.getSession({
      headers: headers(),
    });
    
    if (!session || !session.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const userId = session.user.id;
    if (!userId) {
      return NextResponse.json({ error: "Invalid user" }, { status: 401 });
    }

    // 使用 actions.ts 中的 deleteUser 函数来完整清理用户数据
    await deleteUser(userId);
    
    return NextResponse.json({ message: "User deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
