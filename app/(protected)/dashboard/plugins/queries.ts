import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";

export async function getProductsAndPurchases() {
    const user = await getCurrentUser();

    // 查询所有产品及其关联的插件信息，排除 PLUGIN_MANAGER_PRODUCT_ID
    const products = await prisma.product.findMany({
        where: {
            active: true,
            NOT: {
                id: process.env.PLUGIN_MANAGER_PRODUCT_ID, // 排除指定产品
            },
        },
        include: {
            plugin: true,
        },
    });

    // 查询当前用户购买的产品及其关联的插件信息和许可证信息
    const userPurchases = await prisma.order.findMany({
        where: { userId: user?.id },
        include: {
            product: {
                include: {
                    plugin: true,
                },
            },
            license: true, // 关联许可证信息
        },
    });

    // 将查询结果转换为前端所需的格式
    const formattedProducts = products.map((product) => ({
        id: product.id,
        name: product.name,
        description: product.description || "", // 确保 description 是字符串
        price: product.price.toNumber(),
        comparePrice: product.comparePrice?.toNumber(),
        duration: product.duration,
        updatedAt: product.updatedAt.toISOString(),
        features: Array.isArray(product.features) ? product.features.map(f => f ? f.toString() : "") : [], // 确保 features 是 string[]
        plugin: {
            id: product.plugin.id,
            name: product.plugin.name,
            description: product.plugin.description || "", // 确保 description 是字符串
            version: product.plugin.version,
            avatar: product.plugin.avatar || "", // 确保 avatar 是字符串
            cover: product.plugin.cover || "", // 确保 cover 是字符串
        },
    }));

    const formattedPurchases = userPurchases.map((purchase) => ({
        id: purchase.id,
        purchaseDate: purchase.createdAt.toISOString(),
        expiryDate: purchase.license?.expiresAt?.toISOString() || null,
        licenseKey: purchase.license?.licenseKey || null, // 添加 licenseKey
        orderStatus: purchase.status, // 添加订单状态
        product: {
            id: purchase.product.id,
            name: purchase.product.name,
            description: purchase.product.description || "",
            price: purchase.product.price.toNumber(),
            comparePrice: purchase.product.comparePrice?.toNumber(),
            duration: purchase.product.duration,
            updatedAt: purchase.product.updatedAt.toISOString(),
            features: Array.isArray(purchase.product.features) ? purchase.product.features.map(f => f ? f.toString() : "") : [], // 确保 features 是 string[]
            plugin: {
                id: purchase.product.plugin.id,
                name: purchase.product.plugin.name,
                description: purchase.product.plugin.description || "",
                version: purchase.product.plugin.version,
                avatar: purchase.product.plugin.avatar || "",
                cover: purchase.product.plugin.cover || "",
            },
        },
    }));

    return {
        products: formattedProducts,
        userPurchases: formattedPurchases,
    };
}