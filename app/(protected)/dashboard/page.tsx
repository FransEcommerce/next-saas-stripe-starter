"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Box,
  Download,
  FileText,
  Home,
  Key,
  Package,
  Settings,
  ShoppingBag,
  User,
  CreditCard,
  Bell,
  Search,
  CheckCircle,
  AlertCircle,
  Activity,
  Clock,
  Sparkles,
  RefreshCcw,
  LayoutGrid,
  History,
  Tag,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { InteractiveBarChart } from "@/components/charts/interactive-bar-chart";

export default function Dashboard() {
  const [pluginManagerInstalled, setPluginManagerInstalled] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState(0)

  const handleDownload = () => {
    setDownloadProgress(0)
    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setPluginManagerInstalled(true)
          return 100
        }
        return prev + 10
      })
    }, 300)
  }

  return (
    <div className="flex flex-col">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center">
          <h1 className="text-lg font-semibold md:text-2xl">Welcome back, User</h1>
        </div>

        {/* Enhanced Plugin Manager Card */}
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-background dark:from-blue-400/20 dark:via-purple-400/15 dark:to-background">
          {/* Decorative Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-primary/5 dark:bg-primary/10" />
            <div className="absolute -left-4 bottom-4 h-32 w-32 rounded-full bg-primary/5 dark:bg-primary/10" />
            <div className="absolute right-1/4 top-1/4 h-16 w-16 rounded-full bg-primary/5 dark:bg-primary/10" />
          </div>

          {/* Content */}
          <div className="relative">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="inline-flex items-center rounded-full bg-gradient-to-r from-amber-500/20 via-purple-500/20 to-pink-500/20 dark:from-amber-400/30 dark:via-purple-400/30 dark:to-pink-400/30 px-3 py-1 text-sm font-medium text-amber-600 dark:text-amber-300 border border-amber-500/20 dark:border-amber-400/30">
                      <Sparkles className="mr-1 h-3.5 w-3.5 text-amber-500 dark:text-amber-400" />
                      Premium Tool
                    </div>
                    {pluginManagerInstalled ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        <CheckCircle className="mr-1 h-3 w-3" /> Installed
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                        <AlertCircle className="mr-1 h-3 w-3" /> Not Installed
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-2xl font-bold">Plugin Manager</CardTitle>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      <Tag className="mr-1 h-3 w-3" /> v1.0.0
                    </Badge>
                  </div>
                  <CardDescription className="max-w-[600px] text-base">
                    Experience seamless plugin management with our advanced tool. Designed to enhance your workflow
                    and maximize productivity.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Feature Grid */}
              <div className="grid gap-4 md:grid-cols-3">
                <div className="relative overflow-hidden rounded-xl border bg-background/60 p-4 backdrop-blur-sm">
                  <div className="flex gap-4">
                    <div className="shrink-0 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <Download className="h-6 w-6 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-medium leading-none">Easy Downloads</h4>
                      <p className="text-sm text-muted-foreground">Download plugins with a single click</p>
                    </div>
                  </div>
                </div>
                <div className="relative overflow-hidden rounded-xl border bg-background/60 p-4 backdrop-blur-sm">
                  <div className="flex gap-4">
                    <div className="shrink-0 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <RefreshCcw className="h-6 w-6 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-medium leading-none">One-Click Updates</h4>
                      <p className="text-sm text-muted-foreground">Keep all plugins up to date easily</p>
                    </div>
                  </div>
                </div>
                <div className="relative overflow-hidden rounded-xl border bg-background/60 p-4 backdrop-blur-sm">
                  <div className="flex gap-4">
                    <div className="shrink-0 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <LayoutGrid className="h-6 w-6 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-medium leading-none">Central Management</h4>
                      <p className="text-sm text-muted-foreground">Manage all your plugins in one place</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Download Progress */}
              {downloadProgress > 0 && downloadProgress < 100 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Downloading Plugin Manager...</span>
                    <span className="font-medium">{downloadProgress}%</span>
                  </div>
                  <div className="relative h-2 overflow-hidden rounded-full bg-primary/10">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-300"
                      style={{ width: `${downloadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </CardContent>

            <CardFooter className="flex flex-wrap gap-2">
              {pluginManagerInstalled ? (
                <>
                  <Button size="lg" variant="outline" className="gap-2">
                    <Download className="h-4 w-4" />
                    Download Again
                  </Button>
                  <Button size="lg" variant="outline" className="gap-2">
                    <FileText className="h-4 w-4" />
                    Documentation
                  </Button>
                  <Button size="lg" className="gap-2">
                    <Key className="h-4 w-4" />
                    View License
                  </Button>
                </>
              ) : (
                <Button
                  size="lg"
                  onClick={handleDownload}
                  disabled={downloadProgress > 0 && downloadProgress < 100}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download Plugin Manager
                </Button>
              )}
            </CardFooter>
          </div>
        </Card >

        {/* Stats Grid */}
        < div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4" >
          <Card className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Plugins</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-500">+4</span> in catalog
              </p>
              <div className="absolute bottom-0 left-0 right-0 h-1">
                <div className="h-full w-full bg-gradient-to-r from-primary to-primary/60" />
              </div>
            </CardContent>
          </Card>
          <Card className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Licenses</CardTitle>
              <Key className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-500">2</span> recently activated
              </p>
              <div className="absolute bottom-0 left-0 right-0 h-1">
                <div className="h-full w-3/4 bg-gradient-to-r from-primary to-primary/60" />
              </div>
            </CardContent>
          </Card>
          <Card className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Recent Orders</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-500">+2</span> this month
              </p>
              <div className="absolute bottom-0 left-0 right-0 h-1">
                <div className="h-full w-1/2 bg-gradient-to-r from-primary to-primary/60" />
              </div>
            </CardContent>
          </Card>
          <Card className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1</div>
              <p className="text-xs text-muted-foreground">Professional Plan</p>
              <div className="absolute bottom-0 left-0 right-0 h-1">
                <div className="h-full w-1/4 bg-gradient-to-r from-primary to-primary/60" />
              </div>
            </CardContent>
          </Card>
        </div >

        {/* Usage Trends */}
        < InteractiveBarChart />
        {/* <Card className="col-span-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Usage Trends</CardTitle>
                    <CardDescription>Plugin usage patterns and performance metrics over time</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      Last 7 Days
                    </Button>
                    <Button variant="outline" size="sm">
                      Last 30 Days
                    </Button>
                    <Button variant="outline" size="sm">
                      All Time
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[350px] w-full rounded-lg border bg-gradient-to-b from-primary/5 to-background p-6">
                  <div className="flex h-full items-center justify-center">
                    <BarChart3 className="h-16 w-16 text-muted-foreground/50" />
                  </div>
                </div>
              </CardContent>
            </Card> */}
      </main >
    </div >
  )
}

