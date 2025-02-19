"use client";

import { redirect, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { getUsers, getProducts, getCoupons, validateCoupon, getAffiliates } from "../queries";
import { createOrder } from "../actions";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Product, Affiliate } from "@prisma/client";
import { CustomerForm } from "../components/customer-form";
import { ProductSelection } from "../components/product-selection";
import { OrderSummary } from "../components/order-summary";

const TAX_RATE = 0.00;

interface OrderCalculation {
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
}

interface BillingInfo {
  billingName: string;
  billingEmail: string;
  billingCompany: string;
  billingAddress: string;
  billingCity: string;
  billingState: string;
  billingCountry: string;
  billingZip: string;
  billingPhone: string;
}

export default function NewOrderPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [affiliates, setAffiliates] = useState<(Affiliate & { user: User })[]>([]);
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
    affiliateId: "none",
    affiliateCommission: 0,
  });
  const [billingInfo, setBillingInfo] = useState<BillingInfo>({
    billingName: "",
    billingEmail: "",
    billingCompany: "",
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

  useEffect(() => {
    const loadData = async () => {
      try {
        const [usersData, productsData, affiliatesData] = await Promise.all([
          getUsers(),
          getProducts(),
          getAffiliates(),
        ]);
        setUsers(usersData);
        setProducts(productsData);
        setAffiliates(affiliatesData);
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

  const calculateAffiliateCommission = (affiliateId: string, amount: number) => {
    const affiliate = affiliates.find(a => a.id === affiliateId);
    if (!affiliate) return 0;

    return affiliate.commissionType === 'FIXED'
      ? Number(affiliate.commissionValue)
      : (amount * Number(affiliate.commissionValue)) / 100;
  };

  useEffect(() => {
    if (formData.affiliateId && formData.affiliateId !== "none" && calculation.total > 0) {
      const commission = calculateAffiliateCommission(formData.affiliateId, calculation.total);
      setFormData(prev => ({
        ...prev,
        affiliateCommission: commission
      }));
    }
  }, [formData.affiliateId, calculation.total]);

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
        billingCompany: user.billingCompany || "",
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
      setSelectedCoupon(result.coupon);
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
        affiliateId: formData.affiliateId === "none" ? null : formData.affiliateId,
        affiliateCommission: formData.affiliateId === "none" ? null : formData.affiliateCommission,
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

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Create New Order</h2>
        <p className="text-muted-foreground">
          Create a new order for a customer
        </p>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-8">
          <form onSubmit={handleCreateOrder}>
            <Tabs defaultValue="customer" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="customer">Customer</TabsTrigger>
                <TabsTrigger value="product">Product</TabsTrigger>
              </TabsList>

              <TabsContent value="customer">
                <CustomerForm
                  users={users}
                  selectedUserId={formData.userId}
                  billingInfo={billingInfo}
                  onUserChange={handleUserChange}
                  onBillingInfoChange={setBillingInfo}
                />
              </TabsContent>

              <TabsContent value="product">
                <ProductSelection
                  products={products}
                  selectedProduct={selectedProduct}
                  affiliates={affiliates}
                  affiliateId={formData.affiliateId}
                  affiliateCommission={formData.affiliateCommission}
                  onProductChange={handleProductChange}
                  onAffiliateChange={(value) => setFormData(prev => ({ 
                    ...prev, 
                    affiliateId: value,
                    affiliateCommission: value === "none" ? 0 : prev.affiliateCommission
                  }))}
                />
              </TabsContent>
            </Tabs>
          </form>
        </div>

        <div className="col-span-4">
          <OrderSummary
            calculation={calculation}
            formData={formData}
            selectedCoupon={selectedCoupon}
            onFormDataChange={setFormData}
            onCouponApply={handleCouponApply}
            onSubmit={handleCreateOrder}
            disabled={!formData.userId || !formData.productId || !formData.paymentMethod}
          />
        </div>
      </div>
    </div>
  );
}