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
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useRouter } from "next/navigation";
import {
  useCreateCustomer,
  useCustomerDelete,
  useCustomerUpdate,
  useOrgCustomers,
  useCustomerStatusToggle,
} from "@/hooks/useCustomerQueries";
import { CustomerDTO } from "@/types/customer";
import { Textarea } from "@/components/ui/textarea";

interface CustomersListingProps {
  title: string;
  organizationId: string;
  customers: any[]; // Initial customers data from server
}

// Form schema for editing/adding customer
const CustomerFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z
    .string()
    .regex(/^\+?\d*$/, "Invalid phone number")
    .optional()
    .or(z.literal("")),
  address: z.string().optional(),
  taxId: z.string().optional(),
  notes: z.string().optional(),
});

export default function CustomerListing({
  title,
  organizationId,
  customers: initialCustomers,
}: CustomersListingProps) {
  // State management
  const [customersData, setCustomersData] = useState<CustomerDTO[]>([]);
  const { customers, refetch } = useOrgCustomers(organizationId);

  const router = useRouter();

  // Helper function to transform initial customers data
  const transformInitialCustomers = (customers: any[]): CustomerDTO[] => {
    return customers.map((customer) => ({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      taxId: customer.taxId,
      notes: customer.notes,
      isActive: customer.isActive,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
      organizationId: customer.organizationId,
    }));
  };

  // Use useEffect to update local state after items are fetched
  useEffect(() => {
    if (customers) {
      setCustomersData(customers);
    } else if (initialCustomers && initialCustomers.length > 0) {
      // Transform and fallback to initial data if available
      setCustomersData(transformInitialCustomers(initialCustomers));
    }
  }, [customers, initialCustomers]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState<CustomerDTO | null>(null);
  const [customerToDelete, setCustomerToDelete] = useState<CustomerDTO | null>(null);

  // Function to reset the form and close the modal
  const resetFormAndCloseModal = useCallback(() => {
    setCurrentCustomer(null);
    setFormDialogOpen(false);
    form.reset({
      name: "",
      email: "",
      phone: "",
      address: "",
      taxId: "",
      notes: "",
    });
  }, []);

  // Create customer mutation with success handlers
  const createCustomerMutation = useCreateCustomer(organizationId, {
    onSuccess: () => {
      resetFormAndCloseModal();
      // Manually trigger refetch after mutation
      refetch();
    },
  });

  // Delete customer mutation with success handlers
  const deleteCustomerMutation = useCustomerDelete();

  // Update customer mutation with success handlers
  const updateCustomerMutation = useCustomerUpdate(
    currentCustomer?.id || "",
    organizationId
  );

  // Status toggle mutation
  const statusToggleMutation = useCustomerStatusToggle();

  // Form for editing/adding customers
  const form = useForm<z.infer<typeof CustomerFormSchema>>({
    resolver: zodResolver(CustomerFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      taxId: "",
      notes: "",
    },
  });

  // Update form when current item changes
  useEffect(() => {
    if (currentCustomer) {
      form.reset({
        name: currentCustomer.name,
        email: currentCustomer.email || "",
        phone: currentCustomer.phone || "",
        address: currentCustomer.address || "",
        taxId: currentCustomer.taxId || "",
        notes: currentCustomer.notes || "",
      });
    } else {
      form.reset({
        name: "",
        email: "",
        phone: "",
        address: "",
        taxId: "",
        notes: "",
      });
    }
  }, [currentCustomer, form]);

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

  // Handle status toggle
  const handleStatusToggle = async (
    customer: CustomerDTO,
    newStatus: boolean
  ) => {
    if (!customer.id) return;

    try {
      await statusToggleMutation.mutateAsync({
        id: customer.id,
        isActive: newStatus,
      });
    } catch (error) {
      console.error("Error updating customer status:", error);
      // Error handling is done in the mutation hook
    }
  };

  // Export to Excel
  const handleExport = async (filteredCustomers: CustomerDTO[]) => {
    setIsExporting(true);
    try {
      // Prepare data for export
      const exportData = filteredCustomers.map((customer) => ({
        "Customer Name": customer.name,
        Email: customer.email,
        Phone: customer.phone,
        Address: customer.address,
        "Tax ID": customer.taxId,
        Status: customer.isActive ? "Active" : "Inactive",
        Notes: customer.notes,
        "Date Added": formatDate(customer.createdAt),
      }));

      // Create workbook and worksheet
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Customers");

      // Generate filename with current date
      const fileName = `Customers_${format(new Date(), "yyyy-MM-dd")}.xlsx`;

      // Export to file
      XLSX.writeFile(workbook, fileName);

      toast.success("Export successful", {
        description: `Customers exported to ${fileName}`,
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
    setCurrentCustomer(null); // Reset current item
    setFormDialogOpen(true);
  };

  // Handle edit click
  const handleEditClick = (customer: CustomerDTO) => {
    setCurrentCustomer(customer);
    setFormDialogOpen(true);
  };

  // Handle delete click
  const handleDeleteClick = (customer: CustomerDTO) => {
    setCurrentCustomer(customer); // Set the customer to delete
    setCustomerToDelete(customer); // Set the item to delete
    setDeleteDialogOpen(true);
  };

  // Handle view customer details
  const handleViewClick = (customer: CustomerDTO) => {
    router.push(`/dashboard/sales/customers/${customer.id}`);
  };

  // Handle delete confirmation
  const handleConfirmDelete = async () => {
    if (customerToDelete?.id) {
      try {
        await deleteCustomerMutation.mutateAsync(customerToDelete.id); // Pass ID here
        setDeleteDialogOpen(false);
        refetch();
      } catch (error) {
        console.error("Error deleting customer:", error);
      }
    }
  };

  const onSubmit = async (data: z.infer<typeof CustomerFormSchema>) => {
    setIsSubmitting(true);

    try {
      if (!currentCustomer) {
        // --- Create New Customer Flow ---
        const newCustomerData: CustomerDTO = {
          ...data,
          organizationId,
        };

        await createCustomerMutation.mutateAsync(newCustomerData);
        toast.success("Customer created successfully!");
        resetFormAndCloseModal();
        refetch();
      } else {
        // --- Update Existing Customer Flow ---
        const updatePayload: CustomerDTO = {
          ...currentCustomer,
          ...data,
          organizationId,
          updatedAt: new Date(),
          isActive: currentCustomer?.isActive ?? true,
        };

        await updateCustomerMutation.mutateAsync(updatePayload);
        toast.success("Customer updated successfully!");
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
  const columns: Column<CustomerDTO>[] = [
    {
      header: "Name",
      accessorKey: "name",
      cell: (row) => (
        <span 
          className="font-medium line-clamp-1 cursor-pointer hover:text-primary transition-colors"
          onClick={() => handleViewClick(row)}
        >
          {truncatedText(row.name, 20)}
        </span>
      ),
    },
    {
      header: "Email",
      accessorKey: "email",
      cell: (row) => (
        <span className="line-clamp-1">
          {truncatedText(row.email || "", 20)}
        </span>
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
      header: "Status",
      accessorKey: "isActive",
      cell: (row) => (
        <div className="flex items-center space-x-2">
          <Switch
            checked={row.isActive ?? true}
            onCheckedChange={(checked) => handleStatusToggle(row, checked)}
            disabled={statusToggleMutation.isPending}
          />
          <Badge
            variant={row.isActive ? "default" : "secondary"}
            className={
              row.isActive
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-600"
            }
          >
            {row.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
      ),
    },
    {
      header: "Date Added",
      accessorKey: "createdAt",
      cell: (row) => formatDate(row.createdAt),
    },
  ];

  // Generate subtitle with total value
  const getSubtitle = (customerCount: number) => {
    return `${customerCount} customers`;
  };

  return (
    <div>
      <DataTable<CustomerDTO>
        title={title}
        buttonTitle="Customer"
        emptyStateModalTitle="Your Customer List is Empty"
        emptyStateModalDescription="Create your first Customer to get started with customer management."
        subtitle={
          customersData?.length > 0
            ? getSubtitle(customersData.length)
            : undefined
        }
        data={customersData}
        columns={columns}
        keyField="id"
        isLoading={false} // With Suspense, we're guaranteed to have data
        onRefresh={refetch}
        actions={{
          onAdd: handleAddClick,
          onExport: handleExport,
        }}
        filters={{
          searchFields: ["name", "email"],
          enableDateFilter: true,
          getItemDate: (customer) => new Date(customer.createdAt || new Date()),
        }}
        renderRowActions={(customer) => (
          <TableActions.RowActions
            onView={() => handleViewClick(customer)}
            onEdit={() => handleEditClick(customer)}
            onDelete={() => handleDeleteClick(customer)}
          />
        )}
      />

      {/* Customer Form Dialog */}
      <EntityForm
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        title={currentCustomer ? "Edit Customer" : "Add New Customer"}
        form={form}
        onSubmit={onSubmit}
        isSubmitting={
          createCustomerMutation.isPending || updateCustomerMutation.isPending
        }
        submitLabel={currentCustomer ? "Save Changes" : "Add Customer"}
        size="md"
      >
        <div className="col-span-1 md:col-span-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Customer Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter customer name" {...field} />
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
          name="taxId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tax ID</FormLabel>
              <FormControl>
                <Input placeholder="Enter tax ID" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
<div className="col-span-1 md:col-span-2">
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
               <Textarea
                  placeholder="Enter any additional notes"
                  {...field}
                  className="resize-none h-24"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        </div>
      </EntityForm>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Customer"
        description={
          customerToDelete ? (
            <>
              Are you sure you want to delete{" "}
              <strong className="text-primary">{customerToDelete.name}</strong>{" "}
              from your customers?
              <br />
              This action cannot be undone.
            </>
          ) : (
            "Are you sure you want to delete this customer?"
          )
        }
        onConfirm={handleConfirmDelete}
        isConfirming={deleteCustomerMutation.isPending}
        confirmLabel="Delete"
        variant="destructive"
      />
    </div>
  );
}