import BulkStockAdjustmentForm from '@/components/dashboard/adjustment/BulkStockAdjustmentForm'
import { getAuthenticatedUser } from '@/config/useAuth'
import Link from 'next/link'
import React from 'react'

export default async function CreateStockAdjustmentPage() {
  const user = await getAuthenticatedUser()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="">
        {user.organizationId ? (
          <BulkStockAdjustmentForm 
            organizationId={user.organizationId}
            currentUserId={user.id}
          />
        ) : (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6">
            <h3 className="text-lg font-medium text-destructive mb-2">
              Organization Required
            </h3>
            <p className="text-destructive mb-4">
              You need to be part of an organization to create stock adjustments.
            </p>
            <Link 
              href="/setup/organization"
              className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Setup Organization
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}