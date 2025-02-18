import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { constructMetadata } from "@/lib/utils";
import { ProductForm } from "../components/product-form";

export const metadata = constructMetadata({
  title: "New Product – Admin Panel",
  description: "Create a new product",
});

export default async function NewProductPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") redirect("/login");

  const plugins = await prisma.plugin.findMany({
    orderBy: {
      name: "asc",
    },
  });

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <ProductForm plugins={plugins} />
    </div>
  );
}
