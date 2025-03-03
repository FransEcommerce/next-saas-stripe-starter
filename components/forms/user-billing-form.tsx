"use client";

import * as React from "react"
import { useState, useTransition } from "react";
import { updateUserBilling } from '@/actions/update-user-billing';
import type { BillingFormData } from '@/lib/validations/billing';
import { zodResolver } from "@hookform/resolvers/zod";
import { User } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { billingInfoSchema } from "@/lib/validations/billing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SectionColumns } from "@/components/dashboard/section-columns";
import { Icons } from "@/components/shared/icons";

interface UserBillingFormProps {
  user: Pick<User, "id" | "billingCompany" | "billingName" | "billingAddress" | "billingCity" | "billingState" | "billingCountry" | "billingZip" | "billingPhone">;
}

export function UserBillingForm({ user }: UserBillingFormProps) {
  const { update } = useSession();
  const [updated, setUpdated] = useState(false);
  const [isPending, startTransition] = useTransition();
  const updateUserBillingWithId = updateUserBilling.bind(null, user.id);

  const checkUpdate = (formData: BillingFormData) => {
    const hasChanges = Object.keys(formData).some(
      (key) => formData[key] !== user[key]
    );
    setUpdated(hasChanges);
  };

  const {
    handleSubmit,
    register,
    watch,
    formState: { errors },
  } = useForm<BillingFormData>({
    resolver: zodResolver(billingInfoSchema),
    defaultValues: {
      billingCompany: user?.billingCompany || "",
      billingName: user?.billingName || "",
      billingAddress: user?.billingAddress || "",
      billingCity: user?.billingCity || "",
      billingState: user?.billingState || "",
      billingCountry: user?.billingCountry || "",
      billingZip: user?.billingZip || "",
      billingPhone: user?.billingPhone || "",
    },
  });

  const formData = watch();

  React.useEffect(() => {
    checkUpdate(formData);
  }, [formData]);

  const onSubmit = handleSubmit((data) => {
    startTransition(async () => {
      const { status } = await updateUserBillingWithId(data);

      if (status !== "success") {
        toast.error("Something went wrong.", {
          description: "Your billing information was not updated. Please try again.",
        });
      } else {
        await update();
        setUpdated(false);
        toast.success("Your billing information has been updated.");
      }
    });
  });

  return (
    <form onSubmit={onSubmit}>
      <SectionColumns
        title="Billing Information"
        description="Please enter your billing information for invoices and receipts."
      >
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="billingCompany">Company Name</Label>
            <Input
              id="billingCompany"
              {...register("billingCompany")}
            />
            {errors?.billingCompany && (
              <p className="text-[13px] text-red-600">{errors.billingCompany.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="billingName">Contact Name</Label>
            <Input
              id="billingName"
              {...register("billingName")}
            />
            {errors?.billingName && (
              <p className="text-[13px] text-red-600">{errors.billingName.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="billingAddress">Address</Label>
            <Input
              id="billingAddress"
              {...register("billingAddress")}
            />
            {errors?.billingAddress && (
              <p className="text-[13px] text-red-600">{errors.billingAddress.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="billingCity">City</Label>
              <Input
                id="billingCity"
                {...register("billingCity")}
              />
              {errors?.billingCity && (
                <p className="text-[13px] text-red-600">{errors.billingCity.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="billingState">State/Province</Label>
              <Input
                id="billingState"
                {...register("billingState")}
              />
              {errors?.billingState && (
                <p className="text-[13px] text-red-600">{errors.billingState.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="billingCountry">Country</Label>
              <Input
                id="billingCountry"
                {...register("billingCountry")}
              />
              {errors?.billingCountry && (
                <p className="text-[13px] text-red-600">{errors.billingCountry.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="billingZip">ZIP/Postal Code</Label>
              <Input
                id="billingZip"
                {...register("billingZip")}
              />
              {errors?.billingZip && (
                <p className="text-[13px] text-red-600">{errors.billingZip.message}</p>
              )}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="billingPhone">Phone Number</Label>
            <Input
              id="billingPhone"
              {...register("billingPhone")}
            />
            {errors?.billingPhone && (
              <p className="text-[13px] text-red-600">{errors.billingPhone.message}</p>
            )}
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              variant={updated ? "default" : "disable"}
              disabled={isPending || !updated}
              className="w-[130px]"
            >
              {isPending ? (
                <Icons.spinner className="size-4 animate-spin" />
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </div>
      </SectionColumns>
    </form>
  );
}