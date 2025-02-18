"use client";

import { redirect, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { getUsers, getProducts, getCoupons, validateCoupon } from "../queries";
import { createOrder } from "../actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatPrice } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import Image from "next/image";
import { FileUpload } from "@/components/file-upload";
import { Search } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const TAX_RATE = 0.08;

interface OrderCalculation {
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
}

interface BillingInfo {
  billingName: string;
  billingEmail: string;
  billingAddress: string;
  billingCity: string;
  billingState: string;
  billingCountry: string;
  billingZip: string;
  billingPhone: string;
}

export default function NewOrderPage() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    userId: "",
    productId: "",
    couponCode: "",
    couponId: "",
    discountAmount: 0,
    status: "PENDING",
    paymentMethod: "",
    paymentNote: "",
    paymentProof: "",
    amount: 0,
    subtotal: 0,
    tax: 0,
  });
  const [billingInfo, setBillingInfo] = useState<BillingInfo>({
    billingName: "",
    billingEmail: "",
    billingAddress: "",
    billingCity: "",
    billingState: "",
    billingCountry: "",
    billingZip: "",
    billingPhone: "",
  });
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [calculation, setCalculation] = useState<OrderCalculation>({
    subtotal: 0,
    discount: 0,
    tax: 0,
    total: 0,
  });
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [usersData, productsData] = await Promise.all([
          getUsers(),
          getProducts(),
        ]);
        setUsers(usersData);
        setProducts(productsData);
      } catch (error) {
        toast.error("Failed to load data");
        console.error("Error loading data:", error);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (selectedProduct) {
      const subtotal = Number(selectedProduct.price);
      const newCalculation = {
        subtotal,
        discount: formData.discountAmount,
        tax: ((subtotal - formData.discountAmount) * TAX_RATE),
        total: 0
      };
      newCalculation.total = newCalculation.subtotal - newCalculation.discount + newCalculation.tax;
      
      setCalculation(newCalculation);
      setFormData(prev => ({
        ...prev,
        amount: newCalculation.total,
        subtotal: newCalculation.subtotal,
        tax: newCalculation.tax
      }));
    }
  }, [selectedProduct, formData.discountAmount]);

  const handleProductChange = (productId: string) => {
    setFormData(prev => ({ ...prev, productId }));
    const product = products.find(p => p.id === productId);
    setSelectedProduct(product);
  };

  const handleUserChange = (userId: string) => {
    setFormData(prev => ({ ...prev, userId }));
    const user = users.find(u => u.id === userId);
    if (user) {
      setBillingInfo({
        billingName: user.billingName || "",
        billingEmail: user.email || "",
        billingAddress: user.billingAddress || "",
        billingCity: user.billingCity || "",
        billingState: user.billingState || "",
        billingCountry: user.billingCountry || "",
        billingZip: user.billingZip || "",
        billingPhone: user.billingPhone || "",
      });
    }
  };

  const handleCouponApply = async () => {
    if (!formData.couponCode) {
      toast.error("Please enter a coupon code");
      return;
    }

    if (!selectedProduct) {
      toast.error("Please select a product first");
      return;
    }

    const result = await validateCoupon(formData.couponCode, calculation.subtotal);
    
    if (result.error) {
      toast.error(result.error);
      return;
    }

    if (result.coupon) {
      setFormData(prev => ({
        ...prev,
        couponId: result.coupon.id,
        discountAmount: result.coupon.discountAmount
      }));

      // 重新计算订单金额
      const newCalculation = {
        subtotal: calculation.subtotal,
        discount: result.coupon.discountAmount,
        tax: ((calculation.subtotal - result.coupon.discountAmount) * TAX_RATE),
        total: 0
      };
      newCalculation.total = newCalculation.subtotal - newCalculation.discount + newCalculation.tax;
      
      setCalculation(newCalculation);
      toast.success("Coupon applied successfully!");
    }
  };

  async function handleCreateOrder(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (!selectedProduct) {
        throw new Error("Please select a product");
      }

      if (!formData.userId) {
        throw new Error("Please select a customer");
      }

      if (!formData.paymentMethod) {
        throw new Error("Please select a payment method");
      }

      const orderData = {
        userId: formData.userId,
        productId: formData.productId,
        couponId: formData.couponId,
        amount: Number(formData.amount),
        subtotal: Number(formData.subtotal),
        discountAmount: Number(formData.discountAmount),
        tax: Number(formData.tax),
        status: formData.status,
        paymentMethod: formData.paymentMethod,
        paymentNote: formData.paymentNote,
        paymentProof: formData.paymentProof,
        ...billingInfo,
      };

      const order = await createOrder(orderData);

      if (!order?.id) {
        throw new Error("Failed to create order");
      }

      toast.success("Order created successfully");
      router.push(`/admin/orders/${order.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create order");
      console.error("Error creating order:", error);
    }
  }

  const filteredUsers = users.filter(user => {
    if (!search) return true;
    const searchLower = search.toLowerCase().trim();
    return (
      (user.name?.toLowerCase() || "").includes(searchLower) ||
      (user.email?.toLowerCase() || "").includes(searchLower)
    );
  });

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Create New Order</h2>
        <p className="text-muted-foreground">
          Create a new order for a customer
        </p>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left Column - Order Form */}
        <div className="col-span-8">
          <form onSubmit={handleCreateOrder}>
            <Tabs defaultValue="customer" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="customer">Customer</TabsTrigger>
                <TabsTrigger value="product">Product</TabsTrigger>
              </TabsList>

              <TabsContent value="customer" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Customer Information</CardTitle>
                    <CardDescription>
                      Select a customer and fill in billing information
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="userId">Customer</Label>
                        <Popover open={open} onOpenChange={setOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={open}
                              className="w-full justify-between"
                            >
                              {formData.userId ? (
                                <div className="flex flex-col items-start">
                                  {users.find(u => u.id === formData.userId)?.name}
                                  <div className="text-xs text-muted-foreground">{users.find(u => u.id === formData.userId)?.email}</div>
                                </div>
                              ) : (
                                "Select customer..."
                              )}
                              <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                            <Command shouldFilter={false}>
                              <CommandInput
                                placeholder="Search by email..."
                                value={search}
                                onValueChange={setSearch}
                                className="h-9"
                              />
                              {filteredUsers.length === 0 ? (
                                <CommandEmpty>No customer found.</CommandEmpty>
                              ) : (
                                <CommandGroup className="max-h-[300px] overflow-auto">
                                  {filteredUsers.map((user) => (
                                    <CommandItem
                                      key={user.id}
                                      onSelect={() => {
                                        setFormData(prev => ({ ...prev, userId: user.id }));
                                        handleUserChange(user.id);
                                        setOpen(false);
                                      }}
                                      className="cursor-pointer hover:bg-accent"
                                    >
                                      <button
                                        type="button"
                                        className="flex flex-col w-full text-left"
                                        onClick={() => {
                                          setFormData(prev => ({ ...prev, userId: user.id }));
                                          handleUserChange(user.id);
                                          setOpen(false);
                                        }}
                                      >
                                        <div>{user.name}</div>
                                        <div className="text-xs text-muted-foreground">{user.email}</div>
                                      </button>
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              )}
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </div>
 
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="billingName">Full Name</Label>
                          <Input
                            id="billingName"
                            value={billingInfo.billingName}
                            onChange={(e) => setBillingInfo(prev => ({ ...prev, billingName: e.target.value }))}
                            placeholder="John Doe"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="billingEmail">Email</Label>
                          <Input
                            id="billingEmail"
                            value={billingInfo.billingEmail}
                            onChange={(e) => setBillingInfo(prev => ({ ...prev, billingEmail: e.target.value }))}
                            type="email"
                            placeholder="john@example.com"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="billingAddress">Address</Label>
                        <Input
                          id="billingAddress"
                          value={billingInfo.billingAddress}
                          onChange={(e) => setBillingInfo(prev => ({ ...prev, billingAddress: e.target.value }))}
                          placeholder="123 Street Name"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="billingCity">City</Label>
                          <Input
                            id="billingCity"
                            value={billingInfo.billingCity}
                            onChange={(e) => setBillingInfo(prev => ({ ...prev, billingCity: e.target.value }))}
                            placeholder="City"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="billingState">State</Label>
                          <Input
                            id="billingState"
                            value={billingInfo.billingState}
                            onChange={(e) => setBillingInfo(prev => ({ ...prev, billingState: e.target.value }))}
                            placeholder="State"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="billingZip">ZIP Code</Label>
                          <Input
                            id="billingZip"
                            value={billingInfo.billingZip}
                            onChange={(e) => setBillingInfo(prev => ({ ...prev, billingZip: e.target.value }))}
                            placeholder="ZIP"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="billingCountry">Country</Label>
                          <Input
                            id="billingCountry"
                            value={billingInfo.billingCountry}
                            onChange={(e) => setBillingInfo(prev => ({ ...prev, billingCountry: e.target.value }))}
                            placeholder="Country"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="billingPhone">Phone</Label>
                          <Input
                            id="billingPhone"
                            value={billingInfo.billingPhone}
                            onChange={(e) => setBillingInfo(prev => ({ ...prev, billingPhone: e.target.value }))}
                            type="tel"
                            placeholder="+1 234 567 8900"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="product" className="space-y-4">
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
                          value={formData.productId}
                          onValueChange={handleProductChange}
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
              </TabsContent>
            </Tabs>
          </form>
        </div>

        {/* Right Column - Order Summary */}
        <div className="col-span-4">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
              <CardDescription>
                Review order details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Order Status</Label>
                  <Select 
                    value={formData.status}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="PROCESSING">Processing</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Payment Method</Label>
                  <Select 
                    value={formData.paymentMethod}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, paymentMethod: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="STRIPE">Credit Card (Stripe)</SelectItem>
                      <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.paymentMethod && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="paymentNote">Payment Note</Label>
                      <Textarea
                        id="paymentNote"
                        value={formData.paymentNote}
                        onChange={(e) => setFormData(prev => ({ ...prev, paymentNote: e.target.value }))}
                        placeholder="Enter payment details or instructions..."
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="paymentProof">Payment Proof</Label>
                      <FileUpload
                        parentId="903f8177-8654-41f8-bab9-f8cbaf5c2d7a"
                        onUploadComplete={(data) => {
                          setFormData(prev => ({
                            ...prev,
                            paymentProof: data.downloadUrl
                          }));
                        }}
                        accept="image/*,.pdf"
                        placeholderText="Upload payment receipt or screenshot"
                        value={formData.paymentProof}
                        buttonText="Browse"
                      />
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="couponCode">Coupon Code</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="couponCode"
                      value={formData.couponCode}
                      onChange={(e) => setFormData(prev => ({ ...prev, couponCode: e.target.value }))}
                      placeholder="Enter coupon code"
                    />
                    <Button type="button" onClick={handleCouponApply}>
                      Apply
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">{formatPrice(calculation.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Discount</span>
                    <span className="font-medium text-green-600">
                      -{formatPrice(calculation.discount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax ({TAX_RATE*100}%)</span>
                    <span className="font-medium">{formatPrice(calculation.tax)}</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Total</span>
                      <span className="font-bold">{formatPrice(calculation.total)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {selectedCoupon && (
                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">Applied Coupon</h4>
                  <div className="text-sm text-muted-foreground">
                    <p>{selectedCoupon.code}</p>
                    <p>{selectedCoupon.type === "FIXED" 
                      ? `${formatPrice(selectedCoupon.value)} off`
                      : `${selectedCoupon.value}% off`}
                    </p>
                  </div>
                </div>
              )}

              <Button 
                className="w-full" 
                type="submit"
                disabled={!formData.userId || !formData.productId || !formData.paymentMethod}
                onClick={handleCreateOrder}
              >
                Create Order
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}