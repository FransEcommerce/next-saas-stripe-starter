"use client"

import { useState } from "react"
import { Copy, Check, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface LicenseKeyProps {
    licenseKey: string
    className?: string
}

export function LicenseKey({ licenseKey, className }: LicenseKeyProps) {
    const [copied, setCopied] = useState(false)
    const [visible, setVisible] = useState(false)

    const copyToClipboard = () => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(licenseKey).then(() => {
                setCopied(true)
                toast.success("License key copied to clipboard")
                setTimeout(() => setCopied(false), 2000)
            }).catch(() => {
                // Fallback if clipboard API fails
                const textArea = document.createElement("textarea")
                textArea.value = licenseKey
                document.body.appendChild(textArea)
                textArea.select()
                try {
                    document.execCommand("copy")
                    setCopied(true)
                    toast.success("License key copied to clipboard")
                    setTimeout(() => setCopied(false), 2000)
                } catch (err) {
                    console.error("Failed to copy text: ", err)
                    toast.error("Failed to copy license key")
                }
                document.body.removeChild(textArea)
            })
        } else {
            // Fallback if clipboard API is not available
            const textArea = document.createElement("textarea")
            textArea.value = licenseKey
            document.body.appendChild(textArea)
            textArea.select()
            try {
                document.execCommand("copy")
                setCopied(true)
                toast.success("License key copied to clipboard")
                setTimeout(() => setCopied(false), 2000)
            } catch (err) {
                console.error("Failed to copy text: ", err)
                toast.error("Failed to copy license key")
            }
            document.body.removeChild(textArea)
        }
    }

    const toggleVisibility = () => {
        setVisible(!visible)
    }

    const displayKey = visible ? licenseKey : licenseKey.replace(/./g, "•").replace(/-/g, "-")

    return (
        <div className={`flex items-center gap-1 ${className}`}>
            <code className="font-mono text-xs bg-muted p-1 rounded flex-1 overflow-hidden text-ellipsis">{displayKey}</code>
            <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={toggleVisibility}
                title={visible ? "Hide license key" : "Show license key"}
            >
                {visible ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={copyToClipboard} title="Copy license key">
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            </Button>
        </div>
    )
}