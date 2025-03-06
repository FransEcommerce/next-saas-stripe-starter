import { Suspense } from "react"
import { CheckoutForm } from "./components/checkout-form"
import { Skeleton } from "@/components/ui/skeleton"
import { getProductById } from "./queries"

// Loading skeleton
function CheckoutSkeleton() {
    return (
        <div className="min-h-screen grid grid-cols-1 md:grid-cols-[1fr_400px]">
            <div className="bg-white p-4 md:p-8">
                <div className="max-w-[660px] mx-auto space-y-4 md:space-y-8">
                    <div className="flex justify-center gap-8">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="text-center space-y-2">
                                <Skeleton className="w-8 h-8 rounded-full mx-auto" />
                                <Skeleton className="w-16 h-4" />
                            </div>
                        ))}
                    </div>

                    <div className="space-y-2 md:space-y-4">
                        <Skeleton className="h-8 w-1/3" />
                        <div className="space-y-2 md:space-y-4">
                            <Skeleton className="h-10 w-full" />
                            <div className="grid grid-cols-2 gap-4">
                                <Skeleton className="h-10" />
                                <Skeleton className="h-10" />
                            </div>
                            <Skeleton className="h-10" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="border-t md:border-t-0 md:border-l">
                <div className="p-4 md:p-8 space-y-4 md:space-y-8">
                    <Skeleton className="h-8 w-1/3" />
                    <div className="space-y-4">
                        <div className="flex gap-4">
                            <Skeleton className="w-16 h-16 rounded-lg" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-5 w-2/3" />
                                <Skeleton className="h-4 w-1/2" />
                            </div>
                        </div>
                        <Skeleton className="h-10" />
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-4 w-16" />
                            </div>
                            <div className="flex justify-between">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-4 w-20" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

// This is a server component
export default async function CheckoutPage({ searchParams }: { searchParams: { product: string } }) {
    const productId = searchParams.product
    const product = await getProductById(productId)

    return (
        <Suspense fallback={<CheckoutSkeleton />}>
            <CheckoutForm product={product} />
        </Suspense>
    )
}
