"use client";

import { useState } from "react";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Pencil } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LicenseDialog } from "./license-dialog";
import { updateLicense } from "../actions";
import { LicenseStatus } from "@prisma/client";
import { Copy, Eye, EyeOff } from "lucide-react";

interface License {
  id: string;
  licenseKey: string;
  domain: string | null;
  status: LicenseStatus;
  expiresAt: string | null;
  activatedAt: string | null;
  createdAt: string;
  updatedAt: string;
  plugin: {
    id: string;
    name: string;
    version: string;
  };
  user: {
    id: string;
    name: string | null;
    email: string | null;
  };
  order: {
    id: string;
    orderNumber: string;
    status: string;
    amount: number;
  } | null;
}

interface LicensesListProps {
  licenses: License[];
}

export function LicensesList({ licenses }: LicensesListProps) {
  const [editingLicense, setEditingLicense] = useState<License | null>(null);
  const [showLicenseDialog, setShowLicenseDialog] = useState(false);
  const [visibleLicenseKeys, setVisibleLicenseKeys] = useState<Record<string, boolean>>({});

  const toggleLicenseKeyVisibility = (licenseId: string) => {
    setVisibleLicenseKeys(prev => ({
      ...prev,
      [licenseId]: !prev[licenseId]
    }));
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard");
    } catch (err) {
      toast.error("Failed to copy");
    }
  };

  const formatLicenseKey = (key: string, visible: boolean) => {
    if (visible) return key;
    return "•••••••••••••••••••••";
  };

  const handleEditLicense = (license: License) => {
    setEditingLicense(license);
    setShowLicenseDialog(true);
  };

  const handleUpdateLicense = async (data: any) => {
    if (!editingLicense) return;

    try {
      await updateLicense(editingLicense.id, data);
      toast.success("License updated successfully");
      setShowLicenseDialog(false);
      setEditingLicense(null);
    } catch (error) {
      toast.error("Failed to update license");
    }
  };

  const getStatusStyles = (status: LicenseStatus) => {
    const baseStyles = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium";
    switch (status) {
      case "ACTIVE":
        return cn(baseStyles, "bg-green-50 text-green-700");
      case "PENDING":
        return cn(baseStyles, "bg-yellow-50 text-yellow-700");
      case "EXPIRED":
        return cn(baseStyles, "bg-red-50 text-red-700");
      case "REVOKED":
        return cn(baseStyles, "bg-red-50 text-red-700");
      default:
        return cn(baseStyles, "bg-gray-50 text-gray-700");
    }
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>License Key</TableHead>
              <TableHead>Plugin</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Domain</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Expires At</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {licenses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center text-sm">
                    <p className="text-muted-foreground">No licenses found</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              licenses.map((license) => (
                <TableRow key={license.id}>
                  <TableCell>
                    <div className="flex items-center">
                      <div className="font-medium text-xs bg-gray-100 px-1 py-1 rounded">
                        {formatLicenseKey(license.licenseKey, visibleLicenseKeys[license.id] || false)}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => toggleLicenseKeyVisibility(license.id)}
                      >
                        {visibleLicenseKeys[license.id] ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => copyToClipboard(license.licenseKey)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    {license.order && (
                      <div className="text-sm text-muted-foreground">
                        Order: #{license.order.orderNumber}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{license.plugin.name}</div>
                    <div className="text-sm text-muted-foreground">
                      v{license.plugin.version}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{license.user.name || "-"}</div>
                    <div className="text-sm text-muted-foreground">
                      {license.user.email || "-"}
                    </div>
                  </TableCell>
                  <TableCell>{license.domain || "-"}</TableCell>
                  <TableCell>
                    <span className={getStatusStyles(license.status)}>
                      {license.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    {license.expiresAt ? new Date(license.expiresAt).toLocaleDateString() : "Never"}
                  </TableCell>
                  <TableCell>{new Date(license.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleEditLicense(license)}
                        >
                          <Pencil className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <LicenseDialog
        key={editingLicense?.id || "edit"}
        open={showLicenseDialog}
        onOpenChange={(open) => {
          if (!open) {
            setEditingLicense(null);
          }
          setShowLicenseDialog(open);
        }}
        initialData={
          editingLicense
            ? {
                domain: editingLicense.domain,
                status: editingLicense.status,
                expiresAt: editingLicense.expiresAt,
              }
            : undefined
        }
        onSubmit={handleUpdateLicense}
      />
    </>
  );
}
