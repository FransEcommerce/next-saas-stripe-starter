export interface Plugin {
    id: string
    name: string
    description: string
    version: string
    chatpionVersion?: string
    avatar: string
    cover: string
}

export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    comparePrice?: number;
    duration: number | null;
    features: string[];
    plugin: Plugin;
    updatedAt: string
}

export interface Purchase {
    id: string;
    purchaseDate: string;
    expiryDate: string | null;
    licenseKey: string | null;
    product: Product;
}
