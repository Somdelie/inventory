"use client";
import { createBrand } from "@/actions/brands";
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
import { generateSlug } from "@/lib/generateSlug";
import { Check, LayoutGrid, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export type BrandFormProps = {
  id: string;
  name: string;
  organizationId: string;
  slug: string;
};

export function BrandForm({ organizationId }: { organizationId: string }) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BrandFormProps>();

  const saveBrand = async (data: BrandFormProps) => {
    console.log(data);
    data.organizationId = organizationId;
    data.slug = generateSlug(data.name);
    try {
      setLoading(true);
      const res = await createBrand(data);
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
            Add New Brand
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle></DialogTitle>
        </DialogHeader>
        <Card className="w-full ">
          <CardHeader>
            <CardTitle>Add New Brand</CardTitle>
          </CardHeader>
          <CardFooter className="flex flex-col gap-4">
            <form className="flex flex-col w-full gap-2">
              <div className="grid gap-3">
                <TextInput
                  register={register}
                  errors={errors}
                  label="Brand Name"
                  placeholder="e.g. Nike, Adidas, Puma"
                  name="name"
                />
              </div>
              {loading ? (
                <Button disabled>
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  Please wait...
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit(saveBrand)}
                  className="w-full"
                  type="submit"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Save Brand
                </Button>
              )}
            </form>
          </CardFooter>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
