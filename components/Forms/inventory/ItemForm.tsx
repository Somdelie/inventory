"use client";
import { createItem } from "@/actions/item";
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
import { generateSKU } from "@/lib/generateSKU";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BrandDTO, CategoryDTO } from "@/types/types";
import { Check, LayoutGrid, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { generateSlug } from "@/lib/generateSlug";
import TextArea from "@/components/FormInputs/TextAreaInput";
import { ItemCreateDTO } from "@/types/itemTypes";

// export type ItemFormProps = {
//   id: string;
//   name: string;
//   slug: string;
//   sku: string;
//   description?: string;
//   quantity?: number;
//   organizationId: string;
//   categoryId: string;
//   brandId: string;
//   sellingPrice: number;
//   costPrice: number;
// };

export function ItemForm({
  organizationId,
  categoryMap,
  brandMap,
}: {
  organizationId: string;
  categoryMap: { [key: string]: CategoryDTO };
  brandMap: { [key: string]: BrandDTO };
}) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ItemCreateDTO>();

  const saveItem = async (data: ItemCreateDTO) => {
    try {
      setLoading(true);

      // Add organization ID to data
      data.organizationId = organizationId;

      // Generate SKU using the item name and selected category/brand
      const brandName = data.brandId ? brandMap[data.brandId]?.name : null;
      const categoryName = data.categoryId
        ? categoryMap[data.categoryId]?.title
        : null;

      // Generate SKU with more context
      data.sku = generateSKU(data.name, brandName, categoryName);
      data.slug = generateSlug(data.name);

      // Convert string numbers to actual numbers for Prisma
      const formattedData = {
        ...data,
        sellingPrice: parseFloat(data.sellingPrice as unknown as string),
        costPrice: parseFloat(data.costPrice as unknown as string),
        quantity: parseInt(data.quantity as unknown as string, 10),
      };

      const res = await createItem(data, organizationId);
      console.log(res, "this is the response");

      if (res?.status === 201) {
        // Changed from 2001 to 201
        setLoading(false);
        toast.success(res.message, {
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
        toast.error(res?.message, {
          style: {
            background: "#EF4444",
            color: "#fff",
          },
        });
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
      toast.error("Something went wrong");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="h-8 gap-1">
          <LayoutGrid className="h-4 w-4" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Add New Item
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Add New Item</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto pr-1">
          <form className="flex flex-col w-full gap-4 py-4">
            <div className="grid gap-4">
              <TextInput
                register={register}
                errors={errors}
                label="Item Name *"
                placeholder="e.g. iPhone 14 Pro Max"
                name="name"
              />

              {/* Category Selection */}
              <div className="grid gap-1.5">
                <label htmlFor="categoryId" className="text-sm font-medium">
                  Category *
                </label>
                <Controller
                  name="categoryId"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger
                        className={errors.categoryId ? "border-red-500" : ""}
                      >
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {Object.keys(categoryMap).map((key) => (
                            <SelectItem key={key} value={key}>
                              {categoryMap[key].title}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.categoryId && (
                  <p className="text-red-500 text-sm">Category is required</p>
                )}
              </div>

              {/* Brand Selection */}
              <div className="grid gap-1.5">
                <label htmlFor="brandId" className="text-sm font-medium">
                  Brand *
                </label>
                <Controller
                  name="brandId"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger
                        className={errors.brandId ? "border-red-500" : ""}
                      >
                        <SelectValue placeholder="Select Brand" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {Object.keys(brandMap).map((key) => (
                            <SelectItem key={key} value={key}>
                              {brandMap[key].name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.brandId && (
                  <p className="text-red-500 text-sm">Brand is required</p>
                )}
              </div>

              {/* selling price */}
              <TextInput
                register={register}
                errors={errors}
                label="Selling Price *"
                placeholder="e.g. 1000"
                name="sellingPrice"
                type="number"
              />

              {/* cost price */}
              <TextInput
                register={register}
                errors={errors}
                label="Cost Price *"
                placeholder="e.g. 800"
                name="costPrice"
                type="number"
              />

              {/* Quantity */}
              <TextInput
                register={register}
                errors={errors}
                label="Quantity *"
                placeholder="e.g. 10"
                name="quantity"
                type="number"
              />

              {/* Description */}
              <TextArea
                register={register}
                errors={errors}
                label="Description"
                helperText="Optional"
                name="description"
              />
            </div>
            <div className="sticky bottom-0 pt-2 bg-background border-t">
              {loading ? (
                <Button disabled className="w-full">
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  Please wait...
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit(saveItem)}
                  className="w-full"
                  type="submit"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Save Item
                </Button>
              )}
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
