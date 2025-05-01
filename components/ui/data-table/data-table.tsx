"use client";

import { useState, useEffect, ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import FilterBar from "./filter-bar";
import TableActions from "./table-actions";
import RowsPerPage from "./rows-per-page";
import { DateFilterOption, DateRange } from "./date-filter";
import EmptyState from "@/components/global/EmptyState";
import CustomBinIcon from "@/components/global/CustomBinIcon";

export interface Column<T> {
  header: string;
  accessorKey: keyof T | ((row: T) => any);
  cell?: (row: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  title: string;
  buttonTitle?: string;
  subtitle?: string;
  emptyStateModalTitle?: string;
  emptyStateModalDescription?: string;
  data: T[];
  columns: Column<T>[];
  keyField: keyof T;
  isLoading?: boolean;
  onRefresh?: () => void;
  actions?: {
    onAdd?: () => void;
    onEdit?: (item: T) => void;
    onDelete?: (item: T) => void;
    onExport?: (filteredData: T[]) => void;
    additionalActions?: ReactNode;
  };
  filters?: {
    searchFields?: (keyof T)[];
    enableDateFilter?: boolean;
    getItemDate?: (item: T) => Date | string;
    additionalFilters?: ReactNode;
  };
  renderRowActions?: (item: T) => ReactNode;
  emptyState?: ReactNode;
  rowClassName?: (item: T) => string;
  onRowClick?: (item: T) => void;
  pagination?: {
    defaultItemsPerPage?: number;
    itemsPerPageOptions?: number[];
  };
}

export default function DataTable<T>({
  title,
  buttonTitle,
  emptyStateModalTitle,
  emptyStateModalDescription,
  subtitle,
  data,
  columns,
  keyField,
  isLoading = false,
  onRefresh,
  actions,
  filters,
  renderRowActions,
  emptyState,
  rowClassName,
  onRowClick,
  pagination = {
    defaultItemsPerPage: 5,
    itemsPerPageOptions: [5, 10, 25, 50, 100],
  },
}: DataTableProps<T>) {
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(
    pagination.defaultItemsPerPage ?? 5
  );

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState<{
    range: DateRange | null;
    option: DateFilterOption;
  }>({
    range: null,
    option: "lifetime",
  });

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, dateFilter, itemsPerPage]);

  // Apply search filter
  const applySearchFilter = (data: T[]): T[] => {
    if (!searchQuery.trim() || !filters?.searchFields?.length) return data;

    const query = searchQuery.toLowerCase();
    return data.filter((data) => {
      return filters.searchFields!.some((field) => {
        const value = data[field];
        if (value === null || value === undefined) return false;
        return String(value).toLowerCase().includes(query);
      });
    });
  };

  // Apply date filter
  const applyDateFilter = (data: T[]): T[] => {
    if (
      !dateFilter.range?.from ||
      !dateFilter.range?.to ||
      !filters?.getItemDate
    ) {
      return data;
    }

    const from = new Date(dateFilter.range.from);
    const to = new Date(dateFilter.range.to);

    // Add one day to 'to' date to include the end date in the filter
    to.setDate(to.getDate() + 1);

    return data.filter((data) => {
      const itemDate = new Date(filters.getItemDate!(data));
      return itemDate >= from && itemDate < to;
    });
  };

  // Apply all filters
  const filteredData = applyDateFilter(applySearchFilter(data));

  // Calculate pagination
  const totalPages = Math.ceil(filteredData?.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData?.slice(indexOfFirstItem, indexOfLastItem);

  // Handle page change
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = [];

    if (totalPages <= 5) {
      // Show all pages if 5 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Show first page, current page and neighbors, and last page
      if (currentPage <= 3) {
        // Near the beginning
        for (let i = 1; i <= 4; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push("ellipsis");
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Near the end
        pageNumbers.push(1);
        pageNumbers.push("ellipsis");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        // Middle
        pageNumbers.push(1);
        pageNumbers.push("ellipsis");
        pageNumbers.push(currentPage - 1);
        pageNumbers.push(currentPage);
        pageNumbers.push(currentPage + 1);
        pageNumbers.push("ellipsis");
        pageNumbers.push(totalPages);
      }
    }

    return pageNumbers;
  };

  // Get value from accessorKey (which could be a string or function)
  const getCellValue = (item: T, accessor: keyof T | ((row: T) => any)) => {
    if (typeof accessor === "function") {
      return accessor(item);
    }
    return item[accessor];
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-2xl">{title}</CardTitle>
          {subtitle && <p className="text-muted-foreground mt-1">{subtitle}</p>}
          {filters && !subtitle && (
            <p className="text-muted-foreground mt-1">
              {filteredData?.length}{" "}
              {filteredData?.length === 1 ? "item" : "items"}
              {dateFilter?.option !== "lifetime" && <> | Date filter applied</>}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onRefresh && (
            <Button
              variant="outline"
              size="icon"
              onClick={onRefresh}
              disabled={isLoading}
              title="Refresh data"
            >
              <RefreshCw
                className={cn("h-4 w-4", isLoading && "animate-spin")}
              />
            </Button>
          )}
          {actions?.additionalActions}
          {actions?.onAdd && (
            <TableActions.AddButton
              onClick={actions.onAdd}
              buttonTitle={buttonTitle}
            />
          )}
        </div>
      </CardHeader>

      <CardContent>
        {data.length === 0 && !isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            {emptyState || (
              <EmptyState
                message={emptyStateModalTitle}
                description={emptyStateModalDescription}
                icon="custom"
                customIcon={<CustomBinIcon />}
              />
            )}
          </div>
        ) : (
          <>
            {/* Filter bar */}
            {filters && (
              <FilterBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                showDateFilter={filters.enableDateFilter}
                dateFilter={dateFilter}
                onDateFilterChange={(range, option) =>
                  setDateFilter({ range, option })
                }
                additionalFilters={filters.additionalFilters}
                onExport={
                  actions?.onExport
                    ? () => actions?.onExport?.(filteredData)
                    : undefined
                }
              />
            )}

            {/* Table */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {columns.map((column, index) => (
                      <TableHead key={index} className={column.className}>
                        {column.header}
                      </TableHead>
                    ))}
                    {renderRowActions && (
                      <TableHead className="text-right">Actions</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentItems?.length > 0 ? (
                    currentItems.map((item) => (
                      <TableRow
                        key={String(item[keyField])}
                        className={cn(
                          rowClassName && rowClassName(item),
                          onRowClick && "cursor-pointer hover:bg-muted/50"
                        )}
                        onClick={
                          onRowClick ? () => onRowClick(item) : undefined
                        }
                      >
                        {columns.map((column, index) => (
                          <TableCell key={index} className={column.className}>
                            {column.cell
                              ? column.cell(item)
                              : getCellValue(item, column.accessorKey)}
                          </TableCell>
                        ))}
                        {renderRowActions && (
                          <TableCell className="text-right">
                            {renderRowActions(item)}
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length + (renderRowActions ? 1 : 0)}
                        className="text-center py-6"
                      >
                        {emptyState ||
                          (searchQuery || dateFilter.option !== "lifetime"
                            ? "No matching items found for the selected filters"
                            : "No items found")}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {filteredData?.length > 0 && (
              <div className="mt-4 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex flex-col md:flex-row md:items-center gap-2 w-full md:w-auto">
                  <RowsPerPage
                    value={itemsPerPage}
                    onChange={setItemsPerPage}
                    options={
                      pagination.itemsPerPageOptions || [5, 10, 25, 50, 100]
                    }
                  />
                  <div className="text-sm text-muted-foreground">
                    Showing {indexOfFirstItem + 1}-
                    {Math.min(indexOfLastItem, filteredData.length)} of{" "}
                    {filteredData.length}
                  </div>
                </div>

                {totalPages > 1 && (
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() =>
                            handlePageChange(Math.max(1, currentPage - 1))
                          }
                          className={cn(
                            currentPage === 1
                              ? "pointer-events-none opacity-50"
                              : "cursor-pointer"
                          )}
                        />
                      </PaginationItem>

                      {getPageNumbers().map((page, index) =>
                        page === "ellipsis" ? (
                          <PaginationItem key={`ellipsis-${index}`}>
                            <PaginationEllipsis />
                          </PaginationItem>
                        ) : (
                          <PaginationItem key={`page-${page}`}>
                            <PaginationLink
                              onClick={() => handlePageChange(page as number)}
                              className={cn(
                                currentPage === page
                                  ? "bg-primary text-primary-foreground"
                                  : "cursor-pointer"
                              )}
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        )
                      )}

                      <PaginationItem>
                        <PaginationNext
                          onClick={() =>
                            handlePageChange(
                              Math.min(totalPages, currentPage + 1)
                            )
                          }
                          className={cn(
                            currentPage === totalPages
                              ? "pointer-events-none opacity-50"
                              : "cursor-pointer"
                          )}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
