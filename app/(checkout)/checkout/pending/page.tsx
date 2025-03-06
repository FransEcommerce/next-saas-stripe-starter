import Link from "next/link"
import Image from "next/image"
import { Clock, ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"

// This is a server component
export default function CheckoutPendingPage({ searchParams }: { searchParams: { product: string } }) {
    const productId = searchParams.product

    // In a real app, you would fetch the product details based on the productId
    // For this example, we'll use mock data
    const product = {
        id: "prod_2",
        name: "SEO Optimizer Pro",
        plugin: {
            id: "plugin_2",
            version: "1.7.0",
            avatar: "/placeholder.svg?height=80&width=80",
        },
    }

    return (
        <div className="min-h-screen grid md:grid-cols-2">
            {/* Main Content */}
            <main className="flex flex-col min-h-screen bg-white">
                <div className="flex-1 flex items-center justify-center">
                    <div className="max-w-md w-full px-6">
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                                <Clock className="h-8 w-8 text-blue-600" />
                            </div>
                            <h1 className="text-2xl font-bold mb-2">Payment Being Processed</h1>
                            <p className="text-muted-foreground">
                                Thank you for your order. We've received your payment proof and our team is currently reviewing it.
                            </p>
                        </div>

                        <div className="flex items-center gap-3 mb-6 bg-muted/30 p-4 rounded-lg">
                            <Image
                                src={product.plugin.avatar || "/placeholder.svg"}
                                alt={product.name}
                                width={48}
                                height={48}
                                className="rounded-lg"
                            />
                            <div className="text-left">
                                <h3 className="font-medium">{product.name}</h3>
                                <p className="text-sm text-muted-foreground">Version {product.plugin.version}</p>
                            </div>
                        </div>

                        <div className="bg-blue-50 p-4 rounded-lg mb-6">
                            <h4 className="font-medium mb-2">Order Status</h4>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Status:</span>
                                    <span className="font-medium text-blue-700">Pending Payment Verification</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Order ID:</span>
                                    <span className="font-medium">
                                        ORD-
                                        {Math.floor(Math.random() * 10000)
                                            .toString()
                                            .padStart(4, "0")}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Estimated Processing Time:</span>
                                    <span className="font-medium">1-2 business days</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Button variant="outline" className="w-full">
                                <Link href="/plugins" className="flex items-center">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Return to Marketplace
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>

                <footer className="py-6 px-4 border-t">
                    <div className="max-w-[660px] mx-auto flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-4">
                            <Link href="/terms" className="hover:text-foreground transition-colors">
                                Terms
                            </Link>
                            <Link href="/privacy" className="hover:text-foreground transition-colors">
                                Privacy
                            </Link>
                        </div>
                        <div className="flex items-center gap-2">
                            <span>Powered by</span>
                            <svg viewBox="0 0 60 25" className="h-4 w-auto">
                                <path
                                    fill="currentColor"
                                    d="M59.64 14.28h-8.06v-1.83h8.06v1.83zm0-3.67h-8.06V8.79h8.06v1.82zm-8.06 5.5h8.06v1.83h-8.06v-1.83zM42.19 11.5c0-2.88 1.41-4.15 3.89-4.15 2.49 0 3.9 1.27 3.9 4.15s-1.41 4.15-3.9 4.15c-2.48 0-3.89-1.27-3.89-4.15zm6.14 0c0-2.11-.9-2.86-2.25-2.86s-2.24.75-2.24 2.86.9 2.87 2.24 2.87 2.25-.76 2.25-2.87zM35.81 7.35h1.55v8.08h-1.55V7.35zM33.23 9.37l-1.28 5.28c-.27 1.09-.46 1.66-.64 2.09-.4.97-1.06 1.45-2.28 1.45l-.27-1.07c.64-.12.94-.34 1.15-.78.15-.31.27-.7.51-1.72l-2.2-5.25h1.62l1.43 3.93 1.32-3.93h1.64zM22.03 14.31c0-2.11 1.56-3.27 5.36-3.68-.04-1.09-.4-1.99-1.87-1.99-1.03 0-1.87.37-2.84.95l-.69-1.19c1.11-.67 2.3-1.05 3.6-1.05 2.36 0 3.27 1.35 3.27 3.37v4.71h-1.44l-.13-.93c-.8.69-1.72 1.1-2.91 1.1-1.81 0-2.35-1.23-2.35-2.29zm5.36-.3v-2.19c-2.87.35-3.83 1.11-3.83 2.19 0 .61.33 1.17 1.35 1.17.91 0 1.71-.39 2.48-1.17zM17.36 11.5c0-2.88 1.41-4.15 3.89-4.15 2.49 0 3.9 1.27 3.9 4.15s-1.41 4.15-3.9 4.15c-2.48 0-3.89-1.27-3.89-4.15zm6.14 0c0-2.11-.9-2.86-2.25-2.86s-2.24.75-2.24 2.86.9 2.87 2.24 2.87 2.25-.76 2.25-2.87zM11.05 7.35h1.44l.13.93c.8-.69 1.72-1.1 2.91-1.1 1.81 0 2.35 1.23 2.35 2.29 0 2.11-1.56 3.27-5.36 3.68.04 1.09.4 1.99 1.87 1.99 1.03 0 1.87-.37 2.84-.95l.69 1.19c-1.11.67-2.3 1.05-3.6 1.05-2.36 0-3.27-1.35-3.27-3.37V7.35zm4.76 4.26c2.87-.35 3.83-1.11 3.83-2.19 0-.61-.33-1.17-1.35-1.17-.91 0-1.71.39-2.48 1.17v2.19zM6.03 13.43c1.03 0 1.87-.37 2.84-.95l.69 1.19c-1.11.67-2.3 1.05-3.6 1.05-2.36 0-3.27-1.35-3.27-3.37V7.35h1.44l.13.93c.8-.69 1.72-1.1 2.91-1.1 1.81 0 2.35 1.23 2.35 2.29 0 2.11-1.56 3.27-5.36 3.68.04 1.09.4 1.99 1.87 1.99v-.71zm2.08-4.01c0-.61-.33-1.17-1.35-1.17-.91 0-1.71.39-2.48 1.17v2.19c2.87-.35 3.83-1.11 3.83-2.19z"
                                    fillRule="evenodd"
                                ></path>
                            </svg>
                        </div>
                    </div>
                </footer>
            </main>

            {/* Order Summary Sidebar */}
            <aside className="hidden md:block relative border-l bg-muted/10">
                <div className="sticky top-0 h-screen flex items-center justify-center p-8">
                    <div className="max-w-sm w-full">
                        <div className="bg-blue-50 p-8 rounded-xl">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-6 shadow-sm">
                                <Clock className="h-10 w-10 text-blue-600" />
                            </div>
                            <h2 className="text-xl font-bold mb-2">Payment Verification</h2>
                            <p className="text-blue-700 mb-6">
                                Your order is being processed. We'll notify you once your payment is verified.
                            </p>

                            <div className="space-y-4">
                                <div className="bg-white p-4 rounded-lg">
                                    <h4 className="font-medium mb-2">What happens next?</h4>
                                    <ol className="text-sm space-y-2 list-decimal list-inside text-muted-foreground">
                                        <li>Our team reviews your payment proof</li>
                                        <li>Your payment is verified (1-2 business days)</li>
                                        <li>Your license key is generated</li>
                                        <li>You receive an email with download instructions</li>
                                    </ol>
                                </div>

                                <div className="bg-white p-4 rounded-lg">
                                    <h4 className="font-medium mb-2">Need help?</h4>
                                    <p className="text-sm text-muted-foreground mb-3">
                                        If you have any questions about your order, please contact our support team.
                                    </p>
                                    <Button variant="outline" size="sm" className="w-full">
                                        Contact Support
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>
        </div>
    )
}

