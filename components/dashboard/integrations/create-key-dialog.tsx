"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createAPIKey } from "@/actions/api-keys";
import { toast } from "sonner";

export type ApiKeyFormProps = {
  name: string;
};

export function CreateKeyDialog() {
  const [keyName, setKeyName] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!keyName.trim()) return;
    const data: ApiKeyFormProps = { name: keyName };
    try {
      setLoading(true);
      const res = await createAPIKey(data);
      if (res?.success) {
        toast.success("Key created successfully", {
          action: {
            label: "Copy",
            onClick: () => {
              navigator.clipboard.writeText(res?.data?.key ?? "");
            },
          },
          style: {
            background: "green",
            color: "#fff",
          },
        });
        setKeyName("");
        setLoading(false);
        setOpen(false);
      } else
        toast.error(res?.error, {
          description: "Please try again later.",
          style: {
            background: "#EF4444",
            color: "#fff",
          },
        });
      setLoading(false);
    } catch (error) {
      console.error("Error creating API key:", error);
      setLoading(false);
      toast.error("Failed to create API key", {
        description: "Please try again later.",
        style: {
          background: "#EF4444",
          color: "#fff",
        },
      });
      return;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-1">
          <Plus className="h-4 w-4" />
          Create New Key
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[90%] sm:max-w-md md:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create a new key</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="key-name">Name</Label>
            <p className="text-sm text-muted-foreground mb-2">
              Select a name to identify the key in the dashboard.
            </p>
            <Input
              id="key-name"
              value={keyName}
              onChange={(e) => setKeyName(e.target.value)}
              placeholder="Enter key name"
              className="w-full"
              required
            />
          </div>
          <div className="flex justify-start">
            <Button
              type="submit"
              disabled={!keyName.trim() || loading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="animate-spin" /> Creating...
                </span>
              ) : (
                "Create Key"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
