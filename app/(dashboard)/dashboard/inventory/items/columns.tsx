"use client";
import { Checkbox } from "@/components/ui/checkbox";

import SortableColumn from "@/components/DataTableColumns/SortableColumn";
import { ColumnDef } from "@tanstack/react-table";
import ActionColumn from "@/components/DataTableColumns/ActionColumn";
import { ItemDTO } from "@/types/itemTypes";

// Change the type from ItemApiResponse to ItemDTO
export const columns: ColumnDef<ItemDTO>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  //thumbnail
  {
    id: "thumbnail",
    cell: ({ row }) => {
      const item = row.original;
      return (
        <img
          src={item.thumbnail ?? ""}
          alt={item.name}
          className="w-16 h-16 object-cover"
        />
      );
    },
  },
  {
    accessorKey: "name",
    header: ({ column }) => <SortableColumn column={column} title="Name" />,
  },
  {
    accessorKey: "sku",
    header: ({ column }) => <SortableColumn column={column} title="SKU" />,
  },
  {
    accessorKey: "category.title",
    header: ({ column }) => <SortableColumn column={column} title="Category" />,
  },
  {
    accessorKey: "brand.name",
    header: ({ column }) => <SortableColumn column={column} title="Brand" />,
  },
  {
    accessorKey: "costPrice",
    header: ({ column }) => <SortableColumn column={column} title="Price" />,
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const item = row.original;
      return (
        <ActionColumn
          row={row}
          model="item"
          editEndpoint={`items/update/${item.id}`}
          id={item.id}
        />
      );
    },
  },
];
