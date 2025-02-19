import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatPrice } from "@/lib/utils";
import { Product, Plugin, Affiliate } from "@prisma/client";
import Image from "next/image";

interface ProductSelectionProps {
  products: Product[];
  selectedProduct: (Product & { plugin: Plugin }) | null;
  affiliates: (Affiliate & { user: { name: string } })[];
  affiliateId: string;
  affiliateCommission: number;
  onProductChange: (productId: string) => void;
  onAffiliateChange: (affiliateId: string) => void;
}

export function ProductSelection({
  products,
  selectedProduct,
  affiliates,
  affiliateId,
  affiliateCommission,
  onProductChange,
  onAffiliateChange,
}: ProductSelectionProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Product Selection</CardTitle>
          <CardDescription>
            Choose a product to purchase
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="productId">Product</Label>
              <Select 
                value={selectedProduct?.id || ""}
                onValueChange={onProductChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} - {formatPrice(product.price)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedProduct && selectedProduct.plugin && (
        <Card>
          <CardHeader>
            <CardTitle>Product Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              {selectedProduct.plugin.avatar && (
                <div className="relative w-24 h-24 rounded-lg overflow-hidden">
                  <Image
                    src={selectedProduct.plugin.avatar}
                    alt={selectedProduct.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="flex-1 space-y-2">
                <h3 className="font-medium text-lg">{selectedProduct.name}</h3>
                <p className="text-muted-foreground">{selectedProduct.plugin.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold">{formatPrice(selectedProduct.price)}</span>
                  <span className="text-sm text-muted-foreground">Version {selectedProduct.plugin.version}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Affiliate Information</CardTitle>
          <CardDescription>
            Select a referral affiliate (optional)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="affiliateId">Affiliate</Label>
              <Select 
                value={affiliateId || "none"}
                onValueChange={onAffiliateChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an affiliate" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Affiliate</SelectItem>
                  {affiliates.map((affiliate) => (
                    <SelectItem key={affiliate.id} value={affiliate.id}>
                      {affiliate.user.name} ({affiliate.referralCode})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {affiliateId && affiliateId !== "none" && (
              <div className="text-sm text-muted-foreground">
                <p>Commission: {formatPrice(affiliateCommission)}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
