"use client";

import * as React from "react"
import { useState, useTransition, useEffect } from "react";
import { updateUserBilling } from '@/actions/update-user-billing';
import type { BillingFormData } from '@/lib/validations/billing';
import { zodResolver } from "@hookform/resolvers/zod";
import { User } from "@prisma/client";
import { useSessionAdapter } from "@/lib/auth-client";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { billingInfoSchema } from "@/lib/validations/billing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SectionColumns } from "@/components/dashboard/section-columns";
import { Icons } from "@/components/shared/icons";
import { Country, CountryDropdown } from "@/components/ui/country-dropdown";
import { PhoneInput } from "@/components/ui/phone-input";
import { StateProvinceSelect } from "@/components/ui/state-province-select";
import { CitySelect } from "@/components/ui/city-select";

interface UserBillingFormProps {
  user: Pick<User, "id" | "billingCompany" | "billingName" | "billingAddress" | "billingCity" | "billingState" | "billingCountry" | "billingZip" | "billingPhone">;
}

export function UserBillingForm({ user }: UserBillingFormProps) {
  const { update } = useSessionAdapter();
  const [updated, setUpdated] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
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
    setValue,
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

  // 初始化 selectedCountry
  useEffect(() => {
    if (formData.billingCountry && !selectedCountry) {
      import("country-data-list").then(({ countries }) => {
        const country = countries.all.find(
          (c) => c.alpha3 === formData.billingCountry || c.name === formData.billingCountry
        );
        if (country) {
          setSelectedCountry(country as Country);
        }
      });
    }
  }, [formData.billingCountry]);

  // 处理州/省的初始化和更新
  useEffect(() => {
    if (selectedCountry?.alpha2 && formData.billingState) {
      import("country-state-city").then(({ State }) => {
        const states = State.getStatesOfCountry(selectedCountry.alpha2);
        const stateByCode = states.find(s => s.isoCode === formData.billingState);
        const stateByName = states.find(s => s.name === formData.billingState);
        
        if (!stateByCode && stateByName && formData.billingState !== stateByName.name) {
          setValue("billingState", stateByName.name, { shouldDirty: true });
        }
      });
    }
  }, [selectedCountry?.alpha2, formData.billingState]);

  // 处理城市的初始化和更新
  useEffect(() => {
    if (selectedCountry?.alpha2 && formData.billingState && formData.billingCity) {
      import("country-state-city").then(({ State, City }) => {
        const states = State.getStatesOfCountry(selectedCountry.alpha2);
        const stateObj = states.find(s => s.isoCode === formData.billingState || s.name === formData.billingState);
        
        if (stateObj) {
          const cities = City.getCitiesOfState(selectedCountry.alpha2, stateObj.isoCode);
          const cityByName = cities.find(c => c.name === formData.billingCity);
          
          if (cityByName && formData.billingCity !== cityByName.name) {
            setValue("billingCity", cityByName.name, { shouldDirty: true });
          }
        }
      });
    }
  }, [selectedCountry?.alpha2, formData.billingState]);

  useEffect(() => {
    checkUpdate(formData);
  }, [formData, user]);

  const onSubmit = handleSubmit((data) => {
    startTransition(async () => {
      // 在提交前转换数据
      const submissionData = { ...data };
      
      // 转换国家代码为名称
      if (selectedCountry) {
        submissionData.billingCountry = selectedCountry.name;
      }

      // 转换州/省代码为名称
      if (selectedCountry?.alpha2 && data.billingState) {
        const stateObj = await import("country-state-city").then(({ State }) => {
          const states = State.getStatesOfCountry(selectedCountry.alpha2);
          return states.find(s => s.isoCode === data.billingState || s.name === data.billingState);
        });
        if (stateObj) {
          submissionData.billingState = stateObj.name;
        }
      }

      const { status } = await updateUserBillingWithId(submissionData);

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

          <div className="grid gap-2">
            <Label htmlFor="billingCountry">Country</Label>
            <CountryDropdown
              placeholder="Select country"
              defaultValue={formData.billingCountry}
              onChange={(country) => {
                setValue("billingCountry", country.alpha3);
                setSelectedCountry(country);
              }}
            />
            {errors?.billingCountry && (
              <p className="text-[13px] text-red-600">{errors.billingCountry.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <StateProvinceSelect
              countryCode={selectedCountry?.alpha2}
              value={formData.billingState || ""}
              onChange={(value) => setValue("billingState", value)}
              label="State/Province"
            />
            <CitySelect
              countryCode={selectedCountry?.alpha2}
              stateCode={formData.billingState || ""}
              value={formData.billingCity || ""}
              onChange={(value) => setValue("billingCity", value)}
              label="City"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
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

            <div className="grid gap-2">
              <Label htmlFor="billingPhone">Phone Number</Label>
              <PhoneInput
                value={formData.billingPhone}
                onChange={(value) => setValue("billingPhone", value)}
                defaultCountry={selectedCountry?.alpha2}
              />
              {errors?.billingPhone && (
                <p className="text-[13px] text-red-600">{errors.billingPhone.message}</p>
              )}
            </div>
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