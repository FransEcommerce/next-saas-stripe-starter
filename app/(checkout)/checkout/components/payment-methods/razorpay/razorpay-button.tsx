"use client"

import React from "react"
import { CreditCard } from "lucide-react"
import { Label } from "@/components/ui/label"
import { RadioGroupItem } from "@/components/ui/radio-group"

interface RazorpayButtonProps {
  id: string
  config: {
    name: string
    description: string
    icon: string
  }
}

export function RazorpayButton({ id, config }: RazorpayButtonProps) {
  return (
    <div className="relative">
      <RadioGroupItem
        value="razorpay"
        id={id}
        className="peer sr-only"
      />
      <Label
        htmlFor={id}
        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
      >
        <div className="flex w-full flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-md bg-secondary p-2">
              <CreditCard className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">
                {config.name}
              </p>
              <p className="text-sm text-muted-foreground">
                {config.description}
              </p>
            </div>
          </div>
        </div>
      </Label>
    </div>
  )
}