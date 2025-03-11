import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";

export async function getUserOrders() {
    const user = await getCurrentUser();
    if (!user?.id) {
        return null;
    }

    const orders = await prisma.order.findMany({
        where: { userId: user.id },
        select: {
            id: true,
            orderNumber: true,
            status: true,
            amount: true,
            subtotal: true,
            discountAmount: true,
            tax: true,
            paymentMethod: true,
            paymentNote: true,
            paymentProof: true,
            createdAt: true,
            updatedAt: true,
            paidAt: true,
            refundedAt: true,
            cancelledAt: true,
            // 账单信息
            billingCompany: true,
            billingName: true,
            billingAddress: true,
            billingCity: true,
            billingState: true,
            billingCountry: true,
            billingZip: true,
            billingPhone: true,
            billingEmail: true,
            // 关联数据
            product: {
                select: {
                    id: true,
                    name: true,
                    description: true,
                    price: true,
                    comparePrice: true,
                    active: true,
                    duration: true,
                    features: true,
                    createdAt: true,
                    updatedAt: true,
                    plugin: {
                        select: {
                            id: true,
                            name: true,
                            version: true,
                            avatar: true,
                            description: true,
                        }
                    }
                }
            },
            license: {
                select: {
                    id: true,
                    licenseKey: true,
                    status: true,
                    domain: true,
                    activatedAt: true,
                    expiresAt: true,
                }
            },
            user: {
                select: {
                    name: true,
                    email: true,
                }
            }
        },
        orderBy: { createdAt: "desc" },
    });

    // 处理 Decimal 类型
    return orders.map(order => ({
        ...order,
        amount: Number(order.amount),
        subtotal: Number(order.subtotal),
        discountAmount: order.discountAmount ? Number(order.discountAmount) : 0,
        tax: order.tax ? Number(order.tax) : null,
        product: {
            ...order.product,
            price: Number(order.product.price),
            comparePrice: order.product.comparePrice ? Number(order.product.comparePrice) : null,
        }
    }));
}