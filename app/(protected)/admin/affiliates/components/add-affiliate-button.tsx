"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { AffiliateForm } from "./affiliate-form";
import { User } from "@prisma/client";
import { useRouter } from "next/navigation";

interface AddAffiliateButtonProps {
  users: User[];
}

export function AddAffiliateButton({ users }: AddAffiliateButtonProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleSuccess = () => {
    setOpen(false);
    router.refresh();
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Add Affiliate
      </Button>

      <AffiliateForm 
        open={open}
        onClose={() => setOpen(false)}
        users={users}
        onSuccess={handleSuccess}
        key={open ? 'open' : 'closed'} 
      />
    </>
  );
}
