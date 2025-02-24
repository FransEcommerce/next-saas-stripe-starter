// import { getCurrentUser } from "@/lib/session";
// import { constructMetadata } from "@/lib/utils";
// import { Button } from "@/components/ui/button";
// import { DashboardHeader } from "@/components/dashboard/header";
// import { EmptyPlaceholder } from "@/components/shared/empty-placeholder";

// export const metadata = constructMetadata({
//   title: "Dashboard – SaaS Starter",
//   description: "Create and manage content.",
// });

// export default async function DashboardPage() {
//   const user = await getCurrentUser();

//   return (
//     <>
//       <DashboardHeader
//         heading="Dashboard"
//         text={`Current Role : ${user?.role} — Change your role in settings.`}
//       />
//       <EmptyPlaceholder>
//         <EmptyPlaceholder.Icon name="post" />
//         <EmptyPlaceholder.Title>No content created</EmptyPlaceholder.Title>
//         <EmptyPlaceholder.Description>
//           You don&apos;t have any content yet. Start creating content.
//         </EmptyPlaceholder.Description>
//         <Button>Add Content</Button>
//       </EmptyPlaceholder>
//     </>
//   );
// }


"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import {
  Settings,
  MoreVertical,
  RefreshCw,
  Download,
  AlertCircle,
  Bell,
  ExternalLink,
  ShieldAlert,
  Calendar,
  AlertTriangle,
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface PluginNotification {
  id: string
  type: "info" | "warning" | "error"
  message: string
  date: string
}

interface PluginLicense {
  status: "active" | "expired" | "trial"
  expiryDate: string
  type: "personal" | "business" | "enterprise"
}

interface PluginCustomUI {
  badges?: {
    text: string
    variant: "default" | "secondary" | "destructive" | "warning"
  }[]
  customFields?: {
    label: string
    value: string
  }[]
  warning?: string
}

interface Plugin {
  id: string
  name: string
  description: string
  version: string
  installed: boolean
  hasUpdate: boolean
  newVersion?: string
  image: string
  hasSettings: boolean
  settingsType?: "internal" | "external"
  settingsUrl?: string
  license: PluginLicense
  notifications: PluginNotification[]
  customUI?: PluginCustomUI
  updateDetails?: string
}

// ... 保持之前的 interfaces 和 plugins 数据 ...

interface NextPionAccount {
  name: string
  email: string
  avatarUrl?: string
}

interface PluginManagerInfo {
  version: string
  newVersion: string | null
  license: {
    status: "active" | "expired" | "trial"
    expiryDate: string
    type: "personal" | "business" | "enterprise"
    allowedPlugins: number
    usedPlugins: number
  }
  lastCheck: string
  systemStatus: {
    status: "operational" | "degraded" | "maintenance"
    message?: string
  }
  stats: {
    totalPlugins: number
    activePlugins: number
    updatesAvailable: number
  }
  account: NextPionAccount
}

const managerInfo: PluginManagerInfo = {
  version: "2.5.0",
  newVersion: "2.6.0",
  license: {
    status: "active",
    expiryDate: "2024-12-31",
    type: "business",
    allowedPlugins: 25,
    usedPlugins: 18,
  },
  lastCheck: "2024-02-22T15:30:00Z",
  systemStatus: {
    status: "operational",
    message: "All systems operational",
  },
  stats: {
    totalPlugins: 18,
    activePlugins: 15,
    updatesAvailable: 3,
  },
  account: {
    name: "John Doe",
    email: "john.doe@example.com",
    avatarUrl: "/placeholder.svg?height=40&width=40",
  },
}

function ManagerStatus() {
  return (
    <div className="mb-8 rounded-lg border bg-card text-card-foreground">
      <div className="p-6">
        {/* Account Info Section */}
        <div className="mb-6 pb-6 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                {managerInfo.account.avatarUrl ? (
                  <img
                    src={managerInfo.account.avatarUrl || "/placeholder.svg"}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-lg font-semibold">{managerInfo.account.name.charAt(0)}</span>
                )}
              </div>
              <div>
                <div className="font-medium">{managerInfo.account.name}</div>
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <span>{managerInfo.account.email}</span>
                  <Badge variant="secondary" className="text-xs">
                    NextPion Account
                  </Badge>
                </div>
              </div>
            </div>
            <Button variant="outline" size="sm" asChild>
              <a
                href="https://nextpion.example.com/account"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                Manage Account
                <ExternalLink className="h-3 w-3" />
              </a>
            </Button>
          </div>
        </div>

        {/* Rest of the ManagerStatus content */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Column - Main Info */}
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-semibold mb-1">Plugin Manager</h2>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span>Version {managerInfo.version}</span>
                  {managerInfo.newVersion && (
                    <Badge variant="warning" className="gap-1">
                      <RefreshCw className="h-3 w-3" />
                      Update {managerInfo.newVersion} available
                    </Badge>
                  )}
                </div>
              </div>
              {managerInfo.newVersion && (
                <Button>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Update Manager
                </Button>
              )}
            </div>

            <div className="grid gap-4">
              <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
                <div className="space-y-0.5">
                  <div className="text-sm font-medium">License Status</div>
                  <div className="text-sm text-muted-foreground">
                    {managerInfo.license.type.charAt(0).toUpperCase() + managerInfo.license.type.slice(1)} License
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {managerInfo.license.status === "active" ? (
                    <Badge variant="default">Active</Badge>
                  ) : managerInfo.license.status === "trial" ? (
                    <Badge variant="warning">Trial</Badge>
                  ) : (
                    <Badge variant="destructive">Expired</Badge>
                  )}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        Expires on {new Date(managerInfo.license.expiryDate).toLocaleDateString()}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
                <div className="space-y-0.5">
                  <div className="text-sm font-medium">System Status</div>
                  <div className="text-sm text-muted-foreground">{managerInfo.systemStatus.message}</div>
                </div>
                <Badge
                  variant={
                    managerInfo.systemStatus.status === "operational"
                      ? "default"
                      : managerInfo.systemStatus.status === "degraded"
                        ? "warning"
                        : "secondary"
                  }
                >
                  {managerInfo.systemStatus.status.charAt(0).toUpperCase() + managerInfo.systemStatus.status.slice(1)}
                </Badge>
              </div>
            </div>
          </div>

          {/* Right Column - Stats */}
          <div className="grid gap-4 lg:border-l lg:pl-6">
            <div className="space-y-4">
              <h3 className="font-medium">Usage Statistics</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border p-3">
                  <div className="text-sm font-medium">Plugin Usage</div>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="text-2xl font-bold">
                      {managerInfo.license.usedPlugins}/{managerInfo.license.allowedPlugins}
                    </div>
                    <div className="text-sm text-muted-foreground">plugins</div>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{
                        width: `${(managerInfo.license.usedPlugins / managerInfo.license.allowedPlugins) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="rounded-lg border p-3">
                  <div className="text-sm font-medium">Updates Available</div>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="text-2xl font-bold">{managerInfo.stats.updatesAvailable}</div>
                    <div className="text-sm text-muted-foreground">plugins</div>
                  </div>
                  {managerInfo.stats.updatesAvailable > 0 && (
                    <div className="mt-2 text-sm text-muted-foreground">
                      Updates pending for {managerInfo.stats.updatesAvailable} plugins
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-lg border p-3">
                <div className="mb-2 flex items-center justify-between">
                  <div className="text-sm font-medium">Plugin Status Overview</div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <div className="text-xs text-muted-foreground">
                          Last checked: {new Date(managerInfo.lastCheck).toLocaleString()}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>System automatically checks for updates every hour</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold">{managerInfo.stats.totalPlugins}</div>
                    <div className="text-xs text-muted-foreground">Total</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{managerInfo.stats.activePlugins}</div>
                    <div className="text-xs text-muted-foreground">Active</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {managerInfo.stats.totalPlugins - managerInfo.stats.activePlugins}
                    </div>
                    <div className="text-xs text-muted-foreground">Inactive</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const plugins: Plugin[] = [
  {
    id: "1",
    name: "Analytics Dashboard",
    description: "Track and visualize your application metrics",
    version: "1.2.0",
    newVersion: "1.3.0",
    installed: true,
    hasUpdate: true,
    image: "/placeholder.svg?height=60&width=60",
    hasSettings: true,
    settingsType: "internal",
    license: {
      status: "active",
      expiryDate: "2024-12-31",
      type: "business",
    },
    notifications: [
      {
        id: "1",
        type: "info",
        message: "New features available in latest update",
        date: "2024-02-20",
      },
    ],
    customUI: {
      badges: [
        { text: "Popular", variant: "default" },
        { text: "Business", variant: "secondary" },
      ],
      customFields: [{ label: "Data Points", value: "1M/month" }],
    },
    updateDetails: "• Improved performance\n• New dashboard widgets\n• Bug fixes",
  },
  {
    id: "2",
    name: "Authentication",
    description: "User authentication and authorization",
    version: "2.0.1",
    installed: true,
    hasUpdate: false,
    image: "/placeholder.svg?height=60&width=60",
    hasSettings: true,
    settingsType: "external",
    settingsUrl: "https://auth.example.com/settings",
    license: {
      status: "trial",
      expiryDate: "2024-03-15",
      type: "personal",
    },
    notifications: [
      {
        id: "2",
        type: "warning",
        message: "Trial period ending soon",
        date: "2024-02-21",
      },
    ],
    customUI: {
      badges: [{ text: "Trial", variant: "warning" }],
      warning: "Trial expires in 5 days",
    },
  },
  {
    id: "3",
    name: "Database Backup",
    description: "Automated database backup solution",
    version: "1.0.3",
    installed: false,
    hasUpdate: false,
    image: "/placeholder.svg?height=60&width=60",
    hasSettings: false,
    license: {
      status: "expired",
      expiryDate: "2024-01-31",
      type: "personal",
    },
    notifications: [],
    customUI: {
      badges: [{ text: "Essential", variant: "default" }],
    },
  },
  {
    id: "4",
    name: "Image Optimization",
    description: "Automatic image optimization and processing",
    version: "1.1.0",
    newVersion: "1.2.0",
    installed: true,
    hasUpdate: true,
    image: "/placeholder.svg?height=60&width=60",
    hasSettings: true,
    settingsType: "internal",
    license: {
      status: "active",
      expiryDate: "2024-12-31",
      type: "enterprise",
    },
    notifications: [
      {
        id: "3",
        type: "error",
        message: "Configuration error detected",
        date: "2024-02-22",
      },
    ],
    customUI: {
      badges: [{ text: "Enterprise", variant: "default" }],
      customFields: [{ label: "Processing", value: "50K images/day" }],
    },
    updateDetails: "• New compression algorithms\n• WebP support\n• Performance improvements",
  },
]

export default function PluginManager() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <ManagerStatus />

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">Installed Plugins</h2>
        <p className="text-muted-foreground">Manage your installed plugins and discover new ones</p>
      </div>

      {/* 原有的插件列表代码 */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {plugins.map((plugin) => (
          <Card key={plugin.id} className="relative">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="w-[60px] h-[60px] rounded-lg bg-muted flex items-center justify-center">
                <img
                  src={plugin.image || "/placeholder.svg"}
                  alt={`${plugin.name} icon`}
                  className="w-10 h-10 object-contain"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-xl">{plugin.name}</CardTitle>
                  {plugin.notifications.length > 0 && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Bell className="h-4 w-4 text-muted-foreground" />
                          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] font-medium text-white flex items-center justify-center">
                            {plugin.notifications.length}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          {plugin.notifications.map((notification) => (
                            <div key={notification.id} className="mb-2 last:mb-0">
                              {notification.message}
                            </div>
                          ))}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
                <CardDescription className="mt-1.5">
                  <div className="flex items-center gap-2">
                    <span>Version {plugin.version}</span>
                    {plugin.hasUpdate && (
                      <span className="text-xs text-muted-foreground">({plugin.newVersion} available)</span>
                    )}
                  </div>
                </CardDescription>
                {plugin.customUI?.badges && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {plugin.customUI.badges.map((badge, index) => (
                      <Badge key={index} variant={badge.variant as any}>
                        {badge.text}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              {plugin.installed && plugin.hasSettings && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="absolute top-4 right-4">
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      {plugin.settingsType === "external" ? (
                        <a
                          href={plugin.settingsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center"
                        >
                          <Settings className="mr-2 h-4 w-4" />
                          Settings
                          <ExternalLink className="ml-2 h-3 w-3" />
                        </a>
                      ) : (
                        <>
                          <Settings className="mr-2 h-4 w-4" />
                          Settings
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <ShieldAlert className="mr-2 h-4 w-4" />
                      License Info
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">{plugin.description}</p>

              {plugin.customUI?.customFields && (
                <div className="mt-3 space-y-2">
                  {plugin.customUI.customFields.map((field, index) => (
                    <div key={index} className="flex items-center text-sm">
                      <span className="text-muted-foreground">{field.label}:</span>
                      <span className="ml-2 font-medium">{field.value}</span>
                    </div>
                  ))}
                </div>
              )}

              {plugin.customUI?.warning && (
                <div className="mt-3 flex items-center gap-2 text-sm text-yellow-600 dark:text-yellow-500">
                  <AlertTriangle className="h-4 w-4" />
                  {plugin.customUI.warning}
                </div>
              )}

              {plugin.license.status !== "active" && (
                <div className="mt-3 flex items-center gap-2 text-sm">
                  {plugin.license.status === "trial" ? (
                    <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-500">
                      <Calendar className="h-4 w-4" />
                      Trial expires on {plugin.license.expiryDate}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-red-600 dark:text-red-500">
                      <AlertCircle className="h-4 w-4" />
                      License expired on {plugin.license.expiryDate}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex items-center justify-between">
              <Badge variant={plugin.installed ? "default" : "secondary"}>
                {plugin.installed ? "Installed" : "Available"}
              </Badge>
              {plugin.installed && plugin.hasUpdate ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Update
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="max-w-xs">
                        <p className="font-medium mb-1">Update to {plugin.newVersion}</p>
                        <p className="text-sm whitespace-pre-line">{plugin.updateDetails}</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : !plugin.installed ? (
                <Button size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Install
                </Button>
              ) : null}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

