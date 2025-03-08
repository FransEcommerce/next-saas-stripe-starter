"use client"

import { Label } from "@/components/ui/label"
import { RadioGroupItem } from "@/components/ui/radio-group"

interface ManualPaypalButtonProps {
  id: string
  value?: string
  config: {
    name: string
    description: string
    icon: string
  }
}

export function ManualPaypalButton({ id, value = "manual-paypal", config }: ManualPaypalButtonProps) {
  return (
    <div>
      <RadioGroupItem
        value={value}
        id={id}
        className="peer sr-only"
      />
      <Label
        htmlFor={id}
        className="flex flex-col items-start justify-between rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
      >
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-[#0070ba]/10 p-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0070ba" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-paypal">
                <path d="M7 11.5l1.5-9H16c1.2 0 2.2.6 2.6 1.5.4 1 .3 2.2-.6 3.3-.9 1-2.2 1.5-3.4 1.5H12l-1.2 7.5H4.3l.6-4H7z"/>
                <path d="M15.8 6.7c.1-.5 0-.9-.3-1.3-.3-.4-.7-.4-1.2-.4h-3.2l-.6 4H13c.5 0 1-.2 1.4-.5.4-.3.6-.8.8-1.4z"/>
                <path d="M18.5 5.5c-.4-.9-1.4-1.5-2.6-1.5h-7.5l-1.5 9H4.3l-.6 4h6.5l1.2-7.5h2.6c1.2 0 2.5-.5 3.4-1.5.9-1.1 1-2.3.6-3.3z"/>
              </svg>
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
