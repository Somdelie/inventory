import { getGoodsReceiptCount, getGoodsReceipts } from "@/actions/goods-receipts"
import { getItemsByOrganizationId } from "@/actions/item"
import { getLocationsByOrganizationId } from "@/actions/location"
import GoodsReceiptsLayout from "@/components/dashboard/purchases/goods-receipt/goods-receipts-layout"
import { Button } from "@/components/ui/button"
import { getAuthenticatedUser } from "@/config/useAuth"
import { db } from "@/prisma/db"
import { Plus } from "lucide-react"
import Link from "next/link"

// Function to get purchase orders for multiple goods receipts
async function getPurchaseOrdersByGoodsReceiptIds(goodsReceiptIds: string[]) {
  try {
    // Use Prisma to find purchase orders for multiple goods receipts
    const goodsReceiptsWithPurchaseOrders = await db.goodsReceipt.findMany({
      where: {
        id: {
          in: goodsReceiptIds, // Use 'in' operator to match any ID in the array
        },
      },
      include: {
        purchaseOrder: {
          include: {
            supplier: true,
          },
        },
      },
    });

    // Create a map of goods receipt ID to purchase order
    const purchaseOrderMap = goodsReceiptsWithPurchaseOrders.reduce((map, gr) => {
      if (gr.purchaseOrder) {
        map[gr.id] = gr.purchaseOrder;
      }
      return map;
    }, {} as Record<string, any>);

    return purchaseOrderMap;
  } catch (error) {
    console.error("Error fetching purchase orders by goods receipt IDs:", error);
    return {};
  }
}

export default async function GoodsReceiptPage() {
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
  const [items, locations, goodsReceipts, grCount] = await Promise.all([
    getItemsByOrganizationId(organizationId),
    getLocationsByOrganizationId(organizationId),
    getGoodsReceipts(),
    getGoodsReceiptCount(organizationId),
  ])

  // Extract all goods receipt IDs
  const goodsReceiptIds = goodsReceipts.map((gr) => gr.id)
  
  // Get purchase orders for all goods receipts
  const purchaseOrderMap = await getPurchaseOrdersByGoodsReceiptIds(goodsReceiptIds)
  
  // Enhance goods receipts with purchase order data if needed
  const enhancedGoodsReceipts = goodsReceipts.map(gr => ({
    ...gr,
    // Add the purchase order from our map if not already included
    enhancedPurchaseOrder: !gr.purchaseOrder ? purchaseOrderMap[gr.id] : gr.purchaseOrder 
  }))

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-xl font-bold">Goods Receipts</h1>
        <Link href="/dashboard/inventory/receipts/create">
          <Button>
            <Plus className="h-4 w-4 mr-2"/>
            Create Goods Receipt
          </Button>
        </Link>
      </div>
      <div className="flex-1 overflow-hidden">
        <GoodsReceiptsLayout
          goodsReceipts={enhancedGoodsReceipts}
          items={items}
          locations={locations}
          organizationId={organizationId}
          grCount={grCount}
        />
      </div>
    </div>
  )
}