export interface OrderListProps {
    orders: {
        id: string;
        orderNumber: string;
        status: string;
        amount: number;
        subtotal: number; // 添加 subtotal 属性
        discountAmount?: number | null; // 添加 discountAmount 属性
        tax?: number | null; // 添加 tax 属性
        paymentMethod?: string | null; // 添加 paymentMethod 属性
        paymentNote?: string | null; // 添加 paymentNote 属性
        paymentProof?: string | null; // 添加 paymentProof 属性
        couponCode?: string | null; // 添加 couponCode 属性
        coupon?: {
            code: string;
            value: number;
            type: string;
        } | null; // 添加 coupon 属性
        product: {
            name: string;
            price: string | number; // 添加 price 属性
            plugin: {
                name: string;
                version: string; // 添加 version 属性
                avatar?: string | null;
                description?: string | null; // 添加 description 属性
            };
        };
        user: {
            name?: string | null;
            email?: string | null;
        };
        license?: {
            id: string;
            licenseKey: string;
            status: string;
            domain?: string | null;
            activatedAt?: Date | null;
            expiresAt?: Date | null;
        } | null; // 添加 license 属性
    }[];
}