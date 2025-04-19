"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import * as XLSX from "xlsx";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { DollarSign } from "lucide-react";
import { useSession } from "next-auth/react";
import {
  DataTable,
  type Column,
  TableActions,
  EntityForm,
  ConfirmationDialog,
} from "@/components/ui/data-table";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { ItemCreateDTO, ItemDTO, ItemUpdateDTO } from "@/types/itemTypes";
import {
  useCreateItem,
  useItemDelete,
  useItemUpdate,
  useOrgItems,
} from "@/hooks/useItemQueries";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { generateSlug } from "@/lib/generateSlug";
import { generateSKU } from "@/lib/generateSKU";
import { ImageInput } from "@/components/FormInputs/ThumbnailUpload";
import { Button } from "@/components/ui/button";

interface ItemsListingProps {
  title: string;
  organizationId: string;
  categoryMap: Record<string, { id: string; title: string }>;
  brandMap: Record<string, { id: string; name: string }>;
}

// Form schema for editing/adding items
const itemFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  categoryId: z.string().min(1, "Category is required"),
  brandId: z.string().min(1, "Brand is required"),
  sellingPrice: z.coerce.number().min(1, "Selling price is required"),
  costPrice: z.coerce.number().min(1, "Cost price is required"),
});

export default function ItemsListing({
  title,
  organizationId,
  categoryMap,
  brandMap,
}: ItemsListingProps) {
  // Move this inside a useEffect to prevent state updates during render
  const [itemsData, setItemsData] = useState<ItemDTO[]>([]);
  const { items, refetch } = useOrgItems(organizationId);

  // Use useEffect to update local state after items are fetched
  useEffect(() => {
    if (items) {
      setItemsData(items);
    }
  }, [items]);

  const [imageUrl, setImageUrl] = useState(
    "https://9tf4o9l5yt.ufs.sh/f/2L7IdLt9oQb1C1OOUKyYQeO0fxGr6FUCLoAPEa5yN1i7HuJR"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [currentItem, setCurrentItem] = useState<ItemDTO | null>(null);
  const [itemToDelete, setItemToDelete] = useState<ItemDTO | null>(null);

  // Function to reset the form and close the modal
  const resetFormAndCloseModal = useCallback(() => {
    setCurrentItem(null);
    setFormDialogOpen(false);
    form.reset({
      name: "",
      categoryId: "",
      brandId: "",
      sellingPrice: 0,
      costPrice: 0,
      thumbnail: null, // Reset thumbnail as null
    });
  }, []);

  // Create item mutation with success handlers
  const createItemMutation = useCreateItem(organizationId, {
    onSuccess: () => {
      resetFormAndCloseModal();
      // Manually trigger refetch after mutation
      refetch();
    },
  });

  // Delete item mutation with success handlers
  const deleteItemMutation = useItemDelete();

  // update item mutation with success handlers
  const updateItemMutation = useItemUpdate(currentItem?.id || "");

  // Form for editing/adding products
  const form = useForm<ItemCreateDTO>({
    resolver: zodResolver(itemFormSchema),
    defaultValues: {
      name: "",
      categoryId: "",
      brandId: "",
      sellingPrice: 0, // Use string here to match input value
      costPrice: 0, // Use string here to match input value
    },
  });

  // Update form when current item changes
  useEffect(() => {
    if (currentItem) {
      form.reset({
        name: currentItem.name,
        categoryId: currentItem.categoryId || "",
        brandId: currentItem.brandId || "",
        sellingPrice: currentItem.sellingPrice, // Convert to string for form input
        costPrice: currentItem.costPrice,
      });
      // Also update the imageUrl state
      if (currentItem.thumbnail) {
        setImageUrl(currentItem.thumbnail);
      }
    } else {
      form.reset({
        name: "",
        categoryId: "",
        brandId: "",
        sellingPrice: 0, // Use string here
        costPrice: 0, // Use string here
      });
    }
  }, [currentItem, form]);

  const { data: session } = useSession();

  // Format date function with error handling
  const formatDate = (date: Date | string | undefined | null) => {
    if (!date) {
      return "N/A"; // Handle undefined or null dates
    }

    try {
      const dateObj = typeof date === "string" ? new Date(date) : date;

      // Check if the date is valid
      if (isNaN(dateObj.getTime())) {
        return "Invalid date";
      }

      return format(dateObj, "MMM dd, yyyy");
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid date";
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: "UGX",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Export to Excel
  const handleExport = async (filteredProducts: ItemDTO[]) => {
    setIsExporting(true);
    try {
      // Prepare data for export
      const exportData = filteredProducts.map((product) => ({
        Name: product.name,
        "Number Plate": product.numberPlate,
        Price: product.price,
        "Sales Count": product.salesCount,
        "Total Sales": formatCurrency(product.salesTotal),
        "Date Added": formatDate(product.createdAt),
      }));

      // Create workbook and worksheet
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Products");

      // Generate filename with current date
      const fileName = `Products_${format(new Date(), "yyyy-MM-dd")}.xlsx`;

      // Export to file
      XLSX.writeFile(workbook, fileName);

      toast.success("Export successful", {
        description: `Products exported to ${fileName}`,
      });
    } catch (error) {
      toast.error("Export failed", {
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Handle add new click
  const handleAddClick = () => {
    setCurrentItem(null);
    setFormDialogOpen(true);
  };

  // Handle edit click
  const handleEditClick = (item: ItemDTO) => {
    setCurrentItem(item);
    setFormDialogOpen(true);
  };

  // Handle delete click
  const handleDeleteClick = (item: ItemDTO) => {
    setCurrentItem(item);
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  // Handle delete confirmation
  const handleConfirmDelete = async () => {
    if (itemToDelete?.id) {
      try {
        await deleteItemMutation.mutateAsync(itemToDelete.id); // Pass ID here
        setDeleteDialogOpen(false);
        refetch();
      } catch (error) {
        console.error("Error deleting item:", error);
      }
    }
  };

  // Handle form submission (edit or add)
  const onSubmit = async (data: ItemCreateDTO) => {
    setIsSubmitting(true);
    try {
      if (!currentItem) {
        // Add new product
        // Generate SKU using the item name and selected category/brand
        const brandName = data.brandId ? brandMap[data.brandId]?.name : null;
        const categoryName = data.categoryId
          ? categoryMap[data.categoryId]?.title
          : null;

        data.costPrice = Number(data.costPrice);
        data.sellingPrice = Number(data.sellingPrice);
        data.organizationId = organizationId; // Add organization ID to data
        data.categoryId = data.categoryId || ""; // Ensure category ID is set
        data.brandId = data.brandId || ""; // Ensure brand ID is set

        // Set the thumbnail to the current imageUrl instead of File object
        data.thumbnail = imageUrl;

        // Generate SKU with more context
        data.sku = generateSKU(data.name, brandName, categoryName);
        data.slug = generateSlug(data.name);

        // console.log("Form data before mutation:", data);
        createItemMutation.mutate(data);

        // check if the mutation was successful then close the modal
        if (createItemMutation.isSuccess) {
          resetFormAndCloseModal();
        }
      } else {
        // Update existing product - include organizationId explicitly
        const updatePayload: ItemUpdateDTO = {
          id: currentItem.id,
          name: data.name,
          sellingPrice: Number(data.sellingPrice),
          costPrice: Number(data.costPrice),
          categoryId: data.categoryId,
          brandId: data.brandId,
          thumbnail: imageUrl,
          organizationId: organizationId, // Add this line to ensure organizationId is included
        };

        updateItemMutation.mutate(updatePayload, {
          onSuccess: () => {
            toast.success("Item updated successfully");
            resetFormAndCloseModal();
            refetch();
          },
          onError: (error) => {
            toast.error("Failed to update item", {
              description:
                error instanceof Error
                  ? error.message
                  : "Unknown error occurred",
            });
          },
        });
      }
    } catch (error) {
      toast.error("An error occurred", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate total products value
  const getTotalValue = (items: ItemDTO[]) => {
    return items.reduce((total, item) => {
      const price =
        Number.parseFloat(item.sellingPrice?.toString() || "0") || 0;
      const quantity = item.quantity || 0;
      return total + price * quantity;
    }, 0);
  };

  const truncatedText = (text: string, length: number) => {
    if (text.length > length) {
      return text.slice(0, length) + "...";
    }
    return text;
  };

  // Define columns for the data table
  const columns: Column<ItemDTO>[] = [
    {
      header: "Thumbnail",
      accessorKey: "thumbnail",
      cell: (row) => {
        return row.thumbnail ? (
          <img
            src={row.thumbnail || "/placeholder.svg"}
            alt={row.name}
            className="w-10 h-10 object-cover rounded-md"
          />
        ) : null;
      },
    },
    {
      header: "Name",
      accessorKey: "name",
      cell: (row) => (
        <span className="font-medium line-clamp-1">
          {truncatedText(row.name, 20)}
        </span>
      ),
    },
    {
      header: "Category",
      accessorKey: "categoryId",
      cell: (row) => (
        <span className="font-medium line-clamp-1">
          {truncatedText(
            categoryMap[row.categoryId]?.title || "Uncategorized",
            20
          )}
        </span>
      ),
    },
    {
      header: "Brand",
      accessorKey: "brandId",
      cell: (row) => (
        <span className="font-medium line-clamp-1">
          {truncatedText(brandMap[row.brandId]?.name || "Unknown", 20)}
        </span>
      ),
    },
    {
      header: "Price",
      accessorKey: "sellingPrice",
      cell: (row) => formatCurrency(Number(row.sellingPrice) || 0),
    },
    {
      header: "Date Added",
      accessorKey: "createdAt",
      cell: (row) => formatDate(row.createdAt),
    },
  ];

  // Generate subtitle with total value
  const getSubtitle = (itemCount: number, totalValue: number) => {
    return `${itemCount} ${
      itemCount === 1 ? "item" : "items"
    } | Total Value: ${formatCurrency(totalValue)}`;
  };

  return (
    <div>
      <DataTable<ItemDTO>
        title={title}
        emptyStateModalTitle="Your Items List is Empty"
        emptyStateModalDescription="Create your first item to get started with inventory management."
        subtitle={
          itemsData?.length > 0
            ? getSubtitle(itemsData.length, getTotalValue(itemsData))
            : undefined
        }
        data={itemsData}
        columns={columns}
        keyField="id"
        isLoading={false} // With Suspense, we're guaranteed to have data
        onRefresh={refetch}
        actions={{
          onAdd: handleAddClick,
          onExport: handleExport,
        }}
        filters={{
          searchFields: ["name"],
          enableDateFilter: true,
          getItemDate: (item) => new Date(item.createdAt),
        }}
        renderRowActions={(item) => (
          <TableActions.RowActions
            onEdit={() => handleEditClick(item)}
            onDelete={() => handleDeleteClick(item)}
            // isDeleting={deleteProductMutation.isPending && productToDelete?.id === item.id}
          />
        )}
      />
      {/* Product Form Dialog */}
      <EntityForm
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        title={currentItem ? "Edit Item" : "Add New Item"}
        form={form}
        onSubmit={onSubmit}
        isSubmitting={
          createItemMutation.isPending || updateItemMutation.isPending
        }
        submitLabel={currentItem ? "Save Changes" : "Add Item"}
        size="md"
      >
        <div className="col-span-1 md:col-span-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Item Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter item name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                </FormControl>
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
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="brandId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Brand</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Brand" />
                  </SelectTrigger>
                </FormControl>
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
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="sellingPrice"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Selling Price</FormLabel>
              <FormControl>
                <div className="relative">
                  <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="25,000,000" className="pl-8" {...field} />
                </div>
              </FormControl>
              <FormDescription>Enter the product price in UGX</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="costPrice"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cost Price</FormLabel>
              <FormControl>
                <div className="relative">
                  <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="25,000,000" className="pl-8" {...field} />
                </div>
              </FormControl>
              <FormDescription>Enter the cost price in UGX</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="col-span-1 md:col-span-2">
          <FormLabel className="text-base font-medium mb-2 block">
            Item Thumbnail
          </FormLabel>
          <div className="flex flex-col space-y-3 px-4 items-center w-full border-2 border-dashed border-rose-300 rounded p-4">
            {/* Display existing thumbnail if available */}
            {imageUrl && (
              <div className="relative group w-full flex justify-center items-center">
                <img
                  src={imageUrl}
                  alt="Item thumbnail"
                  className="w-24 h-24 object-cover rounded-md border shadow-sm"
                />
              </div>
            )}

            {/* ImageInput component with UploadThing integration */}
            <ImageInput
              title=""
              imageUrl={imageUrl}
              setImageUrl={setImageUrl}
              endpoint="itemImage"
            />
            {/* <p className="text-xs text-muted-foreground">
              Upload a high quality image for your item. JPG, PNG, and WebP
              formats supported.
            </p> */}
          </div>
        </div>
      </EntityForm>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Product"
        description={
          itemToDelete ? (
            <>
              Are you sure you want to delete{" "}
              <strong className="text-primary">{itemToDelete.name}</strong> from
              your inventory?
              <br />
              This action cannot be undone.
            </>
          ) : (
            "Are you sure you want to delete this item?"
          )
        }
        onConfirm={handleConfirmDelete}
        isConfirming={deleteItemMutation.isPending}
        confirmLabel="Delete"
        variant="destructive"
      />
    </div>
  );
}
