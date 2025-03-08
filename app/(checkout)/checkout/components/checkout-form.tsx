"use client"

import React, { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence } from "framer-motion"
import { useMediaQuery } from "@/hooks/use-media-query"
import { toast } from "sonner"
import { useForm, FormProvider } from "react-hook-form"

import { CheckoutLayout } from "./checkout-layout"
import { OrderSummary } from "./order-summary"
import { BillingAddressForm } from "./billing-address-form"
import { PaymentForm } from "./payment-form"
import type { Product } from "./types.ts"
import { validateCoupon, createCheckoutOrder } from "../actions"

const CHECKOUT_STEPS = ["Information", "Payment"]

interface CheckoutFormProps {
    product: Product
}

export function CheckoutForm({ product }: CheckoutFormProps) {
    const { isMobile } = useMediaQuery()
    const router = useRouter()
    const [currentStep, setCurrentStep] = useState(1)
    const [isProcessing, setIsProcessing] = useState(false)
    const [paymentMethod, setPaymentMethod] = useState("razorpay")
    const [couponCode, setCouponCode] = useState("")
    const [couponApplied, setCouponApplied] = useState(false)
    const [couponDiscount, setCouponDiscount] = useState(0)

    // 创建表单方法
    const methods = useForm({
        defaultValues: {
            paymentMethod: "razorpay",
            paymentProof: "",
            paymentNote: "",
            razorpayPaymentId: "",
            razorpayOrderId: "",
            razorpaySignature: "",
            billingInfo: {
                name: "",
                email: "",
                company: "",
                address: "",
                city: "",
                state: "",
                zip: "",
                country: "US",
                phone: "",
            }
        }
    });

    const [formData, setFormData] = useState({
        email: "",
        name: "",
        company: "",
        address: "",
        city: "",
        state: "",
        zip: "",
        country: "US",
        cardNumber: "",
        cardExpiry: "",
        cardCvc: "",
        paymentNote: "",
        paymentProof: "",
        phone: "",
    })

    const handleFormDataChange = (newData: Partial<typeof formData>) => {
        setFormData((prev) => ({
            ...prev,
            ...newData,
        }))
    }

    useEffect(() => {
        if (product.userBillingInfo) {
            setFormData((prev) => ({
                ...prev,
                country: product.userBillingInfo?.country || "US",
            }));
            
            setTimeout(() => {
                setFormData((prev) => ({
                    ...prev,
                    email: product.userBillingInfo?.email || "",
                    name: product.userBillingInfo?.name || "",
                    company: product.userBillingInfo?.company || "",
                    address: product.userBillingInfo?.address || "",
                    state: product.userBillingInfo?.state || "",
                    zip: product.userBillingInfo?.zip || "",
                    phone: product.userBillingInfo?.phone || "",
                }));
                
                setTimeout(() => {
                    setFormData((prev) => ({
                        ...prev,
                        city: product.userBillingInfo?.city || "",
                    }));
                }, 200);
            }, 100);
        }
    }, [product.userBillingInfo]);

    // 同步 formData 和 react-hook-form
    useEffect(() => {
        methods.setValue("billingInfo.name", formData.name);
        methods.setValue("billingInfo.email", formData.email);
        methods.setValue("billingInfo.company", formData.company);
        methods.setValue("billingInfo.address", formData.address);
        methods.setValue("billingInfo.city", formData.city);
        methods.setValue("billingInfo.state", formData.state);
        methods.setValue("billingInfo.zip", formData.zip);
        methods.setValue("billingInfo.country", formData.country);
        methods.setValue("billingInfo.phone", formData.phone);
    }, [formData, methods]);

    // 同步支付方式
    useEffect(() => {
        methods.setValue("paymentMethod", paymentMethod);
    }, [paymentMethod, methods]);

    const subtotal = product.price
    const discount = couponApplied ? couponDiscount : 0
    const total = subtotal - discount

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(price)
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleApplyCoupon = async (code: string | null) => {
        if (code === null) {
            setCouponCode("")
            setCouponApplied(false)
            setCouponDiscount(0)
            toast.success("Coupon removed successfully!", {
                position: isMobile ? "top-center" : "bottom-right"
            })
            return
        }

        const result = await validateCoupon(code, product.price)
        if (result.error) {
            toast.error(result.error, {
                position: isMobile ? "top-center" : "bottom-right"
            })
            setCouponApplied(false)
            setCouponDiscount(0)
        } else if (result.coupon) {
            setCouponCode(code)
            setCouponApplied(true)
            setCouponDiscount(result.coupon.discountAmount)
            toast.success("Coupon applied successfully!", {
                position: isMobile ? "top-center" : "bottom-right"
            })
        }
    }

    const handleSubmit = async (formValues: any) => {
        setIsProcessing(true);

        try {
            const submitData = {
                productId: product.id,
                couponCode: couponCode,
                paymentMethod: formValues.paymentMethod,
                status: formValues.status,
                paymentProof: formValues.paymentProof,
                paymentNote: formValues.paymentNote,
                billingInfo: formValues.billingInfo,
                ...(formValues.razorpayPaymentId && {
                    razorpayPaymentId: formValues.razorpayPaymentId,
                    razorpayOrderId: formValues.razorpayOrderId,
                    razorpaySignature: formValues.razorpaySignature,
                }),
                ...(formValues.paypalOrderId && {
                    paypalOrderId: formValues.paypalOrderId,
                    paypalPaymentId: formValues.paypalPaymentId,
                })
            };

            console.log('提交结账数据:', submitData);

            const result = await createCheckoutOrder(submitData);

            if (result.success) {
                router.push(`/checkout/thank-you?orderNumber=${result.orderNumber}`);
                return {
                    success: true,
                    orderNumber: result.orderNumber
                };
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error("Checkout error:", error);
            toast.error(error.message || "Failed to process checkout");
            return {
                success: false,
                error: error.message || "Failed to process checkout"
            };
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <FormProvider {...methods}>
            <CheckoutLayout
                orderSummary={
                    <OrderSummary
                        product={product}
                        onApplyCoupon={handleApplyCoupon}
                        couponCode={couponCode}
                        couponApplied={couponApplied}
                        couponDiscount={couponDiscount}
                    />
                }
                totalPrice={formatPrice(total)}
                currentStep={currentStep}
            >
                <div className="pt-4">
                    <AnimatePresence mode="wait">
                        {currentStep === 1 && (
                            <BillingAddressForm
                                key="step1"
                                formData={formData}
                                handleInputChange={handleInputChange}
                                handleFormDataChange={handleFormDataChange}
                                onNext={() => setCurrentStep(2)}
                            />
                        )}
                        {currentStep === 2 && (
                            <PaymentForm
                                key="step2"
                                total={total}
                                formData={formData}
                                isProcessing={isProcessing}
                                paymentMethod={paymentMethod}
                                setPaymentMethod={setPaymentMethod}
                                handleFormDataChange={handleFormDataChange}
                                onBack={() => setCurrentStep(1)}
                                onSubmit={methods.handleSubmit(handleSubmit)}
                                formatPrice={formatPrice}
                                productName={product.name}
                            />
                        )}
                    </AnimatePresence>
                </div>
            </CheckoutLayout>
        </FormProvider>
    )
}