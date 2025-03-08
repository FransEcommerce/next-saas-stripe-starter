"use client"

import { useState } from "react"
import Image from "next/image"
import { CheckCircle2, Clock, Download, ExternalLink, ShoppingCart, Star, Eye, EyeOff, Copy, Check, Loader2 } from "lucide-react"
import { toast } from "sonner";

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import type { Product } from "./types"

interface PluginCardProps {
    product: Product
    isPurchased?: boolean
    isPending?: boolean
    purchaseExpiryDate?: string | null
    licenseKey?: string | null
    orderStatus?: string | null
    onPurchase?: (productId: string) => void
}

export function PluginCard({ 
    product, 
    isPurchased = false, 
    isPending = false,
    purchaseExpiryDate = null, 
    licenseKey = null, 
    orderStatus = null,
    onPurchase 
}: PluginCardProps) {
    const [isHovered, setIsHovered] = useState(false)
    const [showLicenseKey, setShowLicenseKey] = useState(false)

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

    // Format expiry date
    const formatExpiryDate = (date: string) => {
        return new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        })
    }

    // Random rating for demo purposes
    const rating = (Math.floor(Math.random() * 10) + 40) / 10 // Random rating between 4.0 and 5.0

    const toggleLicenseKeyVisibility = () => {
        setShowLicenseKey(!showLicenseKey)
    }

    const copyLicenseKey = () => {
        navigator.clipboard.writeText(licenseKey || "");
        toast.success("License key copied to clipboard");
    }

    const maskLicenseKey = (key: string | null) => {
        if (!key) return ""
        return key.replace(/[A-Z0-9]/g, "•");
    }

    // 根据状态获取卡片样式
    const getCardStyle = () => {
        if (isPurchased) {
            return "bg-gradient-to-br from-green-50 to-background dark:from-green-950/30 dark:to-background ring-1 ring-green-100 dark:ring-green-900/30";
        } else if (isPending) {
            return "bg-gradient-to-br from-amber-50 to-background dark:from-amber-950/30 dark:to-background ring-1 ring-amber-100 dark:ring-amber-900/30";
        } else {
            return "bg-background";
        }
    }

    // 获取状态徽章
    const getStatusBadge = () => {
        if (isPurchased) {
            return <Badge className="bg-green-500 text-white">Owned</Badge>;
        } else if (isPending) {
            return <Badge className="bg-amber-500 text-white">Processing</Badge>;
        } else if (product.comparePrice) {
            return (
                <Badge className="bg-rose-500 text-white">
                    Save {Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)}%
                </Badge>
            );
        }
        return null;
    }

    return (
        <Card
            className={`overflow-hidden border shadow-lg transition-all duration-300 ${getCardStyle()}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="relative h-48 overflow-hidden">
                <Image
                    src={product.plugin.cover || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    className={`object-cover transition-transform duration-500 ${isHovered ? "scale-105" : "scale-100"}`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <div className="h-10 w-10 rounded-lg overflow-hidden border-2 border-white shadow-md">
                        <Image
                            src={product.plugin.avatar || "/placeholder.svg"}
                            alt={product.name}
                            width={40}
                            height={40}
                            className="object-cover"
                        />
                    </div>
                    <div className="bg-black/30 backdrop-blur-sm px-2 py-1 rounded-md">
                        <div className="text-xs text-white/80">Version</div>
                        <div className="text-sm font-medium text-white">{product.plugin.version}</div>
                    </div>
                </div>

                <div className="absolute top-3 right-3">
                    {getStatusBadge()}
                </div>

                <div className="absolute bottom-3 left-3">
                    <h3 className="text-xl font-bold text-white">{product.name}</h3>
                </div>

                {/* <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/30 backdrop-blur-sm px-2 py-1 rounded-md">
                    <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium text-white">{rating.toFixed(1)}</span>
                </div> */}
            </div>

            <CardContent className="p-5">
                <p className="text-muted-foreground mb-4 line-clamp-2 min-h-[40px]">{product.description}</p>

                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">License Duration</div>
                        <div className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="font-medium">{formatDuration(product.duration)}</span>
                        </div>
                    </div>

                    {isPurchased && purchaseExpiryDate && product.duration !== null && (
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-muted-foreground">Expires On</div>
                            <div className="font-medium">{formatExpiryDate(purchaseExpiryDate)}</div>
                        </div>
                    )}

                    {product.features && product.features.length > 0 && (
                        <div className="pt-2">
                            <div className="text-sm font-medium mb-2">Key Features</div>
                            <ul className="space-y-1.5">
                                {product.features.slice(0, 3).map((feature, index) => (
                                    <li key={index} className="flex items-start gap-2 text-sm">
                                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                        <span className="text-muted-foreground">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </CardContent>

            <CardFooter className="px-5 pb-5 pt-0 flex gap-3">
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="flex-1">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Details
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto p-6">
                        <DialogHeader>
                            <div className="flex items-center gap-3">
                                <Image
                                    src={product.plugin.avatar || "/placeholder.svg"}
                                    alt={product.name}
                                    width={48}
                                    height={48}
                                    className="rounded-lg"
                                />
                                <div>
                                    <DialogTitle className="text-xl">{product.name}</DialogTitle>
                                    <DialogDescription>Version {product.plugin.version}</DialogDescription>
                                </div>
                                <div className="ml-auto">
                                    {isPurchased && <Badge className="bg-green-500 text-white">Owned</Badge>}
                                    {isPending && <Badge className="bg-amber-500 text-white">Processing</Badge>}
                                </div>
                            </div>
                        </DialogHeader>

                        <div className="grid md:grid-cols-2 gap-6 mt-4">
                            <div>
                                <div className="relative h-48 rounded-lg overflow-hidden mb-4">
                                    <Image
                                        src={product.plugin.cover || "/placeholder.svg"}
                                        alt={product.name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>

                                <p className="text-muted-foreground mb-4">{product.plugin.description}</p>

                                {product.features && product.features.length > 0 && (
                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="text-sm font-medium mb-2">Features</h4>
                                            <ul className="grid grid-cols-1 gap-2">
                                                {product.features.map((feature, index) => (
                                                    <li key={index} className="flex items-start gap-2 text-sm">
                                                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                                        <span className="text-muted-foreground">{feature}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div>
                                <div className={`rounded-xl p-5 mb-6 ${
                                    isPurchased 
                                        ? "bg-green-50 dark:bg-green-950/30" 
                                        : isPending
                                        ? "bg-amber-50 dark:bg-amber-950/30"
                                        : "bg-muted/30 dark:bg-muted/20"
                                }`}>
                                    <div className="flex items-baseline mb-2">
                                        <span className="text-3xl font-bold">{formatPrice(product.price)}</span>
                                        {product.comparePrice && (
                                            <span className="text-muted-foreground line-through ml-2">
                                                {formatPrice(product.comparePrice)}
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-1.5 mb-4">
                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm text-muted-foreground">{formatDuration(product.duration)} License</span>
                                    </div>

                                    {isPurchased ? (
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div className="text-sm text-muted-foreground">License Key</div>
                                                <div className="flex items-center">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 hover:bg-muted"
                                                        onClick={toggleLicenseKeyVisibility}
                                                    >
                                                        {showLicenseKey ? (
                                                            <EyeOff className="h-4 w-4" />
                                                        ) : (
                                                            <Eye className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 hover:bg-muted"
                                                        onClick={copyLicenseKey}
                                                    >
                                                        <Copy className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                            <code className="flex rounded-md bg-muted/50 border px-3 py-1 text-sm font-mono tracking-wider !mt-1">
                                                {showLicenseKey ? (
                                                    <span className="text-primary">{licenseKey}</span>
                                                ) : (
                                                    <span className="text-muted-foreground">{maskLicenseKey(licenseKey)}</span>
                                                )}
                                            </code>
                                        </div>
                                    ) : isPending ? (
                                        <div className="w-full mb-3 flex justify-center items-center py-2 px-4 bg-amber-50 dark:bg-amber-950/30 rounded-md border border-amber-500 dark:border-amber-900">
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            <span className="text-amber-600 dark:text-amber-400 text-sm font-medium">Processing Order</span>
                                        </div>
                                    ) : (
                                        <Button className="w-full mb-3" onClick={() => onPurchase?.(product.id)}>
                                            <ShoppingCart className="h-4 w-4 mr-2" />
                                            Purchase Now
                                        </Button>
                                    )}

                                    {isPurchased && purchaseExpiryDate && product.duration !== null && (
                                        <div className="mt-4 text-sm text-center text-muted-foreground">
                                            Your license expires on {formatExpiryDate(purchaseExpiryDate)}
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <h4 className="text-sm font-medium mb-2">Technical Details</h4>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Version</span>
                                                <span className="font-medium">{product.plugin.version}</span>
                                            </div>
                                            {product.plugin.chatpionVersion && (
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Required Platform Version</span>
                                                    <span className="font-medium">{product.plugin.chatpionVersion}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">License Type</span>
                                                <span className="font-medium">{product.duration === null ? "Lifetime" : "Subscription"}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Support Included</span>
                                                <span className="font-medium">Yes</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Updates</span>
                                                <span className="font-medium">Free during license period</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
                {isPurchased ? (
                    <div className="flex-1 text-green-600 dark:text-green-400 text-sm font-medium flex items-center justify-center py-2 px-4 bg-green-50 dark:bg-green-950/30 rounded-md border border-green-500 dark:border-green-900">
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Owned
                    </div>
                ) : isPending ? (
                    <div className="flex-1 text-amber-600 dark:text-amber-400 text-sm font-medium flex items-center justify-center py-2 px-4 bg-amber-50 dark:bg-amber-950/30 rounded-md border border-amber-500 dark:border-amber-900">
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing
                    </div>
                ) : (
                    <Button size="sm" className="flex-1" onClick={() => onPurchase?.(product.id)}>
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Purchase
                    </Button>
                )}
            </CardFooter>
        </Card>
    )
}