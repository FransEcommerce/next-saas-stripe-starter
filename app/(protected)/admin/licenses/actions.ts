"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { LicenseStatus } from "@prisma/client";

const updateLicenseSchema = z.object({
  domain: z.string().nullable(),
  status: z.nativeEnum(LicenseStatus),
  expiresAt: z.string().nullable().transform(val => val ? new Date(val) : null),
});

export async function updateLicense(licenseId: string, data: z.infer<typeof updateLicenseSchema>) {
  try {
    const validatedData = updateLicenseSchema.parse(data);
    
    const license = await prisma.license.update({
      where: { id: licenseId },
      data: validatedData,
    });

    revalidatePath("/admin/licenses");
    return license;
  } catch (error) {
    console.error("Error updating license:", error);
    throw new Error("Failed to update license");
  }
}
