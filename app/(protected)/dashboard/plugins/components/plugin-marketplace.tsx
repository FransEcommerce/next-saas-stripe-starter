"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Grid3X3, List, Package, Search, ShoppingBag, CheckCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import type { Product, Purchase } from "./types"
import { PluginCard } from "./plugin-card"

interface PluginMarketplaceProps {
    initialProducts?: Product[]
    initialUserPurchases?: Purchase[]
}

export function PluginMarketplace({ initialProducts = [], initialUserPurchases = [] }: PluginMarketplaceProps) {
    const router = useRouter()
    const [products] = useState(initialProducts)
    const [userPurchases] = useState(initialUserPurchases)
    const [searchQuery, setSearchQuery] = useState("")
    const [viewMode, setViewMode] = useState("grid")
    const [sortBy, setSortBy] = useState("featured")

    // Filter products based on search query
    const filteredProducts = products.filter(
        (product) =>
            product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.plugin.name.toLowerCase().includes(searchQuery.toLowerCase()),
    )

    // Sort products
    const sortedProducts = [...filteredProducts].sort((a, b) => {
        switch (sortBy) {
            case "price-low":
                return a.price - b.price
            case "price-high":
                return b.price - a.price
            case "newest":
                return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
            default:
                return 0 // featured - no specific sort
        }
    })

    // Check if a product is purchased
    const isProductPurchased = (productId: string) => {
        return userPurchases.some((purchase) => purchase.product.id === productId)
    }

    // Get expiry date for a purchased product
    const getPurchaseExpiryDate = (productId: string) => {
        const purchase = userPurchases.find((p) => p.product.id === productId)
        return purchase?.expiryDate || null
    }

    // Get license key for a purchased product
    const getLicenseKey = (productId: string) => {
        const purchase = userPurchases.find((p) => p.product.id === productId)
        return purchase?.licenseKey || null
    }

    // Handle purchase
    const handlePurchase = (productId: string) => {
        // In a real app, this would navigate to checkout
        router.push(`/checkout?product=${productId}`)
    }

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 },
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Plugin Marketplace</h1>
                <p className="text-muted-foreground">Discover and purchase plugins to enhance your experience</p>
            </div>

            <Tabs defaultValue="all" className="w-full">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <TabsList>
                        <TabsTrigger value="all">All Plugins</TabsTrigger>
                        <TabsTrigger value="purchased" className="flex items-center gap-1.5">
                            <CheckCircle className="h-3.5 w-3.5" />
                            My Plugins
                            <span className="ml-1 bg-primary/20 text-primary px-1.5 py-0.5 rounded-full text-xs">
                                {userPurchases.length}
                            </span>
                        </TabsTrigger>
                    </TabsList>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        {/* <div className="relative flex-1 sm:w-[300px]">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search plugins..."
                                className="pl-8 w-full"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div> */}

                        <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger className="w-[140px]">
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="featured">Featured</SelectItem>
                                <SelectItem value="price-low">Price: Low to High</SelectItem>
                                <SelectItem value="price-high">Price: High to Low</SelectItem>
                                <SelectItem value="newest">Newest</SelectItem>
                            </SelectContent>
                        </Select>

                        <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && setViewMode(value)}>
                            <ToggleGroupItem value="grid" aria-label="Grid view">
                                <Grid3X3 className="h-4 w-4" />
                            </ToggleGroupItem>
                            <ToggleGroupItem value="list" aria-label="List view">
                                <List className="h-4 w-4" />
                            </ToggleGroupItem>
                        </ToggleGroup>
                    </div>
                </div>

                <TabsContent value="all">
                    {sortedProducts.length > 0 ? (
                        <motion.div
                            className={`grid gap-6 ${viewMode === "grid" ? "md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}
                            variants={containerVariants}
                            initial="hidden"
                            animate="show"
                        >
                            {sortedProducts.map((product) => (
                                <motion.div key={product.id} variants={itemVariants}>
                                    <PluginCard
                                        product={product}
                                        isPurchased={isProductPurchased(product.id)}
                                        purchaseExpiryDate={getPurchaseExpiryDate(product.id)}
                                        licenseKey={getLicenseKey(product.id)}
                                        onPurchase={handlePurchase}
                                    />
                                </motion.div>
                            ))}
                        </motion.div>
                    ) : (
                        <div className="bg-muted/30 dark:bg-muted/10 rounded-xl p-10 text-center">
                            <div className="flex justify-center mb-4">
                                <div className="p-3 rounded-full bg-muted dark:bg-muted/20">
                                    <Package className="h-6 w-6 text-muted-foreground" />
                                </div>
                            </div>
                            <h3 className="text-lg font-medium mb-2">No plugins found</h3>
                            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                                We couldn't find any plugins matching your search criteria. Try adjusting your search or check back
                                later.
                            </p>
                            <Button onClick={() => setSearchQuery("")}>Clear Search</Button>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="purchased">
                    {userPurchases.length > 0 ? (
                        <motion.div
                            className={`grid gap-6 ${viewMode === "grid" ? "md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}
                            variants={containerVariants}
                            initial="hidden"
                            animate="show"
                        >
                            {userPurchases.map((purchase) => (
                                <motion.div key={purchase.id} variants={itemVariants}>
                                    <PluginCard product={purchase.product} isPurchased={true} purchaseExpiryDate={purchase.expiryDate} licenseKey={purchase.licenseKey} />
                                </motion.div>
                            ))}
                        </motion.div>
                    ) : (
                        <div className="bg-muted/30 dark:bg-muted/10 rounded-xl p-10 text-center">
                            <div className="flex justify-center mb-4">
                                <div className="p-3 rounded-full bg-muted dark:bg-muted/20">
                                    <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                                </div>
                            </div>
                            <h3 className="text-lg font-medium mb-2">No purchased plugins</h3>
                            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                                You haven't purchased any plugins yet. Browse our marketplace to find plugins that enhance your
                                experience.
                            </p>
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    )
}