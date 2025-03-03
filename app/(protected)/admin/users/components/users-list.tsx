"use client";

import { useState, useEffect } from "react";
import { formatDate } from "@/lib/utils";
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
import { UserDialog } from "./user-dialog";
import { createUser, updateUser, deleteUser, getUserRelatedDataCount } from "../actions";

interface User {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  createdAt: Date;
  orders: { id: string }[];
  licenses: { id: string; status: string }[];
  affiliate?: {
    id: string;
    totalEarnings: number;
  } | null;
  billingCompany?: string | null;
  billingName?: string | null;
  billingAddress?: string | null;
  billingCity?: string | null;
  billingState?: string | null;
  billingCountry?: string | null;
  billingZip?: string | null;
  billingPhone?: string | null;
}

interface UsersListProps {
  users: User[];
}

export function UsersList({ users }: UsersListProps) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [relatedData, setRelatedData] = useState<{
    subscriptionsCount: number;
    serviceUsageCount: number;
    ordersCount: number;
    licensesCount: number;
    downloadTokensCount: number;
    affiliateData: {
      id: string;
      totalEarnings: number;
      referredOrdersCount: number;
      paymentsCount: number;
    } | null;
  } | null>(null);

  useEffect(() => {
    if (selectedUser) {
      getUserRelatedDataCount(selectedUser.id).then(setRelatedData).catch(() => setRelatedData(null));
    } else {
      setRelatedData(null);
    }
  }, [selectedUser]);

  useEffect(() => {
    const handleCreateUser = () => {
      setEditingUser(null);
      setShowUserDialog(true);
    };

    window.addEventListener("create-user", handleCreateUser);
    return () => window.removeEventListener("create-user", handleCreateUser);
  }, []);

  const handleDelete = async () => {
    if (!selectedUser) return;

    setIsDeleting(true);
    try {
      await deleteUser(selectedUser.id);
      toast.success("User deleted successfully");
      setShowDeleteDialog(false);
      setSelectedUser(null);
    } catch (error) {
      toast.error("An error occurred while deleting the user");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setShowUserDialog(true);
  };

  const handleCreateOrUpdateUser = async (data: any) => {
    try {
      if (editingUser) {
        await updateUser(editingUser.id, {
          ...data,
          role: data.role || editingUser.role,
        });
        toast.success("User updated successfully");
      } else {
        await createUser({
          ...data,
          role: data.role || "USER",
        });
        toast.success("User created successfully");
      }
      setShowUserDialog(false);
      setEditingUser(null);
    } catch (error) {
      console.error("Error:", error);
      toast.error(editingUser ? "Failed to update user" : "Failed to create user");
    }
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Orders</TableHead>
              <TableHead>Licenses</TableHead>
              <TableHead>Affiliate Status</TableHead>
              <TableHead>Join Date</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center text-sm">
                    <p className="text-muted-foreground">No users found</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{user.name || "-"}</div>
                      <div className="text-sm text-muted-foreground">
                        {user.email || "-"}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.orders.length}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <div className="text-sm font-medium">{user.licenses.length} total</div>
                      {user.licenses.length > 0 && (
                        <div className="flex gap-1">
                          {Object.entries(
                            user.licenses.reduce((acc, license) => {
                              acc[license.status] = (acc[license.status] || 0) + 1;
                              return acc;
                            }, {} as Record<string, number>)
                          ).map(([status, count]) => (
                            <Badge key={status} variant="outline" className="text-xs">
                              {status}: {count}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.affiliate ? (
                      <div className="text-sm">
                        <Badge variant="default">Active</Badge>
                      </div>
                    ) : (
                      <Badge variant="outline">Not Affiliated</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {formatDate(user.createdAt.getTime())}
                    </div>
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
                        <DropdownMenuItem
                          onClick={() => handleEditUser(user)}
                        >
                          <Pencil className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedUser(user);
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
      </div>

      <Dialog open={showDeleteDialog} onOpenChange={(open) => {
        setShowDeleteDialog(open);
        if (!open) {
          setSelectedUser(null);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
              {relatedData && (
                <div className="mt-4 space-y-2">
                  <div>This will also delete:</div>
                  <ul className="list-disc pl-5">
                    <li>{relatedData.ordersCount} orders</li>
                    <li>{relatedData.licensesCount} licenses</li>
                    <li>{relatedData.downloadTokensCount} download tokens</li>
                    <li>{relatedData.serviceUsageCount} service usage records</li>
                    <li>{relatedData.subscriptionsCount} subscriptions</li>
                    {relatedData.affiliateData && (
                      <>
                        <li>Affiliate account with ${relatedData.affiliateData.totalEarnings.toFixed(2)} earnings</li>
                        <li>{relatedData.affiliateData.referredOrdersCount} referred orders</li>
                        <li>{relatedData.affiliateData.paymentsCount} affiliate payments</li>
                      </>
                    )}
                  </ul>
                </div>
              )}
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

      <UserDialog
        key={editingUser?.id || "create"}
        open={showUserDialog}
        onOpenChange={(open) => {
          if (!open) {
            setEditingUser(null);
          }
          setShowUserDialog(open);
        }}
        initialData={editingUser ? {
          name: editingUser.name || undefined,
          email: editingUser.email || undefined,
          role: editingUser.role as "ADMIN" | "USER",
          billingCompany: editingUser.billingCompany || undefined,
          billingName: editingUser.billingName || undefined,
          billingAddress: editingUser.billingAddress || undefined,
          billingCity: editingUser.billingCity || undefined,
          billingState: editingUser.billingState || undefined,
          billingCountry: editingUser.billingCountry || undefined,
          billingZip: editingUser.billingZip || undefined,
          billingPhone: editingUser.billingPhone || undefined,
        } : undefined}
        onSubmit={handleCreateOrUpdateUser}
        mode={editingUser ? "edit" : "create"}
      />
    </>
  );
}
