import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { getItemsByOrganizationId } from "@/actions/item"
import { getAuthenticatedUser } from "@/config/useAuth"
import { getLocationsByOrganizationId } from "@/actions/location"
import { getPurchaseOrderNumber, getPurchaseOrders } from "@/actions/purchase-orders"
import PurchaseOrderForm from "@/components/dashboard/purchases/orders/purchase-order-form"
import { getSuppliersByOrganizationId } from "@/actions/suppliers"

export default async function PurchaseOrderPage() {
  const user = await getAuthenticatedUser()
  const organizationId = user?.organizationId

  if (!organizationId) {
    throw new Error("Organization ID is required")
  }

  // Fetch all required data
// Fetch all required data
const [items, locations, purchaseOrders, poCount, suppliers] = await Promise.all([
  getItemsByOrganizationId(organizationId),
  getLocationsByOrganizationId(organizationId),
  getPurchaseOrders(),
  getPurchaseOrderNumber(organizationId),
  getSuppliersByOrganizationId(organizationId)
]);
  
  return (
      <Suspense fallback={<PurchaseOrderFormSkeleton />}>
        <PurchaseOrderForm
          items={items}
          locations={locations}
          poCount={poCount}
          organizationId={organizationId}
          suppliers={suppliers}
        />
      </Suspense>
 
  )
}

function PurchaseOrderFormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border rounded-md p-4 space-y-4">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="border rounded-md p-4 space-y-4">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" /> 
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
      <div className="border rounded-md p-4 space-y-4">
        <Skeleton className="h-6 w-28" />
        <Skeleton className="h-48 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    </div>
  )
}