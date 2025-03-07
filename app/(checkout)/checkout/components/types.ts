export interface AppPlugin {
    id: string
    name: string
    description: string
    version: string
    avatar?: string
    cover?: string
}

export interface Product {
    id: string
    name: string
    description: string
    price: number
    comparePrice?: number
    duration: number | null // null means lifetime
    features: string[]
    plugin: AppPlugin
    userBillingInfo?: {
        email: string
        name: string
        company: string
        address: string
        city: string
        state: string
        zip: string
        country: string
        phone: string
    } | null
}