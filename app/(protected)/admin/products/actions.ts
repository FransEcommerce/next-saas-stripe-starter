"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";

interface ProductInput {
  name: string;
  description?: string;
  price: number;
  comparePrice?: number;
  active?: boolean;
  duration?: number;
  features?: Record<string, any>;
  pluginId: string;
}

export async function createProduct(data: ProductInput) {
  try {
    const product = await prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        comparePrice: data.comparePrice,
        active: data.active ?? true,
        duration: data.duration,
        features: data.features ?? {},
        pluginId: data.pluginId,
      },
    });

    // Convert Decimal to number before returning
    const serializedProduct = {
      ...product,
      price: Number(product.price),
      comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
    };

    revalidatePath("/admin/products");
    return { success: true, product: serializedProduct };
  } catch (error) {
    console.error("Error creating product:", error);
    return { success: false, error: "Failed to create product" };
  }
}

export async function updateProduct(id: string, data: Partial<ProductInput>) {
  try {
    const product = await prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        comparePrice: data.comparePrice,
        active: data.active,
        duration: data.duration,
        features: data.features,
        pluginId: data.pluginId,
      },
    });

    // Convert Decimal to number before returning
    const serializedProduct = {
      ...product,
      price: Number(product.price),
      comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
    };

    revalidatePath("/admin/products");
    return { success: true, product: serializedProduct };
  } catch (error) {
    console.error("Error updating product:", error);
    return { success: false, error: "Failed to update product" };
  }
}

export async function deleteProduct(id: string) {
  try {
    // 检查产品是否有关联的订单
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        orders: {
          select: { id: true },
        },
      },
    });

    if (product?.orders.length) {
      return {
        success: false,
        error: "Cannot delete product with existing orders",
      };
    }

    await prisma.product.delete({
      where: { id },
    });

    revalidatePath("/admin/products");
    return { success: true };
  } catch (error) {
    console.error("Error deleting product:", error);
    return { success: false, error: "Failed to delete product" };
  }
}
