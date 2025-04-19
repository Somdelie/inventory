"use client";
import { createTax } from "@/actions/taxes";
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

export type TaxFormProps = {
  name: string;
  rate: number;
  organizationId: string;
};

export function TaxForm({ organizationId }: { organizationId: string }) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TaxFormProps>();

  const saveTax = async (data: TaxFormProps) => {
    console.log(data);
    // Ensure rate is a number
    data.rate = parseFloat(data.rate as unknown as string);
    data.organizationId = organizationId;

    // Validate that rate is a valid number
    if (isNaN(data.rate)) {
      toast.error("Tax rate must be a valid number", {
        style: {
          background: "#EF4444",
          color: "#fff",
        },
      });
      return;
    }

    try {
      setLoading(true);
      const res = await createTax(data);
      // console.log(res, "this is the response");
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
            Create Tax
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle></DialogTitle>
        </DialogHeader>
        <Card className="w-full ">
          <CardHeader>
            <CardTitle>Create New Tax</CardTitle>
          </CardHeader>
          <CardFooter className="flex flex-col gap-4">
            <form className="flex flex-col w-full gap-2">
              <div className="grid gap-3">
                <TextInput
                  register={register}
                  errors={errors}
                  label="Title"
                  placeholder="e.g. VAT, GST"
                  name="name"
                />
              </div>
              <div className="grid gap-3">
                <TextInput
                  register={register}
                  errors={errors}
                  label="Tax Rate"
                  placeholder="e.g. 15, 20 (without % symbol)"
                  name="rate"
                  type="number"
                  step="0.01"
                />
                <small className="text-gray-500">
                  Enter rate as a decimal (e.g., 15 for 15%)
                </small>
              </div>
              {loading ? (
                <Button disabled>
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  Please wait...
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit(saveTax)}
                  className="w-full"
                  type="submit"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Save Tax
                </Button>
              )}
            </form>
          </CardFooter>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
