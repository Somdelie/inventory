// components/ui/data-table/table-actions.tsx
"use client";

import { useState } from "react";
import { Plus, Edit, Trash2, FileSpreadsheet, Loader2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import clsx from "clsx";

interface ActionButtonProps {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  buttonTitle?: string; // Optional prop for button title
}

// Add Button
const AddButton = ({
  onClick,
  disabled = false,
  loading = false,
  className = "",
  buttonTitle = "Item",
}: ActionButtonProps) => (
  <Button
    onClick={onClick}
    disabled={disabled || loading}
    className={className}
  >
    {loading ? (
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
    ) : (
      <Plus className="mr-2 h-4 w-4" />
    )}
    Add New {buttonTitle}
  </Button>
);

// View Button
const ViewButton = ({
  onClick,
  disabled = false,
  loading = false,
  className = "",
}: ActionButtonProps) => (
  <Button
    variant="outline"
    size="icon"
    onClick={onClick}
    disabled={disabled || loading}
    title="View"
    className={className}
  >
    {loading ? (
      <Loader2 className="h-4 w-4 animate-spin" />
    ) : (
      <Eye className="h-4 w-4" />
    )}
  </Button>
);

// Edit Button
const EditButton = ({
  onClick,
  disabled = false,
  loading = false,
  className = "",
}: ActionButtonProps) => (
  <Button
    variant="outline"
    size="icon"
    onClick={onClick}
    disabled={disabled || loading}
    title="Edit"
    className={className}
  >
    {loading ? (
      <Loader2 className="h-4 w-4 animate-spin" />
    ) : (
      <Edit className="h-4 w-4" />
    )}
  </Button>
);

// Delete Button
const DeleteButton = ({
  onClick,
  disabled = false,
  loading = false,
  className = "",
}: ActionButtonProps) => (
  <Button
    variant="outline"
    size="icon"
    onClick={onClick}
    disabled={disabled || loading}
    title="Delete"
    className={clsx("text-destructive", className)}
  >
    {loading ? (
      <Loader2 className="h-4 w-4 animate-spin" />
    ) : (
      <Trash2 className="h-4 w-4" />
    )}
  </Button>
);

// Export Button
const ExportButton = ({
  onClick,
  disabled = false,
  loading = false,
  className = "",
}: ActionButtonProps) => {
  return (
    <Button
      variant="outline"
      onClick={onClick}
      disabled={disabled || loading}
      className={className}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Exporting...
        </>
      ) : (
        <>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Export
        </>
      )}
    </Button>
  );
};

// Row Actions
const RowActions = ({
  onView,
  onEdit,
  onDelete,
  isDeleting = false,
}: {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  isDeleting?: boolean;
}) => {
  return (
    <div className="flex justify-end gap-2">
      {onView && <ViewButton onClick={onView} />}
      {onEdit && <EditButton onClick={onEdit} />}
      {onDelete && <DeleteButton onClick={onDelete} loading={isDeleting} />}
    </div>
  );
};

// Export the components as a single object
const TableActions = {
  AddButton,
  ViewButton,
  EditButton,
  DeleteButton,
  ExportButton,
  RowActions,
};

export default TableActions;