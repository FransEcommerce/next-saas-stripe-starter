import type { OrderStatus, Prisma, LicenseStatus, CouponType } from "@prisma/client"

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

// 修改许可证类型以匹配 Prisma schema
export interface License {
    id: string
    licenseKey: string
    status: LicenseStatus
    expiresAt: Date | null
    activatedAt: Date | null
    orderId: string | null  // 改为可选
    createdAt: Date
    updatedAt: Date
    domain?: string | null  // 添加 domain 字段
}

// 添加订单类型
export interface Order {
    id: string
    orderNumber: string
    status: OrderStatus
    amount: Prisma.Decimal
    subtotal: Prisma.Decimal
    discountAmount: Prisma.Decimal | null
    tax: Prisma.Decimal | null
    paymentId: string | null
    paymentMethod: string | null
    paymentNote: string | null
    paymentProof: string | null
    billingName: string | null
    billingEmail: string | null
    billingCompany: string | null
    billingAddress: string | null
    billingCity: string | null
    billingState: string | null
    billingZip: string | null
    billingCountry: string | null
    billingPhone: string | null
    createdAt: Date
    updatedAt: Date
    paidAt: Date | null
    refundedAt: Date | null
    cancelledAt: Date | null
    affiliateId: string | null
    affiliatePaymentId: string | null
    product: {
        id: string
        name: string
        plugin: {
            id: string
            name: string
            version: string
            avatar: string | null
        }
    }
    license: License | null
    coupon: {
        id: string
        code: string
        type: CouponType
        value: Prisma.Decimal
    } | null
}

// 更新 ThankYouViewProps
export interface ThankYouViewProps {
    order: Order
}