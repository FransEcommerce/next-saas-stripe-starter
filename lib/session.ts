import "server-only";

import { cache } from "react";
import { auth } from "@/auth";
import { getUserById } from "./user";

export const getCurrentUser = cache(async () => {
  const session = await auth();
  if (!session?.user?.id) {
    return undefined;
  }
  
  const user = await getUserById(session.user.id);
  return user;
});