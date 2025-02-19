"use client";

import { useState, useEffect } from "react";
import { formatPrice } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { AffiliateForm } from "./affiliate-form";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, MoreHorizontal, Pencil, Trash } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { deleteAffiliate } from "../actions";

interface User {
  id: string;
  name: string | null;
  email: string | null;
}

interface Affiliate {
  id: string;
  userId: string;
  commissionType: 'FIXED' | 'PERCENTAGE';
  commissionValue: number;
  totalEarnings: number;
  referralCode: string;
  user: {
    name: string | null;
    email: string | null;
  };
  _count: {
    referredOrders: number;
  };
  paymentMethod?: {
    id: string;
    type: string;
    details: string;
  } | null;
}

interface AffiliateListProps {
  initialAffiliates: Affiliate[];
  users: User[];
}

export function AffiliateList({ initialAffiliates, users }: AffiliateListProps) {
  const [affiliates, setAffiliates] = useState(initialAffiliates);
  const [selectedAffiliate, setSelectedAffiliate] = useState<Affiliate | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setAffiliates(initialAffiliates);
  }, [initialAffiliates]);

  const handleSuccess = () => {
    setSelectedAffiliate(null);
    setShowEditDialog(false);
    router.refresh();
  };

  const handleDelete = async () => {
    if (!selectedAffiliate) return;

    setIsDeleting(true);
    try {
      const result = await deleteAffiliate(selectedAffiliate.id);
      if (result.success) {
        toast.success("Affiliate deleted successfully");
        setShowDeleteDialog(false);
        setSelectedAffiliate(null);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to delete affiliate");
      }
    } catch (error) {
      toast.error("An error occurred while deleting the affiliate");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Affiliate</TableHead>
            <TableHead>Commission</TableHead>
            <TableHead>Payment Method</TableHead>
            <TableHead>Total Orders</TableHead>
            <TableHead>Total Earnings</TableHead>
            <TableHead>Referral Code</TableHead>
            <TableHead className="w-[70px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {affiliates.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                <div className="flex flex-col items-center justify-center text-sm">
                  <p className="text-muted-foreground">No affiliates found</p>
                  <p className="text-muted-foreground">Create your first affiliate to start managing commissions</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            affiliates.map((affiliate) => (
            <TableRow key={affiliate.id}>
              <TableCell>
                <div>
                  <div className="font-medium">{affiliate.user.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {affiliate.user.email}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                {affiliate.commissionType === "PERCENTAGE"
                  ? `${affiliate.commissionValue}%`
                  : formatPrice(affiliate.commissionValue)}
              </TableCell>
              <TableCell>
                {affiliate.paymentMethod ? (
                  <div className="text-sm">
                    <div className="font-medium">{affiliate.paymentMethod.type}</div>
                    <div className="text-muted-foreground">
                      {affiliate.paymentMethod.details}
                    </div>
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">Not set</span>
                )}
              </TableCell>
              <TableCell>{affiliate._count.referredOrders}</TableCell>
              <TableCell>{formatPrice(affiliate.totalEarnings)}</TableCell>
              <TableCell>
                <code className="text-sm">{affiliate.referralCode}</code>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/admin/affiliates/${affiliate.id}`}>
                        <Eye className="mr-2 h-4 w-4" /> View Details
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                      setSelectedAffiliate(affiliate);
                      setShowEditDialog(true);
                    }}>
                      <Pencil className="mr-2 h-4 w-4" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => {
                        setSelectedAffiliate(affiliate);
                        setShowDeleteDialog(true);
                      }}
                      className="text-destructive"
                    >
                      <Trash className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <AffiliateForm
        open={showEditDialog}
        onClose={() => {
          setShowEditDialog(false);
          setSelectedAffiliate(null);
        }}
        users={users}
        initialData={selectedAffiliate}
        onSuccess={handleSuccess}
      />

      <Dialog open={showDeleteDialog} onOpenChange={(open) => {
        setShowDeleteDialog(open);
        if (!open) {
          setSelectedAffiliate(null);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Affiliate</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this affiliate? This action cannot be undone.
              All related data including payments and commission records will be deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
