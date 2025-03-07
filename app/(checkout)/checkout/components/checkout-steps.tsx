"use client"

import { motion } from "framer-motion"
import { CreditCard, User } from "lucide-react"

interface CheckoutStepsProps {
    currentStep: number
}

export function CheckoutSteps({ currentStep }: CheckoutStepsProps) {
    const steps = [
        { title: "Information", icon: User },
        { title: "Payment", icon: CreditCard },
    ]

    return (
        <div className="bg-background">
            <div className="pt-4 pb-2">
                <div className="flex items-center justify-center gap-4 px-8">
                    {steps.map((step, index) => {
                        const Icon = step.icon
                        const isActive = currentStep === index + 1
                        const isCompleted = currentStep > index + 1

                        return (
                            <div key={step.title} className="flex items-center">
                                <div className="flex flex-col items-center">
                                    <motion.div
                                        initial={false}
                                        animate={{
                                            scale: isActive ? 1.1 : 1,
                                        }}
                                        className={`relative w-12 h-12 rounded-full flex items-center justify-center
                                            ${isCompleted ? "bg-primary" : isActive ? "bg-background" : "bg-transparent"}
                                            before:absolute before:inset-0 before:rounded-full before:p-[2px]
                                            before:bg-gradient-to-r before:from-blue-500 before:via-violet-500 before:to-pink-500
                                            before:content-[''] before:opacity-${isActive || isCompleted ? "100" : "30"}
                                            after:absolute after:inset-[2px] after:rounded-full after:bg-background
                                            after:content-['']
                                            dark:after:bg-background
                                        `}
                                        style={{
                                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                        }}
                                    >
                                        {isCompleted ? (
                                            <motion.svg
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className="w-5 h-5 text-foreground relative z-10"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <motion.path
                                                    initial={{ pathLength: 0 }}
                                                    animate={{ pathLength: 1 }}
                                                    transition={{ duration: 0.3, delay: 0.1 }}
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={3}
                                                    d="M5 13l4 4L19 7"
                                                />
                                            </motion.svg>
                                        ) : (
                                            <Icon
                                                className={`h-5 w-5 relative z-10 ${
                                                    isActive ? "text-primary" : "text-muted-foreground"
                                                } transition-colors`}
                                            />
                                        )}
                                    </motion.div>
                                    <span
                                        className={`text-sm font-medium mt-2 ${
                                            isActive ? "text-primary" : "text-muted-foreground"
                                        } transition-colors`}
                                    >
                                        {step.title}
                                    </span>
                                </div>
                                {index < steps.length - 1 && (
                                    <motion.div
                                        initial={false}
                                        animate={{
                                            background: isCompleted 
                                                ? "linear-gradient(to right, #3b82f6, #8b5cf6, #ec4899)" 
                                                : "var(--border)",
                                        }}
                                        className="h-px w-24 mx-2 mt-[-20px]"
                                    />
                                )}
                            </div>
                        )
                    })}
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-b from-background to-transparent" />
            </div>
        </div>
    )
}

