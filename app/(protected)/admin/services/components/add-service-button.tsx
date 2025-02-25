"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ServiceDialog } from "./service-dialog";
import { useState } from "react";

interface AddServiceButtonProps {
  availableServices: any[];
  availablePlans: any[];
  plugins: any[];
}

export function AddServiceButton({
  availableServices,
  availablePlans,
  plugins
}: AddServiceButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" /> Add Service
      </Button>

      <ServiceDialog
        open={open}
        onOpenChange={setOpen}
        service={null}
        availableServices={availableServices}
        availablePlans={availablePlans}
        plugins={plugins}
      />
    </>
  );
}
