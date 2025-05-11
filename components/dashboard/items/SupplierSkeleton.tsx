"use client";

import { cn } from "@/lib/utils";

interface SupplierSkeletonProps {
  count?: number;
  className?: string;
}

const SupplierSkeleton = ({
  count = 5,
  className,
}: SupplierSkeletonProps) => {
  return (
    <div className={cn("space-y-4", className)}>
      {/* Header Skeleton */}
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-muted rounded-md animate-pulse" />
          <div className="flex space-x-4">
            <div className="h-4 w-24 bg-muted rounded-md animate-pulse" />
            <div className="h-4 w-32 bg-muted rounded-md animate-pulse" />
          </div>
        </div>
        <div className="h-9 w-28 bg-muted rounded-md animate-pulse" />
      </div>

      {/* Supplier Items Skeleton */}
      <div className="rounded-lg border">
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className={cn(
              "p-4 flex items-center justify-between",
              index !== count - 1 && "border-b"
            )}
          >
            <div className="flex items-center space-x-3">
              <div className="h-5 w-5 rounded-md bg-muted animate-pulse" />
              <div className="h-5 w-36 bg-muted rounded-md animate-pulse" />
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-8 w-16 bg-muted rounded-md animate-pulse" />
              <div className="h-8 w-16 bg-muted rounded-md animate-pulse" />
            </div>
          </div>
        ))}
      </div>
      
      {/* Empty state when loading */}
      {count === 0 && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="h-10 w-10 rounded-full bg-muted animate-pulse mb-4" />
          <div className="h-5 w-48 bg-muted rounded-md animate-pulse mb-2" />
          <div className="h-4 w-64 bg-muted rounded-md animate-pulse" />
        </div>
      )}
    </div>
  );
};

export default SupplierSkeleton;