"use client"

import { Upload } from "lucide-react"
import { Label } from "@/components/ui/label"
import { RadioGroupItem } from "@/components/ui/radio-group"

interface ManualTransferButtonProps {
  id: string
}

export function ManualTransferButton({ id }: ManualTransferButtonProps) {
  return (
    <div>
      <RadioGroupItem
        value="manual-transfer"
        id={id}
        className="peer sr-only"
      />
      <Label
        htmlFor={id}
        className="flex flex-col items-start justify-between rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
      >
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/5 p-2">
              <Upload className="h-4 w-4 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">
                Manual Bank Transfer
              </p>
              <p className="text-sm text-muted-foreground">
                Upload payment proof after transfer
              </p>
            </div>
          </div>
        </div>
      </Label>
    </div>
  )
} 