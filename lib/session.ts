import "server-only";

import { auth } from "@/auth";
import { getUserById } from "./user";
import { headers } from "next/headers";

export const getCurrentUser = async () => {
  const session = await auth.api.getSession({
    headers: headers(),
  });
  if (!session?.user?.id) {
    return undefined;
  }

  const user = await getUserById(session.user.id);
  return user;
};