"use client";
import { Checkbox } from "@/components/ui/checkbox";
import DateColumn from "@/components/DataTableColumns/DateColumn";
import SortableColumn from "@/components/DataTableColumns/SortableColumn";
import { ColumnDef } from "@tanstack/react-table";
import ActionColumn from "@/components/DataTableColumns/ActionColumn";
import { TaxDTO } from "@/types/types";

// Custom cell renderer for percentage values
const PercentageCell = ({ value }: { value: number }) => {
  return <span className="pl-2">{value}%</span>;
};

export const columns: ColumnDef<TaxDTO>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <div className="px-0 flex items-center justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="px-0 flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <div className="pl-2">
        <SortableColumn column={column} title="Title" />
      </div>
    ),
    cell: ({ row }) => {
      const name = row.getValue("name") as string;
      return <span className="pl-6">{name}</span>;
    },
  },
  {
    accessorKey: "rate",
    header: ({ column }) => (
      <div className="">
        <SortableColumn column={column} title="Tax Rate" />
      </div>
    ),
    cell: ({ row }) => {
      const rate = row.getValue("rate");
      return (
        <div className="flex items-center md:pl-2">
          <PercentageCell value={rate as number} />
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: () => <span className="pl-2">Date Created</span>,
    cell: ({ row }) => <DateColumn row={row} accessorKey="createdAt" />,
  },
  {
    id: "actions",
    header: () => <div className="flex justify-end pr-2">Actions</div>,
    cell: ({ row }) => {
      const tax = row.original;
      return (
        <div className="flex justify-end pr-2">
          <ActionColumn row={row} model="tax" id={tax.id} editEndpoint={"#"} />
        </div>
      );
    },
  },
];
