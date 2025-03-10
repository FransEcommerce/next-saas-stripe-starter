"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, ChevronUp } from "lucide-react"
import Link from "next/link"
import type { ReactNode } from "react"
import { Drawer } from "vaul"
import Image from "next/image"
import { CheckoutSteps } from "./checkout-steps"

// 更新 CheckoutLayoutProps 接口，添加 totalPrice 属性
interface CheckoutLayoutProps {
    children: ReactNode
    orderSummary: ReactNode
    totalPrice?: string
    currentStep: number
}

// 在函数参数中添加 totalPrice，并设置默认值为 "$0.00"
export function CheckoutLayout({ children, orderSummary, totalPrice = "$0.00", currentStep }: CheckoutLayoutProps) {
    const [drawerOpen, setDrawerOpen] = useState(false)

    return (
        <div className="min-h-screen grid md:grid-cols-[1fr_620px]">
            {/* Main Content */}
            <main className="relative flex flex-col min-h-screen bg-background">
                <div className="sticky top-0 z-20 bg-background">
                    <div className="border-b">
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
                    <CheckoutSteps currentStep={currentStep} />
                </div>

                <div className="flex-1 flex flex-col">
                    <div className="flex-1 max-w-[580px] mx-auto px-4 sm:px-8 pb-8">
                        {children}
                    </div>

                    {/* Mobile Order Summary Drawer Trigger */}
                    <div className="md:hidden sticky bottom-0 left-0 right-0 border-t bg-background shadow-sm z-[999]">
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
                                <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 mt-24 overflow-hidden rounded-t-[10px] border bg-background px-3 text-sm z-[9999]">
                                    <div className="sticky top-0 z-20 flex w-full items-center justify-center bg-inherit">
                                        <div className="my-3 h-1.5 w-16 rounded-full bg-muted-foreground/20" />
                                    </div>
                                    <div className="max-w-md mx-auto pb-6">{orderSummary}</div>
                                </Drawer.Content>
                            </Drawer.Portal>
                        </Drawer.Root>
                    </div>

                    {/* Footer - Sticky only on desktop */}
                    <footer className="py-6 px-8 border-t bg-background md:sticky md:bottom-0 md:left-0 md:right-0 md:mt-auto">
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
                                <svg width="70" height="19" viewBox="0 0 350 48.24586892819119" className="looka-1j8o68f dark:fill-white">
                                    <defs id="SvgjsDefs2363"></defs>
                                    <g id="SvgjsG2364"
                                        transform="matrix(3.2163904439090243,0,0,3.2163904439090243,-5.198857347220367,-16.081941483683767)"
                                        fill="currentColor">
                                        <path
                                            d="M13.88 5 q0.28 0 0.49 0.21 t0.21 0.49 l0 13.4 q0 0.28 -0.21 0.49 t-0.49 0.21 l-1.76 0 q-0.36 0 -0.58 -0.28 l-9.78 -13.4 q-0.12 -0.16 -0.14 -0.36 t0.07 -0.38 t0.26 -0.28 t0.37 -0.1 l1.76 0 q0.16 0 0.32 0.07 t0.24 0.21 l7.02 9.54 l0 -9.12 q0 -0.28 0.2 -0.49 t0.5 -0.21 l1.52 0 z M3.84 14.7 q0.28 0 0.49 0.2 t0.21 0.5 l0 3.7 q0 0.28 -0.21 0.49 t-0.49 0.21 l-1.52 0 q-0.28 0 -0.49 -0.21 t-0.21 -0.49 l0 -3.7 q0 -0.3 0.21 -0.5 t0.49 -0.2 l1.52 0 z M28.722 5 q0.3 0 0.5 0.21 t0.2 0.49 l0 1.44 q0 0.28 -0.2 0.49 t-0.5 0.21 l-7.56 0 l0 3.06 l6.68 0 q0.3 0 0.5 0.21 t0.2 0.49 l0 1.46 q0 0.28 -0.2 0.49 t-0.5 0.21 l-6.68 0 l0 3.08 l7.56 0 q0.3 0 0.5 0.21 t0.2 0.49 l0 1.44 q0 0.28 -0.2 0.49 t-0.5 0.21 l-9.76 0 q-0.28 0 -0.49 -0.21 t-0.21 -0.49 l0 -13.28 q0 -0.28 0.21 -0.49 t0.49 -0.21 l9.76 0 z M39.304 12.120000000000001 l4.92 6.38 q0.2 0.2 0.2 0.48 t-0.21 0.49 t-0.49 0.21 l-1.9 0 q-0.16 0 -0.32 -0.07 t-0.24 -0.21 l-3.76 -4.96 l-3.74 4.96 q-0.22 0.28 -0.56 0.28 l-1.9 0 q-0.2 0 -0.37 -0.11 t-0.26 -0.28 t-0.07 -0.38 t0.14 -0.35 l4.98 -6.44 l-4.62 -6 q-0.12 -0.14 -0.14 -0.35 t0.07 -0.38 t0.26 -0.28 t0.37 -0.11 l1.9 0 q0.34 0 0.56 0.28 l3.38 4.48 l3.4 -4.48 q0.08 -0.14 0.24 -0.21 t0.32 -0.07 l1.9 0 q0.2 0 0.36 0.11 t0.26 0.28 t0.08 0.38 t-0.16 0.35 z M56.566 5 q0.28 0 0.48 0.21 t0.2 0.49 l0 1.44 q0 0.28 -0.2 0.49 t-0.48 0.21 l-3.94 0 l0 11.14 q0 0.28 -0.21 0.49 t-0.49 0.21 l-1.5 0 q-0.3 0 -0.5 -0.21 t-0.2 -0.49 l0 -11.14 l-3.94 0 q-0.28 0 -0.49 -0.21 t-0.21 -0.49 l0 -1.44 q0 -0.28 0.21 -0.49 t0.49 -0.21 l10.78 0 z M66.328 5 q2.38 0 3.84 1.37 t1.46 3.65 t-1.44 3.64 t-3.86 1.36 l-3.82 0 l0 4.08 q0 0.28 -0.21 0.49 t-0.49 0.21 l-1.52 0 q-0.28 0 -0.49 -0.21 t-0.21 -0.49 l0 -6.2 q0 -0.28 0.21 -0.49 t0.49 -0.21 l5.92 0 q1.34 0 1.92 -0.58 q0.58 -0.52 0.58 -1.58 t-0.6 -1.63 t-1.9 -0.57 l-5.92 0 q-0.28 0 -0.49 -0.21 t-0.21 -0.49 l0 -1.44 q0 -0.28 0.21 -0.49 t0.49 -0.21 l6.04 0 z M76.31 5 q0.28 0 0.49 0.21 t0.21 0.49 l0 13.28 q0 0.28 -0.21 0.49 t-0.49 0.21 l-1.5 0 q-0.28 0 -0.49 -0.21 t-0.21 -0.49 l0 -13.28 q0 -0.28 0.21 -0.49 t0.49 -0.21 l1.5 0 z M87.292 5 q3.28 0 5.38 2.2 q2.06 2.16 2.06 5.3 t-2.06 5.3 q-2.1 2.2 -5.38 2.2 t-5.38 -2.2 q-2.06 -2.16 -2.06 -5.3 t2.06 -5.3 q2.1 -2.2 5.38 -2.2 z M87.292 17.14 q2.06 0 3.32 -1.32 q1.22 -1.28 1.22 -3.31 t-1.24 -3.34 t-3.3 -1.31 t-3.3 1.31 t-1.24 3.34 t1.22 3.31 q1.26 1.32 3.32 1.32 z M109.73400000000001 5 q0.28 0 0.49 0.21 t0.21 0.49 l0 13.28 q0 0.28 -0.21 0.49 t-0.49 0.21 l-1.76 0 q-0.34 0 -0.56 -0.28 l-6.94 -9.5 l0 9.08 q0 0.28 -0.21 0.49 t-0.49 0.21 l-1.5 0 q-0.28 0 -0.49 -0.21 t-0.21 -0.49 l0 -13.28 q0 -0.28 0.21 -0.49 t0.49 -0.21 l1.74 0 q0.16 0 0.32 0.07 t0.24 0.21 l6.96 9.46 l0 -9.04 q0 -0.28 0.2 -0.49 t0.48 -0.21 l1.52 0 z">
                                        </path>
                                    </g>
                                </svg>
                            </div>
                        </div>
                    </footer>
                </div>
            </main>

            {/* Desktop Order Summary Sidebar - Hidden on Mobile */}
            <aside className="hidden md:block relative border-l bg-muted/10 dark:bg-muted/5">
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
