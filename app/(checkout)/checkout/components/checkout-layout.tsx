"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, ChevronUp } from "lucide-react"
import Link from "next/link"
import type { ReactNode } from "react"
import { Drawer } from "vaul"
import Image from "next/image"

// 更新 CheckoutLayoutProps 接口，添加 totalPrice 属性
interface CheckoutLayoutProps {
    children: ReactNode
    orderSummary: ReactNode
    totalPrice?: string
}

// 在函数参数中添加 totalPrice，并设置默认值为 "$0.00"
export function CheckoutLayout({ children, orderSummary, totalPrice = "$0.00" }: CheckoutLayoutProps) {
    const [drawerOpen, setDrawerOpen] = useState(false)

    return (
        <div className="min-h-screen grid md:grid-cols-[1fr_620px]">
            {/* Main Content */}
            <main className="relative flex flex-col min-h-screen bg-white">
                <div className="sticky top-0 z-20 bg-white border-b">
                    <div className="px-4 py-3 flex items-center justify-between mx-auto">
                        <Link
                            href="/dashboard/plugins"
                            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4 mr-1" />
                            Back to marketplace
                        </Link>
                        <div className="flex items-center justify-center w-40 h-10">
                            <Image src="/logo.png" alt="Logo" width={429} height={60} className="dark:hidden" />
                            <Image src="/logo-white.png" alt="Logo" width={429} height={60} className="hidden dark:block" />
                        </div>
                    </div>
                </div>

                <div className="flex-1">
                    <div className="max-w-[580px] mx-auto px-4 sm:px-8 py-8 sm:py-16">{children}</div>
                </div>

                {/* Mobile Order Summary Drawer Trigger */}
                <div className="md:hidden sticky bottom-0 left-0 right-0 border-t bg-background shadow-sm">
                    <Drawer.Root open={drawerOpen} onOpenChange={setDrawerOpen}>
                        <Drawer.Trigger asChild>
                            <button className="w-full p-4 flex flex-col items-center">
                                <div className="flex justify-between w-full mx-auto">
                                    <span className="text-sm font-medium">Order Summary</span>
                                    <div className="flex items-center">
                                        <span className="font-medium mr-2">{totalPrice}</span>
                                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                </div>
                            </button>
                        </Drawer.Trigger>
                        <Drawer.Portal>
                            <Drawer.Overlay className="fixed inset-0 z-40 h-full bg-black/80 backdrop-blur-sm" />
                            <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 mt-24 overflow-hidden rounded-t-[10px] border bg-background px-3 text-sm">
                                <div className="sticky top-0 z-20 flex w-full items-center justify-center bg-inherit">
                                    <div className="my-3 h-1.5 w-16 rounded-full bg-muted-foreground/20" />
                                </div>
                                <div className="max-w-md mx-auto pb-6">{orderSummary}</div>
                            </Drawer.Content>
                        </Drawer.Portal>
                    </Drawer.Root>
                </div>

                <footer className="py-6 px-8 border-t">
                    <div className="max-w-[560px] mx-auto flex items-center justify-between text-sm text-muted-foreground">
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
                                    d="M59.64 14.28h-8.06v-1.83h8.06v1.83zm0-3.67h-8.06V8.79h8.06v1.82zm-8.06 5.5h8.06v1.83h-8.06v-1.83zM42.19 11.5c0-2.88 1.41-4.15 3.89-4.15 2.49 0 3.9 1.27 3.9 4.15s-1.41 4.15-3.9 4.15c-2.48 0-3.89-1.27-3.89-4.15zm6.14 0c0-2.11-.9-2.86-2.25-2.86s-2.24.75-2.24 2.86.9 2.87 2.24 2.87 2.25-.76 2.25-2.87zM35.81 7.35h1.55v8.08h-1.55V7.35zM33.23 9.37l-1.28 5.28c-.27 1.09-.46 1.66-.64 2.09-.4.97-1.06 1.45-2.28 1.45l-.27-1.07c.64-.12.94-.34 1.15-.78.15-.31.27-.7.51-1.72l-2.2-5.25h1.62l1.43 3.93 1.32-3.93h1.64zM22.03 14.31c0-2.11 1.56-3.27 5.36-3.68-.04-1.09-.4-1.99-1.87-1.99-1.03 0-1.87.37-2.84.95l-.69 1.19c1.11-.67 2.3-1.05 3.6-1.05 2.36 0 3.27 1.35 3.27 3.37v4.71h-1.44l-.13-.93c-.8.69-1.72 1.1-2.91 1.1-1.81 0-2.35 1.23-2.35 2.29zm5.36-.3v-2.19c-2.87.35-3.83 1.11-3.83 2.19 0 .61.33 1.17 1.35 1.17.91 0 1.71-.39 2.48-1.17zM17.36 11.5c0-2.88 1.41-4.15 3.89-4.15 2.49 0 3.9 1.27 3.9 4.15s-1.41 4.15-3.9 4.15c-2.48 0-3.89-1.27-3.89-4.15zm6.14 0c0-2.11-.9-2.86-2.25-2.86s-2.24.75-2.24 2.86.9 2.87 2.24 2.87 2.25-.76 2.25-2.87zM11.05 7.35h1.44l.13.93c.8-.69 1.72-1.1 2.91-1.1 1.81 0 2.35 1.23 2.35 2.29 0 2.11-1.56 3.27-5.36 3.68.04 1.09.4 1.99 1.87 1.99v-.71zm2.08-4.01c0-.61-.33-1.17-1.35-1.17-.91 0-1.71.39-2.48 1.17v2.19c2.87-.35 3.83-1.11 3.83-2.19z"
                                    fillRule="evenodd"
                                ></path>
                            </svg>
                        </div>
                    </div>
                </footer>
            </main>

            {/* Desktop Order Summary Sidebar - Hidden on Mobile */}
            <aside className="hidden md:block relative border-l bg-muted/10">
                <div className="sticky top-0 h-screen overflow-auto">
                    <div className="max-w-[500px] mx-auto px-8 py-16">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                            {orderSummary}
                        </motion.div>
                    </div>
                </div>
            </aside>
        </div>
    )
}
