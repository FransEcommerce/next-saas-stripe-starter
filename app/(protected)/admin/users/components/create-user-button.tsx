"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CreateUserButton() {
  return (
    <Button
      onClick={() => {
        const event = new CustomEvent("create-user");
        window.dispatchEvent(event);
      }}
    >
      <Plus className="mr-2 h-4 w-4" />
      Add User
    </Button>
  );
}
