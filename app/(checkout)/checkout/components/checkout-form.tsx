"use client"

import React, { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence } from "framer-motion"
import { useMediaQuery } from "@/hooks/use-media-query"
import { toast } from "sonner"

import { CheckoutLayout } from "./checkout-layout"
import { CheckoutSteps } from "./checkout-steps"
import { OrderSummary } from "./order-summary"
import { BillingAddressForm } from "./billing-address-form"
import { PaymentForm } from "./payment-form"
import type { Product } from "./types.ts"
import { validateCoupon } from "../actions"

const CHECKOUT_STEPS = ["Information", "Payment"]

interface CheckoutFormProps {
    product: Product
}

export function CheckoutForm({ product }: CheckoutFormProps) {
    const { isMobile } = useMediaQuery()
    const router = useRouter()
    const [currentStep, setCurrentStep] = useState(1)
    const [isProcessing, setIsProcessing] = useState(false)
    const [paymentMethod, setPaymentMethod] = useState("card")
    const [couponCode, setCouponCode] = useState("")
    const [couponApplied, setCouponApplied] = useState(false)
    const [couponDiscount, setCouponDiscount] = useState(0)
    const [uploadedFile, setUploadedFile] = useState<File | null>(null)

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
                email: product.userBillingInfo?.email || "",
                name: product.userBillingInfo?.name || "",
                company: product.userBillingInfo?.company || "",
                address: product.userBillingInfo?.address || "",
                city: product.userBillingInfo?.city || "",
                state: product.userBillingInfo?.state || "",
                zip: product.userBillingInfo?.zip || "",
                country: product.userBillingInfo?.country || "US",
            }))
        }
    }, [product.userBillingInfo])

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsProcessing(true)

        setTimeout(() => {
            if (paymentMethod === "manual-transfer") {
                router.push("/checkout/pending?product=" + product.id)
            } else {
                router.push("/checkout/success?product=" + product.id)
            }
        }, 2000)
    }

    return (
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
        >
            <div className="space-y-8">
                <CheckoutSteps currentStep={currentStep} />
                <AnimatePresence mode="wait">
                    {currentStep === 1 && (
                        <BillingAddressForm
                            key="step1"
                            formData={formData}
                            handleInputChange={handleInputChange}
                            setFormData={setFormData}
                            onNext={() => setCurrentStep(2)}
                        />
                    )}
                    {currentStep === 2 && (
                        <PaymentForm
                            key="step2"
                            formData={formData}
                            paymentMethod={paymentMethod}
                            setPaymentMethod={setPaymentMethod}
                            handleInputChange={handleInputChange}
                            handleFormDataChange={handleFormDataChange}
                            setFormData={setFormData}
                            isProcessing={isProcessing}
                            uploadedFile={uploadedFile}
                            total={total}
                            formatPrice={formatPrice}
                            onBack={() => setCurrentStep(1)}
                            onSubmit={handleSubmit}
                        />
                    )}
                </AnimatePresence>
            </div>
        </CheckoutLayout>
    )
}