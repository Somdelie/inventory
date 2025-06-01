// app/dashboard/inventory/adjustments/StockAdjustmentsContent.tsx
import React from 'react'
import { getStockAdjustments } from '@/actions/stock-adjustments'
import StockAdjustmentsDataTable from '@/components/dashboard/adjustment/StockAdjustmentsDataTable'

interface StockAdjustmentsContentProps {
  currentUserId: string
}

export default async function StockAdjustmentsContent({ 
  currentUserId 
}: StockAdjustmentsContentProps) {
  // Fetch all adjustments (DataTable will handle pagination client-side)
  const adjustmentsResult = await getStockAdjustments(1, 1000)

  if (!adjustmentsResult.success) {
    return (
      <div className="">
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <div className="flex items-center space-x-2">
            <div className="h-4 w-4 rounded-full bg-destructive flex-shrink-0" />
            <div>
              <h3 className="font-medium text-destructive">
                Failed to load adjustments
              </h3>
              <p className="text-sm text-destructive/80 mt-1">
                {adjustmentsResult.error}
              </p>
            </div>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="mt-3 px-3 py-1 text-sm bg-destructive text-destructive-foreground rounded hover:bg-destructive/90"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <StockAdjustmentsDataTable 
      data={adjustmentsResult.data?.adjustments ?? []}
      currentUserId={currentUserId}
    />
  )
}