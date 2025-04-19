"use client";
import { createUnit } from "@/actions/unit";
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

export type UnitFormProps = {
  title: string;
  symbol: string;
  organizationId: string;
};

export function UnitForm({ organizationId }: { organizationId: string }) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UnitFormProps>();

  const saveUnit = async (data: UnitFormProps) => {
    console.log(data);
    data.organizationId = organizationId;
    try {
      setLoading(true);
      const res = await createUnit(data);
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
            Create Unit
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle></DialogTitle>
        </DialogHeader>
        <Card className="w-full ">
          <CardHeader>
            <CardTitle>Create New Unit</CardTitle>
          </CardHeader>
          <CardFooter className="flex flex-col gap-4">
            <form className="flex flex-col w-full gap-2">
              <div className="grid gap-3">
                <TextInput
                  register={register}
                  errors={errors}
                  label="Unit Title"
                  placeholder="e.g. Kilogram, Gram, Litre"
                  name="title"
                />
              </div>
              <div className="grid gap-3">
                <TextInput
                  register={register}
                  errors={errors}
                  label="Unit Symbol"
                  name="symbol"
                  placeholder="e.g. kg, g, L"
                />
              </div>
              {loading ? (
                <Button disabled>
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  Please wait...
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit(saveUnit)}
                  className="w-full"
                  type="submit"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Save Unit
                </Button>
              )}
            </form>
          </CardFooter>
        </Card>
        {/* <DialogFooter>
          <Button type="submit">Save changes</Button>
        </DialogFooter> */}
      </DialogContent>
    </Dialog>
  );
}
