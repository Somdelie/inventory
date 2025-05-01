"use client";
import { createSupplier } from "@/actions/suppliers";
import TextInput from "@/components/FormInputs/TextInput";
import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Check, LayoutGrid, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export type SupplierFormProps = {
  id: string;
  name: string;
  organizationId: string;
  email: string;
  phone?: string;
  address?: string;
  taxId?: string;
  paymentTerms?: string;
  notes?: string;
  isActive?: boolean;
};

export function SupplierForm({ organizationId }: { organizationId: string }) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SupplierFormProps>();

  const saveSupplier = async (data: SupplierFormProps) => {
    data.organizationId = organizationId;
    data.isActive = true; // Default to active

    try {
      setLoading(true);
      const res = await createSupplier(data);
      if (res?.status === 200) {
        setLoading(false);
        toast.success(res?.message, {
          style: {
            background: "green",
            color: "#fff",
          },
        });
        window.location.reload();
        reset();
        setOpen(false);
      } else {
        setLoading(false);
        toast.error(res?.error, {
          style: {
            background: "#EF4444",
            color: "#fff",
          },
        });
        return;
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log(error);
      toast.error("Something went wrong");
      return;
    }
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="h-8 gap-1">
          <LayoutGrid className="h-4 w-4" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Add New Supplier
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle></DialogTitle>
        </DialogHeader>
        <Card className="w-full ">
          <CardHeader>
            <CardTitle>Add New Supplier</CardTitle>
          </CardHeader>
          <CardFooter className="flex flex-col gap-4">
            <form className="flex flex-col w-full gap-2">
              <div className="grid gap-3">
                <TextInput
                  register={register}
                  errors={errors}
                  label="Supplier Name"
                  placeholder="e.g. ABC Suppliers Inc."
                  name="name"
                />
                <TextInput
                  register={register}
                  errors={errors}
                  label="Email"
                  placeholder="supplier@example.com"
                  name="email"
                />
                <TextInput
                  register={register}
                  errors={errors}
                  label="Phone"
                  placeholder="e.g. +1 123-456-7890"
                  name="phone"
                />
                <TextInput
                  register={register}
                  errors={errors}
                  label="Address"
                  placeholder="e.g. 123 Supply St, Warehouse City"
                  name="address"
                />
                <TextInput
                  register={register}
                  errors={errors}
                  label="Payment Terms"
                  placeholder="e.g. Net 30"
                  name="paymentTerms"
                />
              </div>
              {loading ? (
                <Button disabled>
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  Please wait...
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit(saveSupplier)}
                  className="w-full"
                  type="submit"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Save Supplier
                </Button>
              )}
            </form>
          </CardFooter>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
