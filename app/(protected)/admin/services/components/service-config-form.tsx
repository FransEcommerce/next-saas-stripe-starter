"use client";

import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";

interface ServiceConfigFormProps {
  form: UseFormReturn<any>;
  selectedHandler: any;
}

export function ServiceConfigForm({ form, selectedHandler }: ServiceConfigFormProps) {
  const configFields = selectedHandler?.configSchema?.fields || [];

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-lg font-semibold mb-6">Handler Configuration</h2>
      
      {configFields.length > 0 ? (
        <div className="space-y-4">
          {configFields.map((field: any) => (
            <FormField
              key={field.name}
              control={form.control}
              name={`config.${field.name}`}
              render={({ field: formField }) => (
                <FormItem>
                  <FormLabel>{field.label}</FormLabel>
                  <FormControl>
                    <Input
                      {...formField}
                      type={field.type === "number" ? "number" : "text"}
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                    />
                  </FormControl>
                  {field.description && (
                    <FormDescription>{field.description}</FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-2">
            <p className="text-muted-foreground text-lg">
              No configuration options available
            </p>
            <p className="text-muted-foreground text-sm">
              This handler doesn't require any additional configuration
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
