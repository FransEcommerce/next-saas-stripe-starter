"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { format } from "date-fns";
import { Coupon } from "@prisma/client";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash } from "lucide-react";
import { deleteCoupon } from "../actions";
import { toast } from "sonner";

interface CouponListProps {
  coupons: Coupon[];
}

export function CouponList({ coupons = [] }: CouponListProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCouponId, setSelectedCouponId] = useState<string | null>(null);

  const handleEdit = (id: string) => {
    router.push(`/admin/coupons/${id}`);
  };

  const handleDelete = async (id: string) => {
    try {
      setIsDeleting(true);
      const result = await deleteCoupon(id);

      if (!result.success) {
        throw new Error(result.error || "Failed to delete coupon");
      }

      toast.success("Coupon deleted successfully");
      router.refresh();
    } catch (error) {
      console.error("Error deleting coupon:", error);
      toast.error("Failed to delete coupon");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Code</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Value</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Usage</TableHead>
          <TableHead>Valid Period</TableHead>
          <TableHead>Created At</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {coupons.length === 0 ? (
          <TableRow>
            <TableCell colSpan={8} className="text-center">
              No coupons found
            </TableCell>
          </TableRow>
        ) : (
          coupons.map((coupon) => (
            <TableRow key={coupon.id}>
              <TableCell className="font-medium">{coupon.code}</TableCell>
              <TableCell>
                <Badge variant="outline">
                  {coupon.type === "FIXED" ? "Fixed Amount" : "Percentage"}
                </Badge>
              </TableCell>
              <TableCell>
                {coupon.type === "FIXED"
                  ? `$${coupon.value}`
                  : `${coupon.value}%`}
              </TableCell>
              <TableCell>
                <Badge
                  variant={coupon.active ? "default" : "destructive"}
                >
                  {coupon.active ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              <TableCell>
                {coupon.usedCount}
                {coupon.maxUses ? `/${coupon.maxUses}` : ""}
              </TableCell>
              <TableCell>
                {coupon.startDate && coupon.endDate
                  ? `${format(new Date(coupon.startDate), "MM/dd/yyyy")} - ${format(
                      new Date(coupon.endDate),
                      "MM/dd/yyyy"
                    )}`
                  : "No limit"}
              </TableCell>
              <TableCell>
                {format(new Date(coupon.createdAt), "MM/dd/yyyy")}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[160px]">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleEdit(coupon.id)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-600 focus:text-red-600 focus:bg-red-50"
                      onClick={() => {
                        setSelectedCouponId(coupon.id);
                        setIsDeleteDialogOpen(true);
                      }}
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <AlertDialog open={isDeleteDialogOpen && selectedCouponId === coupon.id}>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Coupon</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this coupon? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => {
                          handleDelete(selectedCouponId!);
                          setIsDeleteDialogOpen(false);
                        }}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}