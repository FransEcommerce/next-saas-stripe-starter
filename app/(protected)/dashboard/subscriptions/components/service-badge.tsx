import type { Service } from "./types"

interface ServiceBadgeProps {
    service: Service
    className?: string
}

export function ServiceBadge({ service, className = "" }: ServiceBadgeProps) {
    return (
        <div
            className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${className}`}
            style={{ backgroundColor: `${service.color}20`, color: service.color }}
        >
            {service.name}
            {service.limitType !== "UNLIMITED" && service.limitValue && (
                <span className="ml-1 text-xs opacity-80">
                    ({service.limitValue} {service.limitType.toLowerCase()})
                </span>
            )}
        </div>
    )
}

