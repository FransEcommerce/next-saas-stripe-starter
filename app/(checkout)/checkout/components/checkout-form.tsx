"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { AppleIcon as ApplePay, CreditCard, Lock, Upload, X, ShoppingCartIcon as PayPal } from "lucide-react"
import { useMediaQuery } from "@/hooks/use-media-query"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

import { CheckoutLayout } from "./checkout-layout"
import { CheckoutSteps } from "./checkout-steps"
import { OrderSummary } from "./order-summary"
import type { Product } from "./types.ts"
import { FileUpload } from "@/components/file-upload";
import { validateCoupon } from "../actions"
import { toast } from "sonner";

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

    const fileInputRef = useRef<HTMLInputElement>(null)
    const [uploadedFile, setUploadedFile] = useState<File | null>(null)
    const [uploadedFilePreview, setUploadedFilePreview] = useState<string | null>(null)

    // Form data
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
        }));
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
            }));
        }
    }, [product.userBillingInfo]);

    // Calculate total price for display in mobile drawer
    const subtotal = product.price
    const discount = couponApplied ? couponDiscount : 0
    const total = subtotal - discount

    // Format price for display
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(price)
    }

    // Handle file upload
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            setUploadedFile(file)

            // Create a preview URL
            const reader = new FileReader()
            reader.onloadend = () => {
                setUploadedFilePreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    // Remove uploaded file
    const removeUploadedFile = () => {
        setUploadedFile(null)
        setUploadedFilePreview(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
    }

    // Handle form input change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    // Handle coupon code
    const handleApplyCoupon = async (code: string | null) => {
        if (code === null) {
            // Handle coupon removal
            setCouponCode('');
            setCouponApplied(false);
            setCouponDiscount(0);
            toast.success("Coupon removed successfully!", {
                position: isMobile ? "top-center" : "bottom-right"
            });
            return;
        }

        const result = await validateCoupon(code, product.price);
        if (result.error) {
            toast.error(result.error, {
                position: isMobile ? "top-center" : "bottom-right"
            });
            setCouponApplied(false);
            setCouponDiscount(0);
        } else if (result.coupon) {
            setCouponCode(code);
            setCouponApplied(true);
            setCouponDiscount(result.coupon.discountAmount);
            toast.success("Coupon applied successfully!", {
                position: isMobile ? "top-center" : "bottom-right"
            });
        }
    }
    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsProcessing(true)

        // Simulate payment processing
        setTimeout(() => {
            if (paymentMethod === "manual-transfer") {
                router.push("/checkout/pending?product=" + product.id)
            } else {
                router.push("/checkout/success?product=" + product.id)
            }
        }, 2000)
    }

    // Animation variants
    const fadeIn = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 },
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
                        <motion.form
                            key="step1"
                            {...fadeIn}
                            className="space-y-6"
                            onSubmit={(e) => {
                                e.preventDefault()
                                setCurrentStep(2)
                            }}
                        >
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="you@example.com"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Full name</Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            placeholder="John Doe"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="company">Company (Optional)</Label>
                                        <Input
                                            id="company"
                                            name="company"
                                            placeholder="Acme Inc."
                                            value={formData.company}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="address">Address</Label>
                                    <Input
                                        id="address"
                                        name="address"
                                        placeholder="123 Main St"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="city">City</Label>
                                        <Input
                                            id="city"
                                            name="city"
                                            placeholder="San Francisco"
                                            value={formData.city}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="state">State / Province</Label>
                                        <Input
                                            id="state"
                                            name="state"
                                            placeholder="CA"
                                            value={formData.state}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="zip">ZIP / Postal code</Label>
                                        <Input
                                            id="zip"
                                            name="zip"
                                            placeholder="94103"
                                            value={formData.zip}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="country">Country</Label>
                                        <Select
                                            value={formData.country}
                                            onValueChange={(value) => setFormData((prev) => ({ ...prev, country: value }))}
                                        >
                                            <SelectTrigger id="country">
                                                <SelectValue placeholder="Select country" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="US">United States</SelectItem>
                                                <SelectItem value="CA">Canada</SelectItem>
                                                <SelectItem value="GB">United Kingdom</SelectItem>
                                                <SelectItem value="AU">Australia</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>

                            <Button type="submit" className="w-full">
                                Continue to payment
                            </Button>
                        </motion.form>
                    )}

                    {currentStep === 2 && (
                        <motion.form key="step2" {...fadeIn} className="space-y-6" onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="font-medium">Payment method</h2>
                                    <div className="flex items-center gap-2">
                                        <Lock className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm text-muted-foreground">Secure payment</span>
                                    </div>
                                </div>

                                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="grid gap-4">
                                    <div
                                        className={`relative flex items-center rounded-lg border p-4 transition-colors ${paymentMethod === "apple-pay" ? "border-primary bg-primary/5" : ""}`}
                                    >
                                        <RadioGroupItem value="apple-pay" id="apple-pay" className="sr-only" />
                                        <Label htmlFor="apple-pay" className="flex flex-1 cursor-pointer items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <ApplePay className="h-5 w-5" />
                                                <span>Apple Pay</span>
                                            </div>
                                        </Label>
                                    </div>

                                    <div
                                        className={`relative flex items-center rounded-lg border p-4 transition-colors ${paymentMethod === "card" ? "border-primary bg-primary/5" : ""}`}
                                    >
                                        <RadioGroupItem value="card" id="card" className="sr-only" />
                                        <Label htmlFor="card" className="flex flex-1 cursor-pointer items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <CreditCard className="h-5 w-5" />
                                                <span>Credit card</span>
                                            </div>
                                        </Label>
                                    </div>

                                    <div
                                        className={`relative flex items-center rounded-lg border p-4 transition-colors ${paymentMethod === "paypal" ? "border-primary bg-primary/5" : ""}`}
                                    >
                                        <RadioGroupItem value="paypal" id="paypal" className="sr-only" />
                                        <Label htmlFor="paypal" className="flex flex-1 cursor-pointer items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <PayPal className="h-5 w-5" />
                                                <span>PayPal</span>
                                            </div>
                                        </Label>
                                    </div>

                                    <div
                                        className={`relative flex items-center rounded-lg border p-4 transition-colors ${paymentMethod === "manual-transfer" ? "border-primary bg-primary/5" : ""}`}
                                    >
                                        <RadioGroupItem value="manual-transfer" id="manual-transfer" className="sr-only" />
                                        <Label
                                            htmlFor="manual-transfer"
                                            className="flex flex-1 cursor-pointer items-center justify-between"
                                        >
                                            <div className="flex items-center gap-2">
                                                <Upload className="h-5 w-5" />
                                                <span>Manual bank transfer</span>
                                            </div>
                                        </Label>
                                    </div>
                                </RadioGroup>

                                <AnimatePresence mode="wait">
                                    {paymentMethod === "card" && (
                                        <motion.div
                                            key="card-form"
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="space-y-4"
                                        >
                                            <div className="space-y-2">
                                                <Label htmlFor="cardNumber">Card number</Label>
                                                <Input
                                                    id="cardNumber"
                                                    name="cardNumber"
                                                    placeholder="1234 5678 9012 3456"
                                                    value={formData.cardNumber}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="cardExpiry">Expiry date</Label>
                                                    <Input
                                                        id="cardExpiry"
                                                        name="cardExpiry"
                                                        placeholder="MM / YY"
                                                        value={formData.cardExpiry}
                                                        onChange={handleInputChange}
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="cardCvc">CVC</Label>
                                                    <Input
                                                        id="cardCvc"
                                                        name="cardCvc"
                                                        placeholder="123"
                                                        value={formData.cardCvc}
                                                        onChange={handleInputChange}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {paymentMethod === "paypal" && (
                                        <motion.div
                                            key="paypal-form"
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="space-y-4"
                                        >
                                            <div className="bg-blue-50 p-4 rounded-lg text-center">
                                                <div className="flex justify-center mb-4">
                                                    <PayPal className="h-8 w-8 text-blue-600" />
                                                </div>
                                                <p className="text-sm text-muted-foreground mb-4">
                                                    You will be redirected to PayPal to complete your payment securely.
                                                </p>
                                            </div>
                                        </motion.div>
                                    )}

                                    {paymentMethod === "manual-transfer" && (
                                        <motion.div
                                            key="manual-transfer-form"
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="space-y-4"
                                        >
                                            <div className="bg-yellow-50 p-4 rounded-lg mb-4">
                                                <h4 className="font-medium mb-2">Manual Payment Instructions</h4>
                                                <p className="text-sm text-muted-foreground mb-2">
                                                    Please transfer the total amount to the following account:
                                                </p>
                                                <div className="text-sm space-y-1">
                                                    <div className="flex justify-between">
                                                        <span className="font-medium">Account Name:</span>
                                                        <span>NextPion Inc.</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="font-medium">Account Number:</span>
                                                        <span>1234567890</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="font-medium">Bank:</span>
                                                        <span>Example Bank</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="font-medium">Reference:</span>
                                                        <span>
                                                            ORDER-
                                                            {Math.floor(Math.random() * 10000)
                                                                .toString()
                                                                .padStart(4, "0")}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="paymentProof">Upload Payment Proof</Label>
                                                <FileUpload
                                                    parentId={process.env.NEXT_PUBLIC_PAYMENT_PARENT_ID}
                                                    onUploadComplete={(data) => {
                                                        handleFormDataChange({
                                                            paymentProof: data.downloadUrl
                                                        });
                                                    }}
                                                    accept="image/*,.pdf"
                                                    placeholderText="Upload payment receipt or screenshot"
                                                    value={formData.paymentProof}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="paymentNote">Payment Note (Optional)</Label>
                                                <Textarea
                                                    id="paymentNote"
                                                    name="paymentNote"
                                                    placeholder="Add any additional information about your payment"
                                                    className="resize-none"
                                                    rows={3}
                                                    value={formData.paymentNote}
                                                    onChange={(e) => setFormData((prev) => ({ ...prev, paymentNote: e.target.value }))}
                                                />
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <div className="flex gap-3">
                                <Button type="button" variant="outline" onClick={() => setCurrentStep(1)}>
                                    Back
                                </Button>
                                <Button
                                    type="submit"
                                    className="flex-1"
                                    disabled={isProcessing || (paymentMethod === "manual-transfer" && !uploadedFile)}
                                >
                                    {isProcessing ? (
                                        <div className="flex items-center">
                                            <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                                            Processing...
                                        </div>
                                    ) : paymentMethod === "manual-transfer" ? (
                                        "Submit Payment Proof"
                                    ) : paymentMethod === "paypal" ? (
                                        "Continue to PayPal"
                                    ) : (
                                        `Pay ${formatPrice(total)}`
                                    )}
                                </Button>
                            </div>
                        </motion.form>
                    )}
                </AnimatePresence>
            </div>
        </CheckoutLayout>
    )
}