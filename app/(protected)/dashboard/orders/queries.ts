import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";

export async function getUserOrders() {
    const user = await getCurrentUser();
    const userId = user?.id;

    if (!userId) {
        return null;
    }

    const orders = await prisma.order.findMany({
        where: { userId },
        include: {
            product: {
                include: {
                    plugin: {
                        select: {
                            id: true,
                            name: true,
                            version: true,
                            avatar: true,
                            description: true,
                        }
                    },
                },
            },
            license: true,
            user: true,
        },
        orderBy: { createdAt: "desc" },
    });

    // 将 Decimal 转换为 number，并移除不需要的字段
    const processedOrders = orders.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        amount: Number(order.amount.toString()),
        subtotal: Number(order.subtotal.toString()),
        discountAmount: order.discountAmount ? Number(order.discountAmount.toString()) : null,
        tax: order.tax ? Number(order.tax.toString()) : null,
        paymentMethod: order.paymentMethod,
        paymentNote: order.paymentNote,
        paymentProof: order.paymentProof,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        paidAt: order.paidAt,
        refundedAt: order.refundedAt,
        cancelledAt: order.cancelledAt,
        billingCompany: order.billingCompany,
        billingName: order.billingName,
        billingAddress: order.billingAddress,
        billingCity: order.billingCity,
        billingState: order.billingState,
        billingCountry: order.billingCountry,
        billingZip: order.billingZip,
        billingPhone: order.billingPhone,
        billingEmail: order.billingEmail,
        userId: order.userId,
        productId: order.productId,
        couponId: order.couponId,
        product: {
            ...order.product,
            price: Number(order.product.price.toString()),
            comparePrice: order.product.comparePrice ? Number(order.product.comparePrice.toString()) : null,
            plugin: order.product.plugin ? {
                id: order.product.plugin.id,
                name: order.product.plugin.name,
                version: order.product.plugin.version,
                avatar: order.product.plugin.avatar,
                description: order.product.plugin.description,
            } : null,
        },
        license: order.license ? {
            id: order.license.id,
            licenseKey: order.license.licenseKey,
            status: order.license.status,
            domain: order.license.domain,
            activatedAt: order.license.activatedAt,
            expiresAt: order.license.expiresAt,
        } : null,
        user: {
            name: order.user.name,
            email: order.user.email,
        },
    }));

    return processedOrders;
}