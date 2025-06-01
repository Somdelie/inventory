// app/dashboard/inventory/adjustments/[id]/page.tsx
import { getStockAdjustmentById } from '@/actions/stock-adjustments'
import AdjustmentDetailView from '@/components/dashboard/adjustment/AdjustmentDetailView'
import { Skeleton } from '@/components/ui/skeleton'
import { getAuthenticatedUser } from '@/config/useAuth'
import { transformAdjustmentData } from '@/lib/transformers'
import { notFound } from 'next/navigation'
import React, { Suspense } from 'react'

const SingleAdjustmentPage = async ({
    params
}: {
    params: Promise<{ id: string }>
}) => {
    const { id } = await params

    const user = await getAuthenticatedUser()
  
    if (!user) {
        return notFound()
    }

    // Fetch the adjustment data (server-side)
    const result = await getStockAdjustmentById(id)
  
    if (!result.success || !result.data) {
        return notFound()
    }

    const rawAdjustment = result.data

    // Make sure the adjustment belongs to the user's organization
    if (rawAdjustment.organizationId !== user.organizationId) {
        return notFound()
    }

    // Transform the data using the utility function
    const adjustment = transformAdjustmentData(rawAdjustment)

    return (
      <Suspense fallback={<Skeleton />}>
        <AdjustmentDetailView 
            adjustment={adjustment}
            currentUserId={user.id}
            canApprove={true} // Set based on your role system
        />
      </Suspense>
    )
}

export default SingleAdjustmentPage