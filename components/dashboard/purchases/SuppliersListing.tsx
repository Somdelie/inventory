"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import * as XLSX from "xlsx";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { Supplier, SupplierDTO } from "@/types/types";
import {
  useCreateSupplier,
  useOrgSuppliers,
  useSupplierDelete,
  useSupplierUpdate,
} from "@/hooks/useSupplierQueries";

interface SuppliersListingProps {
  title: string;
  organizationId: string;
}

// Form schema for editing/adding supplier
const SupplierFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^\+?\d*$/, "Invalid phone number"),
  address: z.string().optional(),
  paymentTerms: z.string().optional(),
  notes: z.string().optional(),
});

export default function SuppliersListing({
  title,
  organizationId,
}: SuppliersListingProps) {
  // Move this inside a useEffect to prevent state updates during render
  const [suppliersData, setSuppliersData] = useState<SupplierDTO[]>([]);
  const { suppliers, refetch } = useOrgSuppliers(organizationId);

  const router = useRouter();

  // Use useEffect to update local state after items are fetched
  useEffect(() => {
    if (suppliers) {
      setSuppliersData(suppliers);
    }
  }, [suppliers]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [currentSupplier, setCurrentSupplier] = useState<SupplierDTO | null>(
    null
  );
  const [supplierToDelete, setSupplierToDelete] = useState<SupplierDTO | null>(
    null
  );

  // Function to reset the form and close the modal
  const resetFormAndCloseModal = useCallback(() => {
    setCurrentSupplier(null);
    setFormDialogOpen(false);
    form.reset({
      name: "",
      email: "",
      phone: "",
      address: "",
      paymentTerms: "",
      notes: "",
    });
  }, []);

  // Create supplier mutation with success handlers
  const createSupplierMutation = useCreateSupplier(organizationId, {
    onSuccess: () => {
      resetFormAndCloseModal();
      // Manually trigger refetch after mutation
      refetch();
    },
  });

  // Delete supplier mutation with success handlers
  const deleteSupplierMutation = useSupplierDelete();

  // update supplier mutation with success handlers
  const updateSupplierMutation = useSupplierUpdate(currentSupplier?.id || "");

  // Form for editing/adding products
  const form = useForm<z.infer<typeof SupplierFormSchema>>({
    resolver: zodResolver(SupplierFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      paymentTerms: "",
      notes: "",
    },
  });

  // Update form when current item changes
  useEffect(() => {
    if (currentSupplier) {
      form.reset({
        name: currentSupplier.name,
        email: currentSupplier.email || "",
        phone: currentSupplier.phone || "",
        address: currentSupplier.address || "",
        paymentTerms: currentSupplier.paymentTerms || "",
        notes: currentSupplier.notes || "",
      });
    } else {
      form.reset({
        name: "",
        email: "",
        phone: "",
        address: "",
        paymentTerms: "",
        notes: "",
      });
    }
  }, [currentSupplier, form]);

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

  // Export to Excel
  const handleExport = async (filteredSuppliers: SupplierDTO[]) => {
    setIsExporting(true);
    try {
      // Prepare data for export
      const exportData = filteredSuppliers.map((supplier) => ({
        "Supplier Name": supplier.name,
        Email: supplier.email,
        Phone: supplier.phone,
        Address: supplier.address,
        "Payment Terms": supplier.paymentTerms,
        Notes: supplier.notes,
        "Date Added": formatDate(supplier.createdAt),
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
    setCurrentSupplier(null); // Reset current item
    setFormDialogOpen(true);
  };

  // Handle edit click
  const handleEditClick = (supplier: SupplierDTO) => {
    setCurrentSupplier(supplier);
    setFormDialogOpen(true);
  };

  // Handle delete click
  const handleDeleteClick = (supplier: SupplierDTO) => {
    setCurrentSupplier(supplier); // Set the supplier to delete
    setSupplierToDelete(supplier); // Set the item to delete
    setDeleteDialogOpen(true);
  };

  // Handle delete confirmation
  const handleConfirmDelete = async () => {
    if (supplierToDelete?.id) {
      try {
        await deleteSupplierMutation.mutateAsync(supplierToDelete.id); // Pass ID here
        setDeleteDialogOpen(false);
        refetch();
      } catch (error) {
        console.error("Error deleting supplier:", error);
      }
    }
  };

  const onSubmit = async (data: z.infer<typeof SupplierFormSchema>) => {
    setIsSubmitting(true);

    try {
      if (!currentSupplier) {
        // --- Create New Supplier Flow ---

        const newSupplierData: SupplierDTO = {
          ...data,
          organizationId,
        };

        await createSupplierMutation.mutateAsync(newSupplierData);
        toast.success("Supplier created successfully!");
        resetFormAndCloseModal();
        refetch();
      } else {
        // --- Update Existing Supplier Flow ---

        const updatePayload: SupplierDTO = {
          ...currentSupplier,
          ...data,
          organizationId,
          updatedAt: new Date(),
          isActive: currentSupplier?.isActive ?? true,
        };

        await updateSupplierMutation.mutateAsync(updatePayload);
        toast.success("Supplier updated successfully!");
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

  const truncatedText = (text: string, length: number) => {
    if (text.length > length) {
      return text.slice(0, length) + "...";
    }
    return text;
  };

  // Define columns for the data table
  const columns: Column<SupplierDTO>[] = [
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
      header: "Email",
      accessorKey: "email",
      cell: (row) => (
        <span className="line-clamp-1">{truncatedText(row.email, 20)}</span>
      ),
    },
    {
      header: "Phone",
      accessorKey: "phone",
      cell: (row) => (
        <span className="line-clamp-1">
          {truncatedText(row.phone ?? "", 20)}
        </span>
      ),
    },
    {
      header: "Address",
      accessorKey: "address",
      cell: (row) => (
        <span className="line-clamp-1">
          {truncatedText(row.address ?? "", 20)}
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
  const getSubtitle = (supplierCount: number) => {
    return `${supplierCount} suppliers`;
  };

  return (
    <div>
      <DataTable<SupplierDTO>
        title={title}
        buttonTitle="Supplier"
        emptyStateModalTitle="Your Supplier List is Empty"
        emptyStateModalDescription="Create your first Supplier to get started with inventory management."
        subtitle={
          suppliersData?.length > 0
            ? getSubtitle(suppliersData.length)
            : undefined
        }
        data={suppliersData}
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
          getItemDate: (supplier) => new Date(supplier.createdAt || new Date()),
        }}
        renderRowActions={(supplier) => (
          <TableActions.RowActions
            onEdit={() => handleEditClick(supplier)}
            onDelete={() => handleDeleteClick(supplier)}
          />
        )}
      />
      {/* Supplier Form Dialog */}
      <EntityForm
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        title={currentSupplier ? "Edit Supplier" : "Add New Supplier"}
        form={form}
        onSubmit={onSubmit}
        isSubmitting={
          createSupplierMutation.isPending || updateSupplierMutation.isPending
        }
        submitLabel={currentSupplier ? "Save Changes" : "Add Supplier"}
        size="md"
      >
        <div className="col-span-1 md:col-span-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Supplier Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter supplier name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="Enter email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Input placeholder="Enter phone number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input placeholder="Enter address" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="paymentTerms"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payment Terms</FormLabel>
              <FormControl>
                <Input placeholder="Enter payment terms" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Input placeholder="Enter notes" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </EntityForm>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Supplier"
        description={
          supplierToDelete ? (
            <>
              Are you sure you want to delete{" "}
              <strong className="text-primary">{supplierToDelete.name}</strong>{" "}
              from your suppliers?
              <br />
              This action cannot be undone.
            </>
          ) : (
            "Are you sure you want to delete this supplier?"
          )
        }
        onConfirm={handleConfirmDelete}
        isConfirming={deleteSupplierMutation.isPending}
        confirmLabel="Delete"
        variant="destructive"
      />
    </div>
  );
}
