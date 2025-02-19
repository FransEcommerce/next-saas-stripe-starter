import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { constructMetadata } from "@/lib/utils";
import { ProductsList } from "./components/products-list";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/header";

export const metadata = constructMetadata({
  title: "Products – Admin Panel",
  description: "Manage your products",
});

export default async function ProductsPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") redirect("/login");

  const products = await prisma.product.findMany({
    include: {
      plugin: true,
      orders: {
        select: {
          id: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // 序列化 Decimal 类型数据
  const serializedProducts = products.map(product => ({
    ...product,
    price: product.price.toString(),
    comparePrice: product.comparePrice?.toString(),
  }));

  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between">
        <DashboardHeader
          heading="Products"
          text="Create and manage products."
        />
        <div className="flex items-center space-x-2">
          <Link href="/admin/products/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Product
            </Button>
          </Link>
        </div>
      </div>
      <div className="grid gap-4">
        <ProductsList products={serializedProducts} />
      </div>
    </div>
  );
}
