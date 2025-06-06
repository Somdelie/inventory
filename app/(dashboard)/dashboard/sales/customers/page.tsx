import { listCustomers } from '@/actions/customers'
import CustomerListing from '@/components/dashboard/customers/CustomerListing'
import SupplierSkeleton from '@/components/dashboard/items/SupplierSkeleton'
import { Skeleton } from '@/components/ui/skeleton'
import { getAuthenticatedUser } from '@/config/useAuth'
import React, { Suspense } from 'react'

const CustomersPage = async () => {
  const user = await getAuthenticatedUser()
  if (!user) {
    return <div>Please log in to view this page.</div>
  }

  const organizationId = user.organizationId
  const customersResult = await listCustomers(organizationId!)
  
  // Handle the response structure from your server action
  const customers = customersResult?.success ? customersResult.customers : []

  return (
    <Suspense fallback={<SupplierSkeleton/>}>
      <CustomerListing 
        title="Customers" 
        organizationId={organizationId!}
        customers={customers || []}
      />
    </Suspense>
  )
}

export default CustomersPage