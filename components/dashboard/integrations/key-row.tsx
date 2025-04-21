"use client";

import { deleteAPIKey } from "@/actions/api-keys";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { toast } from "sonner";
import {
  Eye,
  MoreVertical,
  Copy,
  List,
  Network,
  RefreshCw,
  Trash2,
  MoreHorizontal,
  AlertCircle,
  Key,
  KeyIcon,
} from "lucide-react";
import ConfirmationDialog from "@/components/ui/data-table/confirmation-dialog";
import { timeAgo } from "@/lib/timeAgo";

interface ApiKey {
  id: string;
  name: string;
  key: string;
  created: string;
}

interface KeyRowProps {
  apiKey: ApiKey;
}

export function KeyRow({ apiKey }: KeyRowProps) {
  const [isKeyDialogOpen, setIsKeyDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  const copyKey = () => {
    const keyValue = apiKey.key;

    navigator.clipboard
      .writeText(keyValue)
      .then(() => {
        toast.success("Key copied to clipboard", {
          description: "You can now paste it wherever you need.",
          style: {
            backgroundColor: "green",
            color: "white",
          },
        });
      })
      .catch((err) => {
        console.error("Failed to copy key: ", err);
        toast.error("Failed to copy key");
      });
  };

  const handleDeleteKey = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteAPIKey(apiKey.id);
      if (result.success) {
        toast.success(`${apiKey.name} deleted successfully`);
      } else {
        toast.error("Failed to delete API key");
      }
    } catch (error) {
      console.error("Error deleting API key:", error);
      toast.error("An error occurred while deleting the API key");
    } finally {
      setIsDeleting(false);
      setIsConfirmDialogOpen(false);
    }
  };

  return (
    <>
      <tr className="border-b border-gray-100">
        <td className="py-4 whitespace-nowrap">
          <span className="flex items-center gap-1 text-muted-foreground">
            {" "}
            <KeyIcon size={20} />
            {apiKey.name}
          </span>
        </td>
        <td className="py-4 flex items-center w-full md:w-[200]">
          <span className="font-mono text-sm truncate">
            sk_live{apiKey.key.replace(/./g, "•")}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsKeyDialogOpen(true)}
            className="ml-2 h-8 w-8 px-2 bg-slate-300"
          >
            <Eye className="h-4 w-4" />
            <span className="sr-only">View API key</span>
          </Button>
        </td>
        <td className="py-4 text-sm text-gray-600">
          {" "}
          {timeAgo(apiKey.created)}
        </td>
        <td className="py-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={copyKey}>
                <Copy className="h-4 w-4 mr-2" />
                Copy key
              </DropdownMenuItem>
              <DropdownMenuItem>
                <List className="h-4 w-4 mr-2" />
                See audit logs
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Network className="h-4 w-4 mr-2" />
                See request logs
              </DropdownMenuItem>
              <DropdownMenuItem>
                <RefreshCw className="h-4 w-4 mr-2" />
                Roll key
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => setIsConfirmDialogOpen(true)}
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete key
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </td>
      </tr>

      <Dialog open={isKeyDialogOpen} onOpenChange={setIsKeyDialogOpen}>
        <DialogContent className="w-[95%] sm:w-[90%] md:max-w-[60%]">
          <DialogHeader>
            <DialogTitle className="flex flex-wrap items-center gap-2 text-base sm:text-lg font-semibold">
              <Key className="h-5 w-5 text-primary" />
              <span className="break-words">{`API Key: ${apiKey.name}`}</span>
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              This is your full API key. Make sure to keep it secure.
            </DialogDescription>
          </DialogHeader>

          <div className="p-4 bg-muted/40 border rounded-lg mt-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="w-full overflow-x-auto">
                <code className="block font-mono text-sm bg-background p-3 rounded border w-full whitespace-nowrap">
                  {apiKey.key}
                </code>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full sm:w-auto hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={copyKey}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Key
              </Button>
            </div>
          </div>

          <div className="mt-4 flex items-start gap-3 p-3 bg-amber-50 text-amber-800 rounded-md border border-amber-200">
            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium mb-1">Security Warning</p>
              <p>
                This key grants full access to your account's API. Do not share
                it with others or expose it in client-side code. If compromised,
                roll the key immediately.
              </p>
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button variant="ghost" onClick={() => setIsKeyDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        open={isConfirmDialogOpen}
        onOpenChange={setIsConfirmDialogOpen}
        title="Delete API Key"
        description={`Are you sure you want to delete the API key "${apiKey.name}"? This action cannot be undone.`}
        onConfirm={handleDeleteKey}
        isConfirming={isDeleting}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="destructive"
      />
    </>
  );
}
