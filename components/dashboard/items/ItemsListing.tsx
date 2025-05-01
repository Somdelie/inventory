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
import type { Item, ItemCreateDTO } from "@/types/itemTypes";
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
import { ImageInput } from "@/components/reusable-ui/image-upload"; // Using your updated Firebase image component
import { useRouter } from "next/navigation";
import { useFileDelete } from "@/hooks/useFileDelete"; // Import the file deletion hook
import { formatPrice } from "@/lib/formatPrice";

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
  const [itemsData, setItemsData] = useState<Item[]>([]);
  const { items, refetch } = useOrgItems(organizationId);
  const { deleteFile } = useFileDelete(); // For deleting old images

  const router = useRouter();

  // Use useEffect to update local state after items are fetched
  useEffect(() => {
    if (items) {
      setItemsData(items);
    }
  }, [items]);

  const [imageUrl, setImageUrl] = useState("");
  const [previousImageUrl, setPreviousImageUrl] = useState(""); // Track previous image URL for cleanup
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [currentItem, setCurrentItem] = useState<Item | null>(null);
  const [itemToDelete, setItemToDelete] = useState<Item | null>(null);

  // Function to reset the form and close the modal
  const resetFormAndCloseModal = useCallback(() => {
    setCurrentItem(null);
    setFormDialogOpen(false);
    setImageUrl("");
    setPreviousImageUrl("");
    form.reset({
      name: "",
      categoryId: "",
      brandId: "",
      sellingPrice: 0,
      costPrice: 0,
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
        setPreviousImageUrl(currentItem.thumbnail);
      }
    } else {
      form.reset({
        name: "",
        categoryId: "",
        brandId: "",
        sellingPrice: 0, // Use string here
        costPrice: 0, // Use string here
      });
      setImageUrl("");
      setPreviousImageUrl("");
    }
  }, [currentItem, form]);

  // Custom handler for image URL changes with cleanup logic
  const handleImageChange = async (url: string) => {
    // Check if we need to clean up a previously uploaded temporary image
    if (imageUrl && imageUrl !== url && imageUrl !== previousImageUrl) {
      try {
        // This is a temporary image that was uploaded but not saved yet, clean it up
        await deleteFile(imageUrl);
      } catch (error) {
        console.error("Failed to clean up temporary image:", error);
      }
    }

    setImageUrl(url);
  };

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
      currency: "ZAR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Export to Excel
  const handleExport = async (filteredProducts: Item[]) => {
    setIsExporting(true);
    try {
      // Prepare data for export
      const exportData = filteredProducts.map((product) => ({
        Name: product.name,
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
  const handleEditClick = (item: Item) => {
    // setCurrentItem(item);
    // setFormDialogOpen(true);
    router.push(`/dashboard/inventory/items/${item.id}/edit`);
  };

  // Handle delete click
  const handleDeleteClick = (item: Item) => {
    setCurrentItem(item);
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  // Handle delete confirmation
  const handleConfirmDelete = async () => {
    if (itemToDelete?.id) {
      try {
        // Also delete the thumbnail image from Firebase if it exists
        if (itemToDelete.thumbnail) {
          try {
            await deleteFile(itemToDelete.thumbnail);
          } catch (error) {
            console.error("Error deleting item thumbnail:", error);
            // Continue with item deletion even if thumbnail deletion fails
          }
        }

        await deleteItemMutation.mutateAsync(itemToDelete.id); // Pass ID here
        setDeleteDialogOpen(false);
        refetch();
      } catch (error) {
        console.error("Error deleting item:", error);
      }
    }
  };

  const onSubmit = async (data: ItemCreateDTO) => {
    setIsSubmitting(true);

    try {
      if (!currentItem) {
        // --- Create New Item Flow ---

        const brandName = data.brandId ? brandMap[data.brandId]?.name : null;
        const categoryName = data.categoryId
          ? categoryMap[data.categoryId]?.title
          : null;

        const newItemData: ItemCreateDTO = {
          ...data,
          costPrice: Number(data.costPrice),
          sellingPrice: Number(data.sellingPrice),
          organizationId,
          thumbnail: imageUrl,
          categoryId: data.categoryId || "",
          brandId: data.brandId || "",
          sku: generateSKU(data.name, brandName, categoryName),
          slug: generateSlug(data.name),
        };

        const response = await createItemMutation.mutateAsync(newItemData);

        toast.success("Item created successfully!");
        if (response.error) {
          toast.error("Error creating item", {
            description: response.message,
          });
        }
        resetFormAndCloseModal();
        refetch();
      } else {
        // --- Update Existing Item Flow ---

        const updatePayload: Item = {
          ...currentItem,
          name: data.name,
          sellingPrice: Number(data.sellingPrice),
          costPrice: Number(data.costPrice),
          categoryId: data.categoryId,
          brandId: data.brandId,
          thumbnail: imageUrl,
          organizationId,
          updatedAt: new Date(),
          barcode: currentItem?.barcode || "",
          minStockLevel: currentItem?.minStockLevel || 0,
          maxStockLevel: currentItem?.maxStockLevel || 0,
          isActive: currentItem?.isActive ?? true,
        };

        const oldThumbnail = previousImageUrl;
        const thumbnailChanged = imageUrl !== oldThumbnail;

        await updateItemMutation.mutateAsync(updatePayload);

        // Cleanup old thumbnail if needed
        if (
          thumbnailChanged &&
          oldThumbnail &&
          oldThumbnail !== "/placeholder.jpg"
        ) {
          try {
            await deleteFile(oldThumbnail);
          } catch (err) {
            console.error("Failed to delete old thumbnail:", err);
            // It's ok, just log it
          }
        }

        toast.success("Item updated successfully!");
        resetFormAndCloseModal();
        refetch();
      }
    } catch (error) {
      console.error(error);

      const errorMessage =
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.";

      toast.error("Error", {
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate total products value
  const getTotalValue = (items: Item[]) => {
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
  const columns: Column<Item>[] = [
    {
      header: "Thumbnail",
      accessorKey: "thumbnail",
      cell: (row) => {
        // First determine if we have a valid thumbnail (not empty string)
        const hasValidThumbnail = Boolean(
          row.thumbnail && row.thumbnail !== ""
        );

        // Then set the source with explicit type safety
        const imgSrc = hasValidThumbnail
          ? (row.thumbnail as string)
          : "/placeholder.jpg";

        return (
          <img
            src={imgSrc}
            alt={row.name || "Product image"}
            className="w-10 h-10 object-cover rounded-md"
            onError={(e) => {
              e.currentTarget.src = "/placeholder.jpg";
            }}
          />
        );
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
      header: "Coast Price",
      accessorKey: "costPrice",
      //change this to have className="text-teal-500"
      cell: (row) => (
        <span className="text-teal-500 font-medium">
          {formatPrice(Number(row.costPrice) || 0)}
        </span>
      ),
    },
    {
      header: "Selling Price",
      accessorKey: "sellingPrice",
      //change this to have className="text-primary"
      cell: (row) => (
        <span className="text-primary font-medium">
          {formatPrice(Number(row.sellingPrice) || 0)}
        </span>
      ),
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
      <DataTable<Item>
        title={title}
        buttonTitle="Item"
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
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.jpg";
                  }}
                />
              </div>
            )}

            {/* Firebase ImageInput component */}
            <ImageInput
              title=""
              imageUrl={imageUrl}
              setImageUrl={handleImageChange}
              endpoint="itemImage" // This prop is kept for compatibility
            />
            <p className="text-xs text-muted-foreground">
              Upload a high quality image for your item. JPG, PNG, and WebP
              formats supported (max 1MB).
            </p>
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
