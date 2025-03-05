export interface License {
    id: string
    pluginName: string
    licenseKey: string
    purchaseDate: string
    expirationDate: string
    status: "active" | "expired" | "pending"
    version: string
    domain: string
    avatarUrl: string
    coverUrl: string
}