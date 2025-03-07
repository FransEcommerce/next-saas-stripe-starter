import { Suspense } from "react"
import { CheckoutForm } from "./components/checkout-form"
import { Skeleton } from "@/components/ui/skeleton"
import { getProductById } from "./queries"
import { redirect } from "next/navigation"

// 更新的骨架加载组件
function CheckoutSkeleton() {
    return (
        <div className="min-h-screen grid grid-cols-1 md:grid-cols-[1fr_620px]">
            {/* 主内容区域 */}
            <main className="relative flex flex-col min-h-screen bg-background">
                {/* 顶部导航栏骨架 */}
                <div className="sticky top-0 z-20 bg-background border-b">
                    <div className="px-4 py-3 flex items-center justify-between mx-auto">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-10 w-40" />
                    </div>
                </div>

                {/* 主要内容骨架 */}
                <div className="flex-1">
                    <div className="max-w-[580px] mx-auto px-4 sm:px-8 py-8 sm:py-16 space-y-8">
                        {/* 结账步骤骨架 */}
                        <div className="flex items-center justify-center gap-4 mb-12 px-8">
                            {[1, 2].map((i) => (
                                <div key={i} className="flex items-center">
                                    <div className="flex flex-col items-center">
                                        <Skeleton className="w-12 h-12 rounded-full" />
                                        <Skeleton className="w-16 h-4 mt-2" />
                                    </div>
                                    {i < 2 && <Skeleton className="h-px w-24 mx-2 mt-[-20px]" />}
                                </div>
                            ))}
                        </div>

                        {/* 表单字段骨架 */}
                        <div className="space-y-4">
                            <Skeleton className="h-5 w-20" /> {/* 标签 */}
                            <Skeleton className="h-10 w-full" /> {/* 输入框 */}
                            
                            <Skeleton className="h-5 w-20" />
                            <Skeleton className="h-10 w-full" />
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Skeleton className="h-5 w-20" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                                <div className="space-y-2">
                                    <Skeleton className="h-5 w-20" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                            </div>
                            
                            <Skeleton className="h-5 w-20" />
                            <Skeleton className="h-10 w-full" />
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Skeleton className="h-5 w-20" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                                <div className="space-y-2">
                                    <Skeleton className="h-5 w-20" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Skeleton className="h-5 w-20" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                                <div className="space-y-2">
                                    <Skeleton className="h-5 w-20" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                            </div>
                        </div>

                        {/* 按钮骨架 */}
                        <Skeleton className="h-10 w-full mt-6" />
                    </div>
                </div>

                {/* 底部骨架 */}
                <footer className="py-6 px-8 border-t">
                    <div className="max-w-[560px] mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Skeleton className="h-4 w-12" />
                            <Skeleton className="h-4 w-12" />
                        </div>
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-4 w-16" />
                        </div>
                    </div>
                </footer>
            </main>

            {/* 订单摘要侧边栏骨架 - 桌面版 */}
            <aside className="hidden md:block relative border-l bg-muted/10 dark:bg-muted/5">
                <div className="sticky top-0 h-screen overflow-auto">
                    <div className="max-w-[500px] mx-auto px-8 py-16 space-y-6">
                        {/* 订单摘要标题 */}
                        <Skeleton className="h-6 w-32" />
                        
                        {/* 产品信息 */}
                        <div className="flex items-start gap-3 p-3 bg-card rounded-lg border">
                            <Skeleton className="w-16 h-16 rounded-lg" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-5 w-2/3" />
                                <Skeleton className="h-4 w-1/2" />
                                <Skeleton className="h-4 w-1/3" />
                            </div>
                        </div>
                        
                        {/* 优惠码输入框 */}
                        <div className="relative">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-7 w-16 absolute right-1 top-1" />
                        </div>
                        
                        {/* 价格摘要 */}
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <Skeleton className="h-4 w-16" />
                                <Skeleton className="h-4 w-16" />
                            </div>
                            <Skeleton className="h-px w-full" /> {/* 分隔线 */}
                            <div className="flex justify-between">
                                <Skeleton className="h-5 w-12" />
                                <Skeleton className="h-5 w-20" />
                            </div>
                        </div>
                        
                        {/* 条款文本 */}
                        <Skeleton className="h-4 w-full" />
                    </div>
                </div>
            </aside>
        </div>
    )
}

// 这是一个服务器组件
export default async function CheckoutPage({ searchParams }: { searchParams: { product: string } }) {
    const productId = searchParams.product
    if (!productId) {
        redirect("/dashboard/plugins")
    }

    const product = await getProductById(productId)

    return (
        <Suspense fallback={<CheckoutSkeleton />}>
            <CheckoutForm product={product} />
        </Suspense>
    )
}

