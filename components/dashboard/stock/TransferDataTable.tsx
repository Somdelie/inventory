// components/StockMovementDataTable.tsx
import React from 'react';
import { ArrowUpDown } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Column {
  key: string;
  label: string;
  sortable: boolean;
  render: (item: any) => React.ReactNode;
}

interface StockMovementDataTableProps {
  data: any[];
  columns: Column[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (column: string) => void;
}

const StockMovementDataTable: React.FC<StockMovementDataTableProps> = ({ 
  data, 
  columns, 
  sortBy, 
  sortOrder, 
  onSort 
}) => {

  
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-100">
            {columns.map((column) => (
              <TableHead 
                key={column.key}
                className={`whitespace-nowrap text-left font-semibold text-black ${
                  column.sortable ? 'cursor-pointer hover:bg-gray-200 transition-colors' : ''
                }`}
                onClick={column.sortable && onSort ? () => onSort(column.key) : undefined}
              >
                <div className="flex items-center">
                  {column.label}
                  {column.sortable && (
                    <ArrowUpDown 
                      className={`inline-block ml-1 h-4 w-4 transition-colors ${
                        sortBy === column.key ? 'text-gray-600' : 'text-gray-400'
                      }`} 
                    />
                  )}
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length > 0 ? (
            data.map((item) => (
              <TableRow key={item.id} className="hover:bg-gray-50 transition-colors">
                {columns.map((column) => (
                  <TableCell 
                    key={`${item.id}-${column.key}`}
                    className="py-3"
                  >
                    {column.render(item)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell 
                colSpan={columns.length} 
                className="text-center py-8 text-gray-500"
              >
                No data available
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default StockMovementDataTable;