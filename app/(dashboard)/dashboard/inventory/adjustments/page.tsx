// app/dashboard/inventory/adjustments/page.tsx
import React, { Suspense } from 'react'
import { getAuthenticatedUser } from '@/config/useAuth'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import StockAdjustmentsContent from '@/components/dashboard/adjustment/StockAdjustmentsContent'

export const metadata = {
  title: 'Stock Adjustments | Inventory Pro',
  description: 'Manage inventory adjustments and stock corrections'
}

// Loading component for the DataTable
function StockAdjustmentsLoading() {
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" /> {/* Title */}
          <Skeleton className="h-4 w-72" /> {/* Subtitle */}
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-20" /> {/* Refresh button */}
          <Skeleton className="h-9 w-32" /> {/* New Adjustment button */}
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Search bar skeleton */}
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-9 w-64" /> {/* Search input */}
          <div className="flex gap-2">
            <Skeleton className="h-9 w-24" /> {/* Date filter */}
            <Skeleton className="h-9 w-20" /> {/* Export button */}
          </div>
        </div>
        
        {/* Table skeleton */}
        <div className="space-y-3">
          {/* Table header */}
          <div className="flex items-center space-x-4 p-4 border rounded-lg bg-muted/50">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-4 flex-1" />
            ))}
          </div>
          
          {/* Table rows */}
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
              {Array.from({ length: 8 }).map((_, j) => (
                <Skeleton key={j} className="h-4 flex-1" />
              ))}
            </div>
          ))}
        </div>
        
        {/* Pagination skeleton */}
        <div className="flex items-center justify-between mt-4">
          <Skeleton className="h-8 w-32" /> {/* Rows per page */}
          <div className="flex items-center gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-8" />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default async function StockAdjustmentsPage() {
  const user = await getAuthenticatedUser()

  return (
    <div className="">
      <Suspense fallback={<StockAdjustmentsLoading />}>
        <StockAdjustmentsContent currentUserId={user.id} />
      </Suspense>
    </div>
  )
}