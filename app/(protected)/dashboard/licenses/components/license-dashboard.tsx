"use client"

import { useState } from "react"
import Image from "next/image"
import { Search, Filter, ChevronDown as LicenseIcon, ShoppingCart } from "lucide-react"
import { format, parseISO } from "date-fns"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { License } from "./types"
import { LicenseKey } from "./license-key"
import Link from "next/link"

interface LicenseDashboardProps {
    initialLicenses: License[]
}

export function LicenseDashboard({ initialLicenses }: LicenseDashboardProps) {
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [licenses] = useState(initialLicenses)

    // Helper function to safely format dates
    const formatDate = (dateString: string) => {
        if (!dateString || isNaN(Date.parse(dateString))) {
            return "N/A"
        }
        return format(parseISO(dateString), "MMM d, yyyy")
    }

    // Filter licenses based on search query and status filter
    const filteredLicenses = licenses.filter((license) => {
        const matchesSearch =
            license.pluginName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            license.licenseKey.toLowerCase().includes(searchQuery.toLowerCase()) ||
            license.domain.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesStatus = statusFilter === "all" || license.status === statusFilter

        return matchesSearch && matchesStatus
    })

    // Function to get status badge color
    const getStatusBadge = (status) => {
        switch (status) {
            case "active":
                return <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>
            case "expired":
                return <Badge variant="destructive">Expired</Badge>
            case "pending":
                return (
                    <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                        Pending
                    </Badge>
                )
            default:
                return <Badge variant="secondary">{status}</Badge>
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">My Licenses</h1>
                <p className="text-muted-foreground">Manage and view all your purchased plugin licenses</p>
            </div>

            <Tabs defaultValue="all" className="w-full">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                    <TabsList>
                        <TabsTrigger value="all">All Licenses</TabsTrigger>
                        <TabsTrigger value="active">Active</TabsTrigger>
                    </TabsList>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <div className="relative w-full sm:w-[300px]">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search licenses..."
                                className="pl-8 w-full"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="icon">
                                    <Filter className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setStatusFilter("all")}>All Statuses</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setStatusFilter("active")}>Active Only</DropdownMenuItem>
                                {/* <DropdownMenuItem onClick={() => setStatusFilter("expired")}>Expired Only</DropdownMenuItem> */}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                <TabsContent value="all" className="space-y-4">
                    {filteredLicenses.length > 0 ? (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {filteredLicenses.map((license) => (
                                <Card
                                    key={license.id}
                                    className="overflow-hidden group hover:shadow-lg transition-all duration-300 border shadow-md"
                                >
                                    <div className="relative h-48 w-full">
                                        <Image
                                            src={license.coverUrl || "/placeholder.svg"}
                                            alt={`${license.pluginName} cover`}
                                            fill
                                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                        <div className="absolute top-3 right-3 z-20">{getStatusBadge(license.status)}</div>
                                    </div>

                                    <div className="p-6">
                                        <div className="flex items-start gap-4 mb-6">
                                            <div className="w-16 rounded-lg overflow-hidden border-2 border-border shadow-sm">
                                                <Image
                                                    src={license.avatarUrl || "/placeholder.svg"}
                                                    alt={license.pluginName}
                                                    width={500}
                                                    height={500}
                                                    className="object-cover"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-lg leading-tight mb-1">{license.pluginName}</h3>
                                                <p className="text-sm text-muted-foreground">Version {license.version}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="bg-muted/50 rounded-lg p-3">
                                                <span className="text-xs uppercase tracking-wider font-medium text-muted-foreground block mb-2">
                                                    License Key
                                                </span>
                                                <LicenseKey licenseKey={license.licenseKey} />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-muted/30 rounded-lg p-3">
                                                    <span className="text-xs uppercase tracking-wider font-medium text-muted-foreground block mb-1">
                                                        Domain
                                                    </span>
                                                    <p className="font-medium text-sm truncate" title={license.domain || "-"}>
                                                        {license.domain || "-"}
                                                    </p>
                                                </div>

                                                <div className="bg-muted/30 rounded-lg p-3">
                                                    <span className="text-xs uppercase tracking-wider font-medium text-muted-foreground block mb-1">
                                                        Expires
                                                    </span>
                                                    <p className="font-medium text-sm">
                                                        {formatDate(license.expirationDate)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="px-6 pb-6">
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button variant="outline" className="w-full">
                                                    View Details
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="sm:max-w-[525px]">
                                                <DialogHeader>
                                                    <DialogTitle className="flex items-center gap-3">
                                                        <Image
                                                            src={license.avatarUrl || "/placeholder.svg"}
                                                            alt={license.pluginName}
                                                            width={40}
                                                            height={40}
                                                            className="rounded-md"
                                                        />
                                                        {license.pluginName}
                                                    </DialogTitle>
                                                    <DialogDescription>License details and management</DialogDescription>
                                                </DialogHeader>
                                                <div className="grid gap-4 py-4">
                                                    <div className="grid grid-cols-3 items-center gap-4">
                                                        <span className="text-sm font-medium">License Key:</span>
                                                        <div className="col-span-2">
                                                            <LicenseKey licenseKey={license.licenseKey} />
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-3 items-center gap-4">
                                                        <span className="text-sm font-medium">Status:</span>
                                                        <div className="col-span-2">{getStatusBadge(license.status)}</div>
                                                    </div>
                                                    <div className="grid grid-cols-3 items-center gap-4">
                                                        <span className="text-sm font-medium">Purchase Date:</span>
                                                        <span className="col-span-2">
                                                            {formatDate(license.purchaseDate)}
                                                        </span>
                                                    </div>
                                                    <div className="grid grid-cols-3 items-center gap-4">
                                                        <span className="text-sm font-medium">Expiration Date:</span>
                                                        <span className="col-span-2">
                                                            {formatDate(license.expirationDate)}
                                                        </span>
                                                    </div>
                                                    <div className="grid grid-cols-3 items-center gap-4">
                                                        <span className="text-sm font-medium">Current Version:</span>
                                                        <span className="col-span-2">{license.version}</span>
                                                    </div>
                                                    <div className="grid grid-cols-3 items-center gap-4">
                                                        <span className="text-sm font-medium">Domain:</span>
                                                        <span className="col-span-2">{license.domain || "-"}</span>
                                                    </div>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center p-12 border rounded-lg bg-muted/20">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                                <LicenseIcon className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-medium mb-2">No Licenses Found</h3>
                            <p className="text-muted-foreground max-w-md mx-auto mb-6">
                                {searchQuery ? 
                                    `No licenses match your search criteria "${searchQuery}". Try a different search term or clear the filter.` : 
                                    "You don't have any plugin licenses yet. Purchase a plugin to get started with your development journey."}
                            </p>
                            <Link href="/dashboard/plugins" passHref>
                                <Button variant="outline">
                                    Browse Plugins
                                </Button>
                            </Link>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="active" className="space-y-4">
                    {licenses.filter((license) => license.status === "active").length > 0 ? (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {licenses
                                .filter((license) => license.status === "active")
                                .map((license) => (
                                    <Card
                                        key={license.id}
                                        className="overflow-hidden group hover:shadow-lg transition-all duration-300 border shadow-md"
                                    >
                                        <div className="relative h-48 w-full">
                                            <Image
                                                src={license.coverUrl || "/placeholder.svg"}
                                                alt={`${license.pluginName} cover`}
                                                fill
                                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                            <div className="absolute top-3 right-3 z-20">{getStatusBadge(license.status)}</div>
                                        </div>

                                        <div className="p-6">
                                            <div className="flex items-start gap-4 mb-6">
                                                <div className="w-16 rounded-lg overflow-hidden border-2 border-border shadow-sm">
                                                    <Image
                                                        src={license.avatarUrl || "/placeholder.svg"}
                                                        alt={license.pluginName}
                                                        width={500}
                                                        height={500}
                                                        className="object-cover"
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-lg leading-tight mb-1">{license.pluginName}</h3>
                                                    <p className="text-sm text-muted-foreground">Version {license.version}</p>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="bg-muted/50 rounded-lg p-3">
                                                    <span className="text-xs uppercase tracking-wider font-medium text-muted-foreground block mb-2">
                                                        License Key
                                                    </span>
                                                    <LicenseKey licenseKey={license.licenseKey} />
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="bg-muted/30 rounded-lg p-3">
                                                        <span className="text-xs uppercase tracking-wider font-medium text-muted-foreground block mb-1">
                                                            Domain
                                                        </span>
                                                        <p className="font-medium text-sm truncate" title={license.domain || "-"}>
                                                            {license.domain || "-"}
                                                        </p>
                                                    </div>

                                                    <div className="bg-muted/30 rounded-lg p-3">
                                                        <span className="text-xs uppercase tracking-wider font-medium text-muted-foreground block mb-1">
                                                            Expires
                                                        </span>
                                                        <p className="font-medium text-sm">
                                                            {formatDate(license.expirationDate)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="px-6 pb-6">
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button variant="outline" className="w-full">
                                                        View Details
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="sm:max-w-[525px]">
                                                    <DialogHeader>
                                                        <DialogTitle className="flex items-center gap-3">
                                                            <Image
                                                                src={license.avatarUrl || "/placeholder.svg"}
                                                                alt={license.pluginName}
                                                                width={40}
                                                                height={40}
                                                                className="rounded-md"
                                                            />
                                                            {license.pluginName}
                                                        </DialogTitle>
                                                        <DialogDescription>License details and management</DialogDescription>
                                                    </DialogHeader>
                                                    <div className="grid gap-4 py-4">
                                                        <div className="grid grid-cols-3 items-center gap-4">
                                                            <span className="text-sm font-medium">License Key:</span>
                                                            <div className="col-span-2">
                                                                <LicenseKey licenseKey={license.licenseKey} />
                                                            </div>
                                                        </div>
                                                        <div className="grid grid-cols-3 items-center gap-4">
                                                            <span className="text-sm font-medium">Status:</span>
                                                            <div className="col-span-2">{getStatusBadge(license.status)}</div>
                                                        </div>
                                                        <div className="grid grid-cols-3 items-center gap-4">
                                                            <span className="text-sm font-medium">Purchase Date:</span>
                                                            <span className="col-span-2">
                                                                {formatDate(license.purchaseDate)}
                                                            </span>
                                                        </div>
                                                        <div className="grid grid-cols-3 items-center gap-4">
                                                            <span className="text-sm font-medium">Expiration Date:</span>
                                                            <span className="col-span-2">
                                                                {formatDate(license.expirationDate)}
                                                            </span>
                                                        </div>
                                                        <div className="grid grid-cols-3 items-center gap-4">
                                                            <span className="text-sm font-medium">Current Version:</span>
                                                            <span className="col-span-2">{license.version}</span>
                                                        </div>
                                                        <div className="grid grid-cols-3 items-center gap-4">
                                                            <span className="text-sm font-medium">Domain:</span>
                                                            <span className="col-span-2">{license.domain}</span>
                                                        </div>
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
                                        </div>
                                    </Card>
                                ))}
                        </div>
                    ) : (
                        <div className="text-center p-12 border rounded-lg bg-muted/20">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                                <ShoppingCart className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-medium mb-2">No Active Licenses</h3>
                            <p className="text-muted-foreground max-w-md mx-auto mb-6">
                                You don't have any active plugin licenses at the moment. Purchase a plugin or renew an expired license to continue your development.
                            </p>
                            <Link href="/dashboard/plugins" passHref>
                                <Button variant="outline">
                                    Browse Plugins
                                </Button>
                            </Link>
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    )
}