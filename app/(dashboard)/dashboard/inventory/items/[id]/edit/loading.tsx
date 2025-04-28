import { ArrowLeft, FileText, Package, Tag } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { TableLoading } from "@/components/ui/data-table";

export default function ItemEditSkeleton() {
  return (
    <div className="space-y-2 min-h-screen">
      {/* Back link skeleton */}
      <div className="inline-flex items-center gap-1 text-sm text-muted-foreground mb-2">
        <ArrowLeft className="h-4 w-4" />
        <span>Items / Edit</span>
      </div>

      {/* Product name skeleton */}
      <div className="mb-1">
        <Skeleton className="h-7 w-48" />
      </div>

      {/* SKU and Last Updated skeleton */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-1">
          <span className="text-sm font-medium text-muted-foreground">
            SKU:
          </span>
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex items-center gap-1">
          <span className="text-sm font-medium text-muted-foreground">
            Last Updated:
          </span>
          <Skeleton className="h-4 w-40" />
        </div>
      </div>

      {/* Tabs skeleton */}
      <div className="grid grid-cols-3 gap-2">
        <div className="flex items-center justify-center gap-2 h-10 bg-red-500 text-white rounded-md">
          <FileText className="h-4 w-4" />
          <span>Basic Information</span>
        </div>
        <div className="flex items-center justify-center gap-2 h-10 bg-gray-100 rounded-md">
          <Tag className="h-4 w-4" />
          <span className="text-gray-700">Inventory & Pricing</span>
        </div>
        <div className="flex items-center justify-center gap-2 h-10 bg-gray-100 rounded-md">
          <Package className="h-4 w-4" />
          <span className="text-gray-700">Product Details</span>
        </div>
      </div>

      {/* Form content skeleton */}
      <TableLoading />
    </div>
  );
}
