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
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { createProduct, updateProduct } from "../actions";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown, FileText } from "lucide-react";

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

// 按插件名称对插件进行分组
function groupPluginsByName(plugins: Plugin[]) {
  return plugins.reduce((groups, plugin) => {
    const parentId = plugin.parentId || plugin.id;
    const isVersion = !!plugin.parentId;

    if (!groups[parentId]) {
      groups[parentId] = {
        main: isVersion ? undefined : plugin,
        versions: isVersion ? [plugin] : []
      };
    } else {
      if (isVersion) {
        groups[parentId].versions.push(plugin);
      } else {
        groups[parentId].main = plugin;
      }
    }

    return groups;
  }, {} as Record<string, { main?: Plugin; versions: Plugin[] }>);
}

export function ProductForm({ plugins, product }: ProductFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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

  // 对插件进行分组和处理
  const pluginGroups = groupPluginsByName(plugins);

  // 处理搜索和过滤
  const filteredGroups = Object.entries(pluginGroups).filter(([_, group]) => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    const mainName = group.main?.name.toLowerCase() || "";
    return mainName.includes(searchLower);
  });

  // 处理版本排序和获取最新版本
  const processedGroups = filteredGroups.map(([parentId, group]) => {
    const allVersions = [...(group.main ? [group.main] : []), ...group.versions];
    const sortedVersions = allVersions.sort((a, b) => b.versionNumber - a.versionNumber);
    const latestVersion = sortedVersions[0];
    
    return [
      parentId,
      {
        ...group,
        main: latestVersion,
        versions: sortedVersions.slice(1)
      }
    ] as const;
  });

  // 渲染版本项
  const renderVersionItem = (version: Plugin, isLatest: boolean = false) => (
    <CommandItem
      key={version.id}
      value={`${version.name}-${version.version}`}
      onSelect={() => {
        form.setValue("pluginId", version.id);
        setOpen(false);
      }}
      className={cn("flex items-center justify-between gap-2", !isLatest && "pl-6")}
    >
      <div className="flex items-center flex-1 min-w-0">
        <Check
          className={cn(
            "mr-2 h-4 w-4 flex-shrink-0",
            form.getValues("pluginId") === version.id
              ? "opacity-100"
              : "opacity-0"
          )}
        />
        <div className="flex flex-col min-w-0">
          <span className="truncate">{version.name}</span>
          <span className="text-sm text-muted-foreground">
            Version {version.version}
            {isLatest && " (Latest)"}
          </span>
        </div>
      </div>
      {version.changelog && (
        <HoverCard openDelay={0} closeDelay={0}>
          <HoverCardTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4 p-0 flex-shrink-0"
              onClick={(e) => e.preventDefault()}
            >
              <FileText className="h-4 w-4" />
            </Button>
          </HoverCardTrigger>
          <HoverCardContent 
            className="w-96 backdrop-blur-md bg-white/80 dark:bg-gray-950/80 border border-gray-200 dark:border-gray-800"
            side="left"
            align="start"
          >
            <div className="space-y-3">
              <div className="space-y-1">
                <h4 className="text-sm font-semibold">Version {version.version} Changelog</h4>
                <p className="text-xs text-muted-foreground">
                  Released on {new Date(version.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="p-3 rounded-md bg-gray-100/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800">
                <p className="text-sm whitespace-pre-wrap leading-relaxed">
                  {version.changelog || "No changelog available"}
                </p>
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>
      )}
    </CommandItem>
  );

  async function onSubmit(values: z.infer<typeof productSchema>) {
    try {
      setIsLoading(true);

      const data = {
        ...values,
        price: parseFloat(values.price),
        comparePrice: values.comparePrice ? parseFloat(values.comparePrice) : undefined,
        duration: values.duration ? parseInt(values.duration) : null, // 确保空值传递为 null
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
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "w-full justify-between",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          <div className="flex items-center gap-1">
                            <span>{plugins.find((plugin) => plugin.id === field.value)?.name}</span>
                            <span className="text-muted-foreground">
                              (v{plugins.find((plugin) => plugin.id === field.value)?.version})
                            </span>
                          </div>
                        ) : (
                          "Select plugin"
                        )}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="p-0" style={{ width: "var(--radix-popover-trigger-width)" }}>
                    <Command>
                      <CommandInput 
                        placeholder="Search plugin..." 
                        value={searchQuery}
                        onValueChange={setSearchQuery}
                        className="border-none focus:ring-0"
                      />
                      <CommandList>
                        <CommandEmpty>No plugin found.</CommandEmpty>
                        {processedGroups.map(([parentId, group]) => (
                          <div key={parentId}>
                            {group.main && (
                              <CommandGroup heading={group.main.name}>
                                {renderVersionItem(group.main, true)}
                                {group.versions.map((version) => renderVersionItem(version))}
                              </CommandGroup>
                            )}
                            {group.main && <CommandSeparator />}
                          </div>
                        ))}
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
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
