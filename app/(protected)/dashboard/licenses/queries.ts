import { getCurrentUser } from "@/lib/session"
import { prisma } from "@/lib/db"

export async function getUserLicenses() {
    const user = await getCurrentUser()
    if (!user) {
        throw new Error("User not authenticated")
    }

    const licenses = await prisma.license.findMany({
        where: {
            userId: user.id
        },
        include: {
            plugin: {
                select: {
                    id: true,
                    name: true,
                    description: true,
                    version: true,
                    avatar: true,
                    cover: true
                }
            }
        }
    })

    return licenses.map((license) => ({
        id: license.id,
        pluginName: license.plugin.name,
        licenseKey: license.licenseKey,
        purchaseDate: license.createdAt.toISOString(),
        expirationDate: license.expiresAt?.toISOString() || "",
        status: license.status.toLowerCase() as "active" | "expired" | "pending",
        version: license.plugin.version,
        domain: license.domain || "",
        avatarUrl: license.plugin.avatar || "/placeholder.svg",
        coverUrl: license.plugin.cover || "/placeholder.svg"
    }))
}