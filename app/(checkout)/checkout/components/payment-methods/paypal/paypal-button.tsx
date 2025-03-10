"use client"

import React from "react"
import { CreditCard } from "lucide-react"
import { Label } from "@/components/ui/label"
import { RadioGroupItem } from "@/components/ui/radio-group"

interface PayPalButtonProps {
  id: string
  config: {
    name: string
    description: string
    icon: string
  }
}

export function PayPalButton({ id, config }: PayPalButtonProps) {
  return (
    <div className="relative">
      <RadioGroupItem
        value="paypal"
        id={id}
        className="peer sr-only"
      />
      <Label
        htmlFor={id}
        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
      >
        <div className="flex w-full flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-[#0070ba]/10 p-2">
              <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="20" height="20" viewBox="0,0,256,256">
                <g transform="translate(-39.68,-39.68) scale(1.31,1.31)"><g fill="none" fill-rule="nonzero" stroke="none" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none"><g transform="translate(4.79558,0.53333) scale(5.33333,5.33333)"><path d="M18.7,13.767l0.005,0.002c0.104,-0.443 0.482,-0.769 0.955,-0.769h13.472c0.017,0 0.034,-0.007 0.051,-0.006c-0.287,-4.779 -4.296,-6.994 -7.833,-6.994h-13.472c-0.474,0 -0.852,0.335 -0.955,0.777l-0.005,-0.002l-5.889,27.038l0.013,0.001c-0.014,0.064 -0.039,0.125 -0.039,0.194c0,0.553 0.447,0.991 1,0.991h8.071z" fill="#1565c0"></path><path d="M33.183,12.994c0.053,0.876 -0.005,1.829 -0.229,2.882c-1.281,5.995 -5.912,9.115 -11.635,9.115c0,0 -3.47,0 -4.313,0c-0.521,0 -0.767,0.306 -0.88,0.54l-1.74,8.049l-0.305,1.429h-0.006l-1.263,5.796l0.013,0.001c-0.014,0.064 -0.039,0.125 -0.039,0.194c0,0.553 0.447,1 1,1h7.333l0.013,-0.01c0.472,-0.007 0.847,-0.344 0.945,-0.788l0.018,-0.015l1.812,-8.416c0,0 0.126,-0.803 0.97,-0.803c0.844,0 4.178,0 4.178,0c5.723,0 10.401,-3.106 11.683,-9.102c1.442,-6.76 -3.38,-9.847 -7.555,-9.872z" fill="#039be5"></path><path d="M19.66,13c-0.474,0 -0.852,0.326 -0.955,0.769l-0.005,-0.002l-2.575,11.765c0.113,-0.234 0.359,-0.54 0.88,-0.54c0.844,0 4.235,0 4.235,0c5.723,0 10.432,-3.12 11.713,-9.115c0.225,-1.053 0.282,-2.006 0.229,-2.882c-0.016,-0.002 -0.034,0.005 -0.05,0.005z" fill="#283593"></path></g></g></g>
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
