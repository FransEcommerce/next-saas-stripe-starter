'use client';

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import { getStatusColor, getStatusLabel } from "@/lib/utils/subscription";
import { Plan, Subscription, User } from "@prisma/client";
import { MoreHorizontal, Pencil, Trash } from "lucide-react";
import { SubscriptionDialog } from "./subscription-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { deleteSubscription } from "../actions";
import { toast } from "sonner";

type SubscriptionWithUser = Subscription & {
  user: {
    id: string;
    name: string | null;
    email: string | null;
  };
  plan: Plan;
};

interface SubscriptionListProps {
  subscriptions: SubscriptionWithUser[];
  users: User[];
  plans: Plan[];
}

export function SubscriptionList({ subscriptions, users, plans }: SubscriptionListProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [subscriptionToDelete, setSubscriptionToDelete] = useState<string | null>(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<SubscriptionWithUser | undefined>(undefined);

  const handleDelete = async () => {
    if (subscriptionToDelete) {
      try {
        await deleteSubscription(subscriptionToDelete);
        toast.success("Subscription deleted successfully");
        setDeleteDialogOpen(false);
        setSubscriptionToDelete(null);
      } catch (error) {
        toast.error("Failed to delete subscription");
        console.error(error);
      }
    }
  };

  const handleEditSubscription = (subscription: SubscriptionWithUser) => {
    setSelectedSubscription(subscription);
    setOpenEditDialog(true);
  };

  if (subscriptions.length === 0) {
    return (
      <div className="text-center py-10">
        <h3 className="text-lg font-medium">No subscriptions found</h3>
        <p className="text-sm text-gray-500 mt-2">
          Get started by creating a new subscription.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Trial Period</TableHead>
              <TableHead className="w-[70px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subscriptions.map((subscription) => (
              <TableRow key={subscription.id}>
                <TableCell>{subscription.user.email}</TableCell>
                <TableCell>{subscription.plan.name}</TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      getStatusColor(subscription.status).background
                    } ${getStatusColor(subscription.status).text}`}
                  >
                    {getStatusLabel(subscription.status)}
                  </span>
                </TableCell>
                <TableCell>{formatDate(subscription.startDate.toISOString())}</TableCell>
                <TableCell>
                  {subscription.endDate
                    ? formatDate(subscription.endDate.toISOString())
                    : "-"}
                </TableCell>
                <TableCell>
                  {Number(subscription.priceAmount)} {subscription.currency}
                </TableCell>
                <TableCell>
                  {subscription.trialStartDate && subscription.trialEndDate
                    ? `${formatDate(subscription.trialStartDate.toISOString())} - ${formatDate(subscription.trialEndDate.toISOString())}`
                    : "-"}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleEditSubscription(subscription)}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        <span>Edit</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onSelect={() => {
                          setSubscriptionToDelete(subscription.id);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              subscription and remove the data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <SubscriptionDialog
        subscription={selectedSubscription}
        users={users}
        plans={plans}
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)} children={undefined}      />
    </div>
  );
}
