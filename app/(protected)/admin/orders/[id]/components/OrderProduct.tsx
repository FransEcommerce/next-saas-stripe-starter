"use client";

import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";

interface OrderProductProps {
  order: {
    product: {
      name: string;
      price: number | string;
      plugin: {
        name: string;
        version: string;
        avatar?: string | null;
        description?: string | null;
      };
    };
  };
}

export function OrderProduct({ order }: OrderProductProps) {
  const { product } = order;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Product</CardTitle>
        <CardDescription>Product details and information</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-start space-x-4 p-3 bg-muted/50 rounded-xl">
          {product.plugin.avatar && (
            <div className="relative h-16 w-16 overflow-hidden rounded-lg">
              <Image
                src={product.plugin.avatar}
                alt={product.plugin.name}
                fill
                className="object-cover"
              />
            </div>
          )}
          <div className="flex-1 space-y-1">
            <div>
              <p className="font-medium leading-none">
                {product.plugin.name}
              </p>
              <p className="text-sm text-muted-foreground">
                Version {product.plugin.version}
              </p>
            </div>
            {product.plugin.description && (
              <p className="text-sm text-muted-foreground">
                {product.plugin.description}
              </p>
            )}
            <p className="font-medium">
              {formatPrice(Number(product.price))}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
