'use client';

import { Button } from "@/components/ui/button";
import { Plan, User } from "@prisma/client";
import { PlusCircle } from "lucide-react";
import { SubscriptionDialog } from "./subscription-dialog";

interface CreateSubscriptionButtonProps {
  users: User[];
  plans: Plan[];
}

export function CreateSubscriptionButton({ users, plans }: CreateSubscriptionButtonProps) {
  return (
    <SubscriptionDialog users={users} plans={plans} subscription={undefined}>
      <Button>
        <PlusCircle className="h-4 w-4 mr-2" />
        Create Subscription
      </Button>
    </SubscriptionDialog>
  );
}
