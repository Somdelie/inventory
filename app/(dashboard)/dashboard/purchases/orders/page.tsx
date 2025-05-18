import { getItemsByOrganizationId } from "@/actions/item"
import { getLocationsByOrganizationId } from "@/actions/location"
import { getPurchaseOrderCount, getPurchaseOrders } from "@/actions/purchase-orders"
import PurchaseOrdersLayout from "@/components/dashboard/purchases/orders/purchase-orders-layout"
import { Button } from "@/components/ui/button"
import { getAuthenticatedUser } from "@/config/useAuth"
import { db } from "@/prisma/db"
import { Plus } from "lucide-react"
import Link from "next/link"

// First, add this function to get suppliers for multiple purchase orders
async function getSuppliersByPurchaseOrderIds(purchaseOrderIds: string[]) {
  try {
    // Use Prisma to find suppliers for multiple purchase orders
    const purchaseOrdersWithSuppliers = await db.purchaseOrder.findMany({
      where: {
        id: {
          in: purchaseOrderIds, // Use 'in' operator to match any ID in the array
        },
      },
      include: {
        supplier: true,
      },
    });

    // Create a map of purchase order ID to supplier
    const supplierMap = purchaseOrdersWithSuppliers.reduce((map, po) => {
      if (po.supplier) {
        map[po.id] = po.supplier;
      }
      return map;
    }, {} as Record<string, any>);

    return supplierMap;
  } catch (error) {
    console.error("Error fetching suppliers by purchase order IDs:", error);
    return {};
  }
}

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
    getPurchaseOrderCount(organizationId),
  ])

  // Extract all purchase order IDs
  const purchaseOrderIds = purchaseOrders.map((po) => po.id)
  
  // Get suppliers for all purchase orders
  const supplierMap = await getSuppliersByPurchaseOrderIds(purchaseOrderIds)
  
  // Now supplierMap contains suppliers indexed by purchase order ID
  // console.log("Supplier id:", supplierMap.id)

  // Enhance purchase orders with supplier data if needed
  const enhancedPurchaseOrders = purchaseOrders.map(po => ({
    ...po,
    // Add the supplier from our map if not already included
    enhancedSupplier: !po.supplier ? supplierMap[po.id] : po.supplier 
  }))

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-xl font-bold">Purchase Orders</h1>
        <Link href="/dashboard/purchases/orders/create">
          <Button>
            <Plus className="h-4 w-4 mr-2"/>
            Create Purchase Order
          </Button>
        </Link>
      </div>
      <div className="flex-1 overflow-hidden">
        <PurchaseOrdersLayout
          purchaseOrders={enhancedPurchaseOrders}
          items={items}
          locations={locations}
          organizationId={organizationId}
          poCount={poCount}
        />
      </div>
    </div>
  )
}