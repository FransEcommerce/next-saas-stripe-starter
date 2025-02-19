import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { constructMetadata } from "@/lib/utils";
import { ProductForm } from "../../components/product-form";

export const metadata = constructMetadata({
  title: "Edit Product – Admin Panel",
  description: "Edit product details",
});

interface EditProductPageProps {
  params: {
    id: string;
  };
}

async function getProduct(productId: string) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      plugin: true,
      orders: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!product) {
    notFound();
  }

  // 序列化 Decimal 类型数据
  return {
    ...product,
    price: product.price.toString(),
    comparePrice: product.comparePrice?.toString(),
  };
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") redirect("/login");

  const product = await getProduct(params.id);
  const plugins = await prisma.plugin.findMany({
    orderBy: {
      name: "asc",
    },
  });

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <ProductForm plugins={plugins} product={product} />
    </div>
  );
}
