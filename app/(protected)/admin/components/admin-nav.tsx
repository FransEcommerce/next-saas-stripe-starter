"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  {
    title: "Overview",
    href: "/admin",
  },
  {
    title: "Plugins",
    href: "/admin/plugins",
  },
  {
    title: "Orders",
    href: "/admin/orders",
  },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex space-x-2 lg:space-x-6 mb-8">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            pathname === item.href
              ? "text-black dark:text-white"
              : "text-muted-foreground"
          )}
        >
          {item.title}
        </Link>
      ))}
    </nav>
  );
}
