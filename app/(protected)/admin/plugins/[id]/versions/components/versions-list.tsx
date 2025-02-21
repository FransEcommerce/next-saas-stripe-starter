"use client";

import Link from "next/link";
import { Plugin } from "@prisma/client";
import { formatDistanceToNow } from "date-fns";
import { enUS } from "date-fns/locale";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { deletePluginVersion } from "../../../actions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface VersionsListProps {
  versions: Plugin[];
}

export function VersionsList({ versions }: VersionsListProps) {
  const router = useRouter();
  const [selectedVersion, setSelectedVersion] = useState<Plugin | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleDelete = async () => {
    if (!selectedVersion) return;

    try {
      const result = await deletePluginVersion(selectedVersion.id);
      if (result.success) {
        setIsDeleteDialogOpen(false);
        setSelectedVersion(null);
        router.refresh();
        toast.success("Version deleted successfully");
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
            <TableHead>Version</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Chatpion Version</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-[150px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {versions.map((version) => (
            <TableRow key={version.id}>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">{version.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {version.description || "No description"}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">{version.version}</span>
                  <span className="text-sm text-muted-foreground">
                    Version #{version.versionNumber}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                {version.isLatest ? (
                  <Badge>Latest</Badge>
                ) : (
                  <Badge variant="secondary">Previous</Badge>
                )}
              </TableCell>
              <TableCell>
                {version.chatpionVersion || "Not specified"}
              </TableCell>
              <TableCell>
                {formatDistanceToNow(new Date(version.createdAt), {
                  addSuffix: true,
                  locale: enUS,
                })}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                  >
                    <Link href={`/admin/plugins/${version.id}/edit?returnTo=/admin/plugins/${version.parentId || version.id}/versions`}>
                      <Pencil className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedVersion(version);
                      setIsDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Version</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete version {selectedVersion?.version}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
