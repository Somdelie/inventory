"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

interface PaginationProps {
  totalItems: number;
  itemsPerPage: number;
  currentPage?: number;
  siblingCount?: number;
}

export function Pagination({
  totalItems,
  itemsPerPage,
  currentPage: propCurrentPage = 1,
  siblingCount = 1,
}: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get page from URL or use default
  const [currentPage, setCurrentPage] = useState(propCurrentPage);
  const [perPage, setPerPage] = useState(itemsPerPage);

  // Update URL when pagination changes
  const createQueryString = useCallback(
    (params: Record<string, string>) => {
      const newSearchParams = new URLSearchParams(searchParams.toString());

      Object.entries(params).forEach(([name, value]) => {
        newSearchParams.set(name, value);
      });

      return newSearchParams.toString();
    },
    [searchParams]
  );

  // Calculate pagination values
  const totalPages = Math.ceil(totalItems / perPage);
  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  // Generate page numbers to display
  const generatePagination = () => {
    const totalPageNumbers = siblingCount * 2 + 3; // siblings + current + first + last

    // If we have fewer pages than needed to show all links
    if (totalPages <= totalPageNumbers) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 1;

    if (!shouldShowLeftDots && shouldShowRightDots) {
      // Show more pages at the beginning
      const leftItemCount = 1 + 2 * siblingCount;
      const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);

      return [...leftRange, "...", totalPages];
    }

    if (shouldShowLeftDots && !shouldShowRightDots) {
      // Show more pages at the end
      const rightItemCount = 1 + 2 * siblingCount;
      const rightRange = Array.from(
        { length: rightItemCount },
        (_, i) => totalPages - rightItemCount + i + 1
      );

      return [1, "...", ...rightRange];
    }

    if (shouldShowLeftDots && shouldShowRightDots) {
      // Show dots on both sides
      const middleRange = Array.from(
        { length: rightSiblingIndex - leftSiblingIndex + 1 },
        (_, i) => leftSiblingIndex + i
      );

      return [1, "...", ...middleRange, "...", totalPages];
    }

    return [];
  };

  const pages = generatePagination();

  // Handle page change
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;

    setCurrentPage(page);
    router.push(
      `${pathname}?${createQueryString({
        page: page.toString(),
        per_page: perPage.toString(),
      })}`,
      { scroll: false }
    );
  };

  // Handle items per page change
  const handlePerPageChange = (value: string) => {
    const newPerPage = Number.parseInt(value);
    setPerPage(newPerPage);

    // Reset to page 1 when changing items per page
    setCurrentPage(1);
    router.push(
      `${pathname}?${createQueryString({
        page: "1",
        per_page: newPerPage.toString(),
      })}`,
      { scroll: false }
    );
  };

  // Initialize from URL params on component mount
  useEffect(() => {
    const page = searchParams.get("page");
    const perPageParam = searchParams.get("per_page");

    if (page) {
      setCurrentPage(Number.parseInt(page));
    }

    if (perPageParam) {
      setPerPage(Number.parseInt(perPageParam));
    }
  }, [searchParams]);

  // If there's only 1 page, don't show pagination
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Rows per page:</span>
        <Select value={perPage.toString()} onValueChange={handlePerPageChange}>
          <SelectTrigger className="h-8 w-[70px]">
            <SelectValue placeholder={perPage.toString()} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">5</SelectItem>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="50">50</SelectItem>
          </SelectContent>
        </Select>
        <span className="hidden sm:inline">
          Showing {Math.min((currentPage - 1) * perPage + 1, totalItems)} to{" "}
          {Math.min(currentPage * perPage, totalItems)} of {totalItems} entries
        </span>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={!canGoPrevious}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Previous page</span>
        </Button>

        {pages.map((page, i) =>
          page === "..." ? (
            <span
              key={`ellipsis-${i}`}
              className="px-3 py-1.5 text-sm text-muted-foreground"
            >
              ...
            </span>
          ) : (
            <Button
              key={`page-${page}`}
              variant={currentPage === page ? "default" : "outline"}
              size="icon"
              className="h-8 w-8"
              onClick={() => handlePageChange(page as number)}
            >
              {page}
              <span className="sr-only">Page {page}</span>
            </Button>
          )
        )}

        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={!canGoNext}
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Next page</span>
        </Button>
      </div>
    </div>
  );
}
