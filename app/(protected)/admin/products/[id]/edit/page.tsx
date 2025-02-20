import { redirect } from "next/navigation";
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

export default async function EditProductPage({ params }: EditProductPageProps) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") redirect("/login");

  const [product, plugins] = await Promise.all([
    prisma.product.findUnique({
      where: { id: params.id },
    }).then(product => {
      if (!product) return null;
      return {
        ...product,
        price: product.price.toNumber(),
        comparePrice: product.comparePrice?.toNumber() || null
      };
    }),
    prisma.plugin.findMany({
      orderBy: {
        name: "asc",
      },
    }),
  ]);

  if (!product) redirect("/admin/products");

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <ProductForm plugins={plugins} product={product} />
    </div>
  );
}
