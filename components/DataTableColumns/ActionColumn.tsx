"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import { deleteUser } from "@/actions/users";
import { deleteUnit } from "@/actions/unit";
import { deleteBrand } from "@/actions/brands";
import { deleteTax } from "@/actions/taxes";
import { deleteItem } from "@/actions/item";
import { deleteCategory } from "@/actions/categories";

type ActionColumnProps = {
  row: any;
  model: any;
  editEndpoint: string;
  id: string | undefined;
  // revPath: string;
};
export default function ActionColumn({
  row,
  model,
  editEndpoint,
  id = "",
}: ActionColumnProps) {
  const [deleting, setDeleting] = React.useState(false);
  const isActive = row.isActive;

  async function handleDelete() {
    try {
      setDeleting(true);
      if (model === "unit") {
        const res = await deleteUnit(id);
        if (res?.status === 200) {
          window.location.reload();
        }
        toast.success(`${model} Deleted Successfully`);
      } else if (model === "user") {
        const res = await deleteUser(id);
        if (res?.ok) {
          window.location.reload();
        }
        toast.success(`${model} Deleted Successfully`);
      } else if (model === "brand") {
        const res = await deleteBrand(id);
        if (res?.status === 200) {
          window.location.reload();
        }
        toast.success(`${res?.message}`);
      } else if (model === "tax") {
        const res = await deleteTax(id);
        if (res?.status === 200) {
          window.location.reload();
        }
        toast.success(`${model} Deleted Successfully`);
      } else if (model === "item") {
        const res = await deleteItem(id);
        if (res?.status === 200) {
          window.location.reload();
        }
        toast.success(`${model} Deleted Successfully`);
      }
      setDeleting(false);
    } catch (error) {
      console.log(error);
      setDeleting(false);
      toast.error("Something went wrong");
    }
  }
  return (
    <div className="flex items-center gap-2">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant={"ghost"}
            size={"icon"}
            className="text-red-600 hover:text-red-700 transition-all duration-500 cursor-pointer bg-red-300"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this{" "}
              {model}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button variant={"destructive"} onClick={() => handleDelete()}>
              {deleting ? (
                <span className="flex items-center space-x-1">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Deleting...</span>
                </span>
              ) : (
                "Permanently Delete"
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>{" "}
      {editEndpoint && (
        <Button
          variant={"ghost"}
          size={"icon"}
          className="text-sky-600 hover:text-sky-700 transition-all duration-500 cursor-pointer bg-sky-300"
        >
          <Link href={editEndpoint} className="text-sky-600 hover:text-sky-700">
            <Pencil className="w-4 h-4 " />
          </Link>
        </Button>
      )}
    </div>
  );
}
