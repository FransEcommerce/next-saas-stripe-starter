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
import { deletePlugin, updatePluginProjectId } from "../actions";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

interface PluginsListProps {
  plugins: Plugin[];
}

export function PluginsList({ plugins }: PluginsListProps) {
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPlugin, setSelectedPlugin] = useState<Plugin | null>(null);

  const [isProjectIdDialogOpen, setIsProjectIdDialogOpen] = useState(false);
  const [editingPlugin, setEditingPlugin] = useState<Plugin | null>(null);
  const [newProjectId, setNewProjectId] = useState("");

  const handleDelete = async () => {
    if (!selectedPlugin) return;

    try {
      const result = await deletePlugin(selectedPlugin.id);
      if (result.success) {
        setIsDeleteDialogOpen(false);
        setSelectedPlugin(null);
        router.refresh();
        toast.success("Plugin deleted successfully");
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    }
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Project ID</TableHead>
            <TableHead>Version</TableHead>
            <TableHead>Chatpion Version</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-[150px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {plugins.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center">
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
                {/* <TableCell>
                  <span className="font-mono">{plugin.project_id || "N/A"}</span>
                </TableCell> */}
                {/* <TableCell>
                  {editingProjectId === plugin.id ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={newProjectId}
                        onChange={(e) => setNewProjectId(e.target.value)}
                        className="w-32 h-8"
                      />
                      <Button
                        size="sm"
                        onClick={async () => {
                          const result = await updatePluginProjectId(plugin.id, newProjectId);
                          if (result.success) {
                            setEditingProjectId(null);
                            router.refresh();
                            toast.success("Project ID updated successfully");
                          } else {
                            toast.error(result.message);
                          }
                        }}
                      >
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingProjectId(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <div
                      className="flex items-center gap-1 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
                      onClick={() => {
                        setEditingProjectId(plugin.id);
                        setNewProjectId(plugin.project_id || "");
                      }}
                    >
                      <span className="font-mono">{plugin.project_id || "N/A"}</span>
                      <Pencil className="h-3 w-3 opacity-50 hover:opacity-100" />
                    </div>
                  )}
                </TableCell> */}
                <TableCell>
                  <div
                    className="flex items-center gap-1 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
                    onClick={() => {
                      setEditingPlugin(plugin);
                      setNewProjectId(plugin.project_id || "");
                      setIsProjectIdDialogOpen(true);
                    }}
                  >
                    <span className="font-mono">{plugin.project_id || "N/A"}</span>
                    <Pencil className="h-3 w-3 opacity-50 hover:opacity-100" />
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

      <AlertDialog
        open={isProjectIdDialogOpen}
        onOpenChange={setIsProjectIdDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Update Project ID</AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-4">
                <p className="text-red-600 font-medium">
                  Warning: Changing the Project ID will affect all versions of this plugin and may invalidate existing licenses. Proceed with caution!
                </p>
                <div className="flex items-center gap-2">
                  <Input
                    value={newProjectId}
                    onChange={(e) => setNewProjectId(e.target.value)}
                    className="w-full"
                    placeholder="Enter 9-digit Project ID (YYMMDDXXX)"
                  />
                </div>
                <p className="text-sm text-gray-600">
                  Format: YYMMDDXXX (e.g. 250224012)
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!editingPlugin) return;

                const result = await updatePluginProjectId(editingPlugin.id, newProjectId);
                if (result.success) {
                  setIsProjectIdDialogOpen(false);
                  router.refresh();
                  toast.success("Project ID updated successfully");
                } else {
                  toast.error(result.message);
                }
              }}
            >
              Confirm Update
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
