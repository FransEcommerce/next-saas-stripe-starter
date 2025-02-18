"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plugin, Product } from "@prisma/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { createProduct, updateProduct } from "../actions";

const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  price: z.string().min(1, "Price is required"),
  comparePrice: z.string().optional(),
  active: z.boolean().default(true),
  duration: z.string().optional(),
  pluginId: z.string().min(1, "Plugin is required"),
  features: z.string().optional(),
});

interface ProductFormProps {
  plugins: Plugin[];
  product?: Product;
}

export function ProductForm({ plugins, product }: ProductFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name ?? "",
      description: product?.description ?? "",
      price: product?.price.toString() ?? "",
      comparePrice: product?.comparePrice?.toString() ?? "",
      active: product?.active ?? true,
      duration: product?.duration?.toString() ?? "",
      pluginId: product?.pluginId ?? "",
      features: product?.features ? JSON.stringify(product.features, null, 2) : "",
    },
  });

  async function onSubmit(values: z.infer<typeof productSchema>) {
    try {
      setIsLoading(true);

      const data = {
        ...values,
        price: parseFloat(values.price),
        comparePrice: values.comparePrice ? parseFloat(values.comparePrice) : undefined,
        duration: values.duration ? parseInt(values.duration) : undefined,
        features: values.features ? JSON.parse(values.features) : {},
      };

      const result = product
        ? await updateProduct(product.id, data)
        : await createProduct(data);

      if (result.success) {
        router.push("/admin/products");
        router.refresh();
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">
            {product ? "Edit Product" : "New Product"}
          </h2>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              "Saving..."
            ) : product ? (
              "Update Product"
            ) : (
              "Create Product"
            )}
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Product name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="pluginId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Plugin</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a plugin" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {plugins.map((plugin) => (
                      <SelectItem key={plugin.id} value={plugin.id}>
                        {plugin.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Product description"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="99.99"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="comparePrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Compare Price</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="149.99"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Original price for showing discount
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duration (days)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="365"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Leave empty for lifetime license
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="active"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Active</FormLabel>
                <FormControl>
                  <div className="flex items-center space-x-2 h-10">
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </div>
                </FormControl>
                    <span className="text-sm text-muted-foreground">
                      Product will be visible in store
                    </span>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="features"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Features (JSON)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="{\n  &quot;feature1&quot;: &quot;value1&quot;,\n  &quot;feature2&quot;: &quot;value2&quot;\n}"
                    className="font-mono"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Enter features as JSON object
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </form>
    </Form>
  );
}
