"use client"

import { useState } from "react"
import Image from "next/image"
import { Search, Filter, ChevronDown } from "lucide-react"
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
                    <Card>
                        <CardContent className="p-0">
                            <div className="rounded-md overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Plugin</TableHead>
                                            <TableHead className="hidden md:table-cell">License Key</TableHead>
                                            <TableHead className="hidden md:table-cell">Purchase Date</TableHead>
                                            <TableHead className="hidden lg:table-cell">Expiration</TableHead>
                                            <TableHead className="hidden lg:table-cell">Domain</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredLicenses.length > 0 ? (
                                            filteredLicenses.map((license) => (
                                                <TableRow key={license.id}>
                                                    <TableCell>
                                                        <div className="flex items-center gap-3">
                                                            <Image
                                                                src={license.avatarUrl || "/placeholder.svg"}
                                                                alt={license.pluginName}
                                                                width={40}
                                                                height={40}
                                                                className="rounded-md"
                                                            />
                                                            <span className="font-medium">{license.pluginName}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="hidden md:table-cell">
                                                        <LicenseKey licenseKey={license.licenseKey} />
                                                    </TableCell>
                                                    <TableCell className="hidden md:table-cell">
                                                        {formatDate(license.purchaseDate)}
                                                    </TableCell>
                                                    <TableCell className="hidden lg:table-cell">
                                                        {formatDate(license.expirationDate)}
                                                    </TableCell>
                                                    <TableCell className="hidden lg:table-cell">
                                                        <span className="text-sm">{license.domain}</span>
                                                    </TableCell>
                                                    <TableCell>{getStatusBadge(license.status)}</TableCell>
                                                    <TableCell className="text-right">
                                                        <Dialog>
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                        <ChevronDown className="h-4 w-4" />
                                                                        <span className="sr-only">Open menu</span>
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DialogTrigger asChild>
                                                                        <DropdownMenuItem>View Details</DropdownMenuItem>
                                                                    </DialogTrigger>
                                                                    {license.status === "expired" && <DropdownMenuItem>Renew License</DropdownMenuItem>}
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
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
                                                                <div className="flex justify-end">
                                                                    {license.status === "expired" && <Button size="sm">Renew License</Button>}
                                                                </div>
                                                            </DialogContent>
                                                        </Dialog>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={7} className="h-24 text-center">
                                                    No licenses found.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="active" className="space-y-4">
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {licenses
                            .filter((license) => license.status === "active")
                            .map((license) => (
                                <Card
                                    key={license.id}
                                    className="overflow-hidden group hover:shadow-lg transition-all duration-300 border-0 shadow-md"
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
                                                    <p className="font-medium text-sm truncate" title={license.domain}>
                                                        {license.domain}
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
                </TabsContent>
            </Tabs>
        </div>
    )
}