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
        href: "/admin/users",
        icon: "user",
        title: "Users",
        authorizeOnly: UserRole.ADMIN,
      },
      {
        href: "/admin/orders",
        icon: "shoppingCart",
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
        icon: "logo",
        title: "Plugins",
        authorizeOnly: UserRole.ADMIN,
      },
      {
        href: "/admin/licenses",
        icon: "post",
        title: "Licenses",
        authorizeOnly: UserRole.ADMIN,
      },
      {
        href: "/admin/coupons",
        icon: "tag",
        title: "Coupons",
        authorizeOnly: UserRole.ADMIN,
      },
      {
        href: "/admin/affiliates",
        icon: "users",
        title: "Affiliates",
        authorizeOnly: UserRole.ADMIN,
      },
      {
        href: "/admin/services",
        icon: "settings",
        title: "Services",
        authorizeOnly: UserRole.ADMIN,
      },
      {
        href: "/admin/plans",
        icon: "billing",
        title: "Plan",
        authorizeOnly: UserRole.ADMIN,
      },
      {
        href: "/admin/subscriptions",
        icon: "repeat",
        title: "Subscription",
        authorizeOnly: UserRole.ADMIN,
      },
    ],
  },
  {
    title: "MENU",
    items: [
      { href: "/dashboard", icon: "dashboard", title: "Dashboard" },
      // {
      //   href: "/dashboard/billing",
      //   icon: "billing",
      //   title: "Billing",
      //   authorizeOnly: UserRole.USER,
      // },
      {
        href: "/dashboard/plugins",
        icon: "logo",
        title: "Plugins",
      },
      {
        href: "/dashboard/orders",
        icon: "shoppingCart",
        title: "Orders",
      },
      {
        href: "/dashboard/licenses",
        icon: "post",
        title: "Licenses",
      },
      {
        href: "/dashboard/subscriptions",
        icon: "repeat",
        title: "Subscription",
      },
      // { href: "/dashboard/charts", icon: "lineChart", title: "Charts" },
      // {
      //   href: "#/dashboard/posts",
      //   icon: "post",
      //   title: "User Posts",
      //   authorizeOnly: UserRole.USER,
      //   disabled: true,
      // },
    ],
  },
  {
    title: "OPTIONS",
    items: [
      { href: "/dashboard/settings", icon: "settings", title: "Settings" },
      // { href: "/", icon: "home", title: "Homepage" },
      // { href: "/docs", icon: "bookOpen", title: "Documentation" },
      // {
      //   href: "#",
      //   icon: "messages",
      //   title: "Support",
      //   authorizeOnly: UserRole.USER,
      //   disabled: true,
      // },
    ],
  },
];
