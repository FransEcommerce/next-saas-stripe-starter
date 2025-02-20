import { UserRole } from "@prisma/client";

import { SidebarNavItem } from "types";

export const sidebarLinks: SidebarNavItem[] = [
  {
    title: "ADMIN",
    items: [
      {
        href: "/admin",
        icon: "laptop",
        title: "Admin Panel",
        authorizeOnly: UserRole.ADMIN,
      },
      {
        href: "/admin/orders",
        icon: "package",
        title: "Orders",
        badge: 2,
        authorizeOnly: UserRole.ADMIN,
      },
      {
        href: "/admin/products",
        icon: "package",
        title: "Products",
        authorizeOnly: UserRole.ADMIN,
      },
      {
        href: "/admin/plugins",
        icon: "package",
        title: "Plugins",
        authorizeOnly: UserRole.ADMIN,
      },
      {
        href: "/admin/licenses",
        icon: "package",
        title: "Licenses",
        authorizeOnly: UserRole.ADMIN,
      },
      {
        href: "/admin/coupons",
        icon: "package",
        title: "Coupons",
        authorizeOnly: UserRole.ADMIN,
      },
      {
        href: "/admin/affiliates",
        icon: "package",
        title: "Affiliates",
        authorizeOnly: UserRole.ADMIN,
      },
      {
        href: "/admin/users",
        icon: "package",
        title: "Users",
        authorizeOnly: UserRole.ADMIN,
      },
    ],
  },
  {
    title: "MENU",
    items: [
      { href: "/dashboard", icon: "dashboard", title: "Dashboard" },
      {
        href: "/dashboard/billing",
        icon: "billing",
        title: "Billing",
        authorizeOnly: UserRole.USER,
      },
      { href: "/dashboard/charts", icon: "lineChart", title: "Charts" },
      {
        href: "#/dashboard/posts",
        icon: "post",
        title: "User Posts",
        authorizeOnly: UserRole.USER,
        disabled: true,
      },
    ],
  },
  {
    title: "OPTIONS",
    items: [
      { href: "/dashboard/settings", icon: "settings", title: "Settings" },
      { href: "/", icon: "home", title: "Homepage" },
      { href: "/docs", icon: "bookOpen", title: "Documentation" },
      {
        href: "#",
        icon: "messages",
        title: "Support",
        authorizeOnly: UserRole.USER,
        disabled: true,
      },
    ],
  },
];
