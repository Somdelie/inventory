"use client"

import { Suspense, useState } from "react"
import PurchaseOrderList from "./purchase-order-list"
import PurchaseOrderDetail from "./purchase-order-detail"
import type { PurchaseOrder } from "@prisma/client"
import type { Item } from "@/types/itemTypes"
import type { LocationDTO } from "@/types"
import { Skeleton } from "@/components/ui/skeleton"

interface PurchaseOrdersLayoutProps {
  purchaseOrders: PurchaseOrder[]
  items?: Item[]
  locations?: LocationDTO[]
  organizationId?: string
  poCount?: number
}

export default function PurchaseOrdersLayout({
  purchaseOrders,
  items = [],
  locations = [],
  organizationId = "",
  poCount = 0,
}: PurchaseOrdersLayoutProps) {
  // Use the first purchase order ID as default selected if available
  const defaultSelectedOrder = purchaseOrders.length > 0 ? purchaseOrders[0].id : ""
  const [selectedOrder, setSelectedOrder] = useState(defaultSelectedOrder)

  const selectedOrderData = purchaseOrders.find((order) => order.id === selectedOrder)

  const handleOrderClick = (orderId: string) => {
    setSelectedOrder(orderId)
  }

  return (
    <Suspense fallback={<Skeleton/>}> <div className="grid grid-cols-1 md:grid-cols-3 border overflow-hidden">
      <div className="md:col-span-1 border-r">
        <PurchaseOrderList
          purchaseOrders={purchaseOrders}
          selectedOrder={selectedOrder}
          onOrderClick={handleOrderClick}
          items={items}
          locations={locations}
          organizationId={organizationId}
          poCount={poCount}
        />
      </div>
      <div className="md:col-span-2">{selectedOrderData && <PurchaseOrderDetail orderData={selectedOrderData} />}</div>
    </div></Suspense>
   
  )
}
