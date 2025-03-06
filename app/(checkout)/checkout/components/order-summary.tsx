"use client"

import { useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Tag } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import type { Product } from "./types"

interface OrderSummaryProps {
    product: Product
    onApplyCoupon: (code: string | null) => void
    couponCode: string
    couponApplied: boolean
    couponDiscount: number
}

export function OrderSummary({ product, onApplyCoupon, couponCode, couponApplied, couponDiscount }: OrderSummaryProps) {
    const [isApplying, setIsApplying] = useState(false)
    const [inputValue, setInputValue] = useState(couponCode)

    // Format price
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(price)
    }

    // Format duration
    const formatDuration = (duration: number | null) => {
        if (duration === null) return "Lifetime"
        if (duration === 365) return "1 Year"
        if (duration === 180) return "6 Months"
        if (duration === 90) return "3 Months"
        if (duration === 30) return "1 Month"
        return `${duration} Days`
    }

    // Calculate totals
    const subtotal = product.price
    const discount = couponApplied ? couponDiscount : 0
    const tax = 0 // No tax for this example
    const total = subtotal - discount + tax

    // Handle apply coupon
    const handleApplyCoupon = () => {
        setIsApplying(true)
        onApplyCoupon(inputValue)
        setIsApplying(false)
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="font-medium mb-4">Order Summary</h2>

                <div className="flex items-start gap-3 p-3 bg-white rounded-lg border">
                    <div className="h-16 w-16 rounded-lg overflow-hidden shrink-0">
                        <Image
                            src={product.plugin.avatar || "/placeholder.svg"}
                            alt={product.name}
                            width={64}
                            height={64}
                            className="object-cover"
                        />
                    </div>
                    <div>
                        <h3 className="font-medium">{product.name}</h3>
                        <p className="text-sm text-muted-foreground">Version {product.plugin.version}</p>
                        <p className="text-sm text-muted-foreground">{formatDuration(product.duration)} License</p>
                    </div>
                </div>
            </div>

            <div className="space-y-3">
                <div className="relative">
                    <Input
                        placeholder="Promo code"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        disabled={couponApplied || isApplying}
                    />
                    {couponApplied ? (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                setInputValue('')
                                onApplyCoupon(null)
                            }}
                            className="absolute right-1 top-1 h-7"
                        >
                            Remove
                        </Button>
                    ) : (
                        <Button
                            variant="ghost"
                            size="sm"
                            disabled={!inputValue.trim() || isApplying}
                            onClick={handleApplyCoupon}
                            className="absolute right-1 top-1 h-7"
                        >
                            {isApplying ? "Applying..." : "Apply"}
                        </Button>
                    )}
                </div>

                {couponApplied && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-center gap-2 text-sm text-green-600"
                    >
                        <Tag className="h-4 w-4" />
                        <span>Promo code applied: {formatPrice(couponDiscount)} off</span>
                    </motion.div>
                )}
            </div>

            <div className="space-y-2">
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                </div>

                {couponApplied && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="flex justify-between text-sm text-green-600"
                    >
                        <span>Discount</span>
                        <span>-{formatPrice(discount)}</span>
                    </motion.div>
                )}

                {tax > 0 && (
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Tax</span>
                        <span>{formatPrice(tax)}</span>
                    </div>
                )}

                <Separator />

                <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                </div>
            </div>

            <div className="text-xs text-muted-foreground">
                By completing your purchase you agree to these
                <a href="/terms" className="text-primary hover:underline ml-1">
                    Terms of Service
                </a>
                .
            </div>
        </div>
    )
}
