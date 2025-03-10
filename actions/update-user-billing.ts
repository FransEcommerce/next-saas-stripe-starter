"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { billingInfoSchema } from '@/lib/validations/billing';
import type { BillingFormData } from '@/lib/validations/billing';
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

export async function updateUserBilling(userId: string, data: BillingFormData) {
  try {
    const session = await auth.api.getSession({
      headers: headers(),
    })


    if (!session?.user || session?.user.id !== userId) {
      throw new Error("Unauthorized");
    }

    const validatedData = billingInfoSchema.parse(data);

    // Update the user billing information
    await prisma.user.update({
      where: {
        id: userId,
      },
      data: validatedData,
    })

    revalidatePath('/dashboard/settings');
    return { status: "success" };
  } catch (error) {
    return { status: "error" }
  }
}