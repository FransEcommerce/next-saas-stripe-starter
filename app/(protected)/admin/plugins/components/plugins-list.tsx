"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plugin } from "@prisma/client";
import { formatDistanceToNow } from "date-fns";
import { enUS } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MoreHorizontal, Pencil, Trash, Plus, History } from "lucide-react";
import { deletePlugin } from "../actions";
import { toast } from "sonner";

interface PluginsListProps {
  plugins: Plugin[];
}

export function PluginsList({ plugins }: PluginsListProps) {
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPlugin, setSelectedPlugin] = useState<Plugin | null>(null);

  const handleDelete = async () => {
    if (!selectedPlugin) return;

    try {
      await deletePlugin(selectedPlugin.id);
      setIsDeleteDialogOpen(false);
      setSelectedPlugin(null);
      router.refresh();
      toast.success("Plugin deleted successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete plugin");
    }
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Version</TableHead>
            <TableHead>Chatpion Version</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-[150px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {plugins.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center">
                No plugins found
              </TableCell>
            </TableRow>
          ) : (
            plugins.map((plugin) => (
              <TableRow key={plugin.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{plugin.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {plugin.description || "No description"}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{plugin.version}</span>
                    <span className="text-sm text-muted-foreground">
                      Version #{plugin.versionNumber}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  {plugin.chatpionVersion || "Not specified"}
                </TableCell>
                <TableCell>
                  {formatDistanceToNow(new Date(plugin.createdAt), {
                    addSuffix: true,
                    locale: enUS,
                  })}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[160px]">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/plugins/${plugin.id}/edit`} className="cursor-pointer">
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/plugins/${plugin.id}/versions/new`} className="cursor-pointer">
                          <Plus className="mr-2 h-4 w-4" />
                          New Version
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/plugins/${plugin.id}/versions`} className="cursor-pointer">
                          <History className="mr-2 h-4 w-4" />
                          Version History
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600 focus:text-red-600 focus:bg-red-50"
                        onClick={() => {
                          setSelectedPlugin(plugin);
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Plugin</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete plugin "{selectedPlugin?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
