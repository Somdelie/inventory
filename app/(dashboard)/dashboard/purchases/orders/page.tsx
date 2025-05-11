import { getItemsByOrganizationId } from "@/actions/item"
import { getLocationsByOrganizationId } from "@/actions/location"
import { getPurchaseOrderCount, getPurchaseOrderNumber, getPurchaseOrders } from "@/actions/purchase-orders"
import PurchaseOrdersLayout from "@/components/dashboard/purchases/orders/purchase-orders-layout"
import { Button } from "@/components/ui/button"
import { getAuthenticatedUser } from "@/config/useAuth"
import { Plus } from "lucide-react"
import Link from "next/link"

export default async function PurchaseOrdersPage() {
  // Get user and organization data
  const user = await getAuthenticatedUser()
  const organizationId = user?.organizationId

  if (!organizationId) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Organization not found</p>
      </div>
    )
  }

 // Fetch all required data
  const [items, locations, purchaseOrders, poCount] = await Promise.all([
    getItemsByOrganizationId(organizationId),
    getLocationsByOrganizationId(organizationId),
    getPurchaseOrders(),
    getPurchaseOrderCount(organizationId), // Updated function name
  ])

  return (
    <div className="flex flex-col h-full ">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-xl font-bold">Purchased Orders</h1>
        <Link href="/dashboard/purchases/orders/create">
        <Button
        >
          <Plus className="h-4 w-4"/>
          Create Purchase Order
        </Button>
        </Link>
      </div>
      <div className="flex-1 overflow-hidden">
        <PurchaseOrdersLayout
          purchaseOrders={purchaseOrders}
          items={items}
          locations={locations}
          organizationId={organizationId}
          poCount={poCount}
        />
      </div>
    </div>
  )
}
