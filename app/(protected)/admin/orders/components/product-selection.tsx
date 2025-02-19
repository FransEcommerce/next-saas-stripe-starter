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
import { Badge } from "@/components/ui/badge";

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
      <div className="grid grid-cols-2 gap-4">
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
            </div>
          </CardContent>
        </Card>
      </div>

      {selectedProduct && selectedProduct.plugin && (
        <Card>
          <CardHeader>
            <CardTitle>Product Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 bg-muted/70 rounded-xl p-3">
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
                  <span className="text-xl font-bold text-primary">{formatPrice(selectedProduct.price)}</span>
                  <Badge variant="default" className="text-xs">v{selectedProduct.plugin.version}</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
