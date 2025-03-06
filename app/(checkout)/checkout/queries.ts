import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export async function getProductById(productId: string) {
  const user = await getCurrentUser();

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      plugin: true,
    },
  });

  if (!product) {
    throw new Error("Product not found");
  }

  return {
    id: product.id,
    name: product.name,
    description: product.description || "",
    price: product.price.toNumber(),
    comparePrice: product.comparePrice?.toNumber(),
    duration: product.duration,
    features: Array.isArray(product.features) ? product.features.map(f => f ? f.toString() : "") : [],
    plugin: {
      id: product.plugin.id,
      name: product.plugin.name,
      description: product.plugin.description || "",
      version: product.plugin.version,
      avatar: product.plugin.avatar || "",
      cover: product.plugin.cover || "",
    },
    userBillingInfo: user ? {
      email: user.email || "",
      name: user.billingName || "",
      company: user.billingCompany || "",
      address: user.billingAddress || "",
      city: user.billingCity || "",
      state: user.billingState || "",
      zip: user.billingZip || "",
      country: user.billingCountry || "US",
    } : null,
  };
}