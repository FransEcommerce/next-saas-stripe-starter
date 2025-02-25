"use client";

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { UseFormReturn } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { PluginSelector } from "./plugin-selector";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ServicePlansFormProps {
  form: UseFormReturn<any>;
  availablePlans: any[];
  plugins: any[];
}

export function ServicePlansForm({
  form,
  availablePlans,
  plugins
}: ServicePlansFormProps) {
  return (
    <div className="space-y-4">
      <div className="px-6 pt-6">
        <h3 className="text-lg font-medium">Plans Configuration</h3>
        <p className="text-sm text-muted-foreground">
          Configure the pricing and features for your service.
        </p>
      </div>
      <ScrollArea className="h-[calc(100vh-13rem)]">
        <div className="px-6 space-y-4">
          <div className="space-y-6">
            <div className="space-y-4">
              {availablePlans.map((plan, index) => {
                const planEnabled = form.watch(`planLimits.${index}.enabled`);
                const limitType = form.watch(`planLimits.${index}.limitType`);

                return (
                  <div key={plan.id} className="rounded-lg border p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{plan.name}</h3>
                        {plan.isFree && (
                          <p className="text-sm text-muted-foreground">Free Plan</p>
                        )}
                      </div>
                      <Switch
                        checked={planEnabled}
                        onCheckedChange={(checked) => {
                          form.setValue(`planLimits.${index}.enabled`, checked);
                          if (checked) {
                            form.setValue(`planLimits.${index}.limitType`, "UNLIMITED");
                            form.setValue(`planLimits.${index}.limitValue`, null);
                          }
                        }}
                      />
                    </div>

                    {planEnabled && (
                      <div className="space-y-4">
                        <div>
                          <div className="pb-2">
                            <Label>Limit Type</Label>
                          </div>
                          <Select
                            value={limitType}
                            onValueChange={(value: "UNLIMITED" | "DAILY" | "MONTHLY") => {
                              form.setValue(`planLimits.${index}.limitType`, value);
                              if (value === "UNLIMITED") {
                                form.setValue(`planLimits.${index}.limitValue`, null);
                              }
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="UNLIMITED">Unlimited</SelectItem>
                              <SelectItem value="DAILY">Daily</SelectItem>
                              <SelectItem value="MONTHLY">Monthly</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {limitType !== "UNLIMITED" && (
                          <div>
                            <div className="pb-2">
                              <Label>Limit Value</Label>
                            </div>
                            <Input
                              type="number"
                              value={form.watch(`planLimits.${index}.limitValue`) || ""}
                              onChange={(e) => {
                                form.setValue(
                                  `planLimits.${index}.limitValue`,
                                  e.target.value ? parseInt(e.target.value, 10) : null
                                );
                              }}
                              placeholder="Enter limit value"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col pb-6">
              <FormField
                control={form.control}
                name="pluginIds"
                render={({ field }) => (
                  <FormItem>
                    <div className="space-y-0.5">
                      <FormLabel className="text-lg font-medium">Compatible Plugins</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Select which plugin versions this service can work with
                      </div>
                    </div>
                    <FormControl>
                      <PluginSelector
                        plugins={plugins}
                        selectedPlugins={field.value || []}
                        onChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
