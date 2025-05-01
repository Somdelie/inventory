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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LocationDTO, LocationType } from "@/types";
import {
  useCreateLocation,
  useOrgLocations,
  useLocationDelete,
  useLocationUpdate,
} from "@/hooks/useLocationQueries";

interface LocationsListingProps {
  title: string;
  organizationId: string;
}

// Form schema for editing/adding location
const LocationFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.nativeEnum(LocationType, {
    errorMap: () => ({ message: "Location type is required" }),
  }),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z
    .string()
    .regex(/^\+?\d*$/, "Invalid phone number")
    .optional()
    .or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
});

export default function LocationsListing({
  title,
  organizationId,
}: LocationsListingProps) {
  // Move this inside a useEffect to prevent state updates during render
  const [locationsData, setLocationsData] = useState<LocationDTO[]>([]);
  const { locations, refetch } = useOrgLocations(organizationId);

  // Use useEffect to update local state after locations are fetched
  useEffect(() => {
    if (locations) {
      setLocationsData(locations);
    }
  }, [locations]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<LocationDTO | null>(
    null
  );
  const [locationToDelete, setLocationToDelete] = useState<LocationDTO | null>(
    null
  );

  // Function to reset the form and close the modal
  const resetFormAndCloseModal = useCallback(() => {
    setCurrentLocation(null);
    setFormDialogOpen(false);
    form.reset({
      name: "",
      type: undefined,
      email: "",
      phone: "",
      address: "",
    });
  }, []);

  // Create location mutation with success handlers
  const createLocationMutation = useCreateLocation(organizationId, {
    onSuccess: () => {
      resetFormAndCloseModal();
      // Manually trigger refetch after mutation
      refetch();
    },
  });

  // Delete location mutation with success handlers
  const deleteLocationMutation = useLocationDelete();

  // update location mutation with success handlers
  const updateLocationMutation = useLocationUpdate(
    currentLocation?.id || "",
    organizationId
  );

  // Form for editing/adding locations
  const form = useForm<z.infer<typeof LocationFormSchema>>({
    resolver: zodResolver(LocationFormSchema),
    defaultValues: {
      name: "",
      type: undefined,
      email: "",
      phone: "",
      address: "",
    },
  });

  // Update form when current location changes
  useEffect(() => {
    if (currentLocation) {
      form.reset({
        name: currentLocation.name,
        type: currentLocation.type,
        email: currentLocation.email || "",
        phone: currentLocation.phone || "",
        address: currentLocation.address || "",
      });
    } else {
      form.reset({
        name: "",
        type: undefined,
        email: "",
        phone: "",
        address: "",
      });
    }
  }, [currentLocation, form]);

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
  const handleExport = async (filteredLocations: LocationDTO[]) => {
    setIsExporting(true);
    try {
      // Prepare data for export
      const exportData = filteredLocations.map((location) => ({
        "Location Name": location.name,
        Type: location.type,
        Email: location.email,
        Phone: location.phone,
        Address: location.address,
        Active: location.isActive ? "Yes" : "No",
        "Date Added": formatDate(location.createdAt),
      }));

      // Create workbook and worksheet
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Locations");

      // Generate filename with current date
      const fileName = `Locations_${format(new Date(), "yyyy-MM-dd")}.xlsx`;

      // Export to file
      XLSX.writeFile(workbook, fileName);

      toast.success("Export successful", {
        description: `Locations exported to ${fileName}`,
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
    setCurrentLocation(null); // Reset current location
    setFormDialogOpen(true);
  };

  // Handle edit click
  const handleEditClick = (location: LocationDTO) => {
    setCurrentLocation(location);
    setFormDialogOpen(true);
  };

  // Handle delete click
  const handleDeleteClick = (location: LocationDTO) => {
    setCurrentLocation(location);
    setLocationToDelete(location);
    setDeleteDialogOpen(true);
  };

  // Handle delete confirmation
  const handleConfirmDelete = async () => {
    if (locationToDelete?.id) {
      try {
        await deleteLocationMutation.mutateAsync(locationToDelete.id);
        setDeleteDialogOpen(false);
        refetch();
      } catch (error) {
        console.error("Error deleting location:", error);
      }
    }
  };

  const onSubmit = async (data: z.infer<typeof LocationFormSchema>) => {
    setIsSubmitting(true);

    try {
      if (!currentLocation) {
        // --- Create New Location Flow ---
        const newLocationData = {
          ...data,
          organizationId,
          isActive: true,
        };

        await createLocationMutation.mutateAsync(newLocationData);
        toast.success("Location created successfully!");
        resetFormAndCloseModal();
        refetch();
      } else {
        // --- Update Existing Location Flow ---
        const updatePayload = {
          ...currentLocation,
          ...data,
          organizationId,
          updatedAt: new Date(),
          isActive: currentLocation?.isActive ?? true,
        };

        await updateLocationMutation.mutateAsync(updatePayload);
        toast.success("Location updated successfully!");
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
    if (!text) return "";
    if (text.length > length) {
      return text.slice(0, length) + "...";
    }
    return text;
  };

  // Get location type display name
  const getLocationTypeDisplay = (type: LocationType) => {
    const typeMap = {
      [LocationType.SHOP]: "Shop",
      [LocationType.WAREHOUSE]: "Warehouse",
      [LocationType.OFFICE]: "Office",
      [LocationType.VIRTUAL]: "Virtual",
    };
    return typeMap[type] || type;
  };

  // Define columns for the data table
  const columns: Column<LocationDTO>[] = [
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
      header: "Type",
      accessorKey: "type",
      cell: (row) => (
        <span className="line-clamp-1">{getLocationTypeDisplay(row.type)}</span>
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
          {truncatedText(row.phone || "", 20)}
        </span>
      ),
    },
    {
      header: "Address",
      accessorKey: "address",
      cell: (row) => (
        <span className="line-clamp-1">
          {truncatedText(row.address || "", 20)}
        </span>
      ),
    },
    {
      header: "Status",
      accessorKey: "isActive",
      cell: (row) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            row.isActive
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {row.isActive ? "Active" : "Inactive"}
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
  const getSubtitle = (locationCount: number) => {
    return `${locationCount} locations`;
  };

  return (
    <div>
      <DataTable<LocationDTO>
        title={title}
        emptyStateModalTitle="Your Location List is Empty"
        emptyStateModalDescription="Create your first Location to get started with inventory management."
        subtitle={
          locationsData?.length > 0
            ? getSubtitle(locationsData.length)
            : undefined
        }
        data={locationsData}
        columns={columns}
        keyField="id"
        isLoading={false} // With Suspense, we're guaranteed to have data
        onRefresh={refetch}
        actions={{
          onAdd: handleAddClick,
          onExport: handleExport,
        }}
        filters={{
          searchFields: ["name", "address"],
          enableDateFilter: true,
          getItemDate: (location) => new Date(location.createdAt || new Date()),
        }}
        renderRowActions={(location) => (
          <TableActions.RowActions
            onEdit={() => handleEditClick(location)}
            onDelete={() => handleDeleteClick(location)}
          />
        )}
      />
      {/* Location Form Dialog */}
      <EntityForm
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        title={currentLocation ? "Edit Location" : "Add New Location"}
        form={form}
        onSubmit={onSubmit}
        isSubmitting={
          createLocationMutation.isPending || updateLocationMutation.isPending
        }
        submitLabel={currentLocation ? "Save Changes" : "Add Location"}
        size="md"
      >
        <div className="col-span-1 md:col-span-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter location name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location Type</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select location type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={LocationType.SHOP}>Shop</SelectItem>
                  <SelectItem value={LocationType.WAREHOUSE}>
                    Warehouse
                  </SelectItem>
                  <SelectItem value={LocationType.OFFICE}>Office</SelectItem>
                  <SelectItem value={LocationType.VIRTUAL}>Virtual</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

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
      </EntityForm>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Location"
        description={
          locationToDelete ? (
            <>
              Are you sure you want to delete{" "}
              <strong className="text-primary">{locationToDelete.name}</strong>{" "}
              from your locations?
              <br />
              This action cannot be undone.
            </>
          ) : (
            "Are you sure you want to delete this location?"
          )
        }
        onConfirm={handleConfirmDelete}
        isConfirming={deleteLocationMutation.isPending}
        confirmLabel="Delete"
        variant="destructive"
      />
    </div>
  );
}
