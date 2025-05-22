"use client"

import { Suspense, useState } from "react"
import type { GoodsReceipt } from "@prisma/client"
import type { Item } from "@/types/itemTypes"
import type { LocationDTO } from "@/types"
import { Skeleton } from "@/components/ui/skeleton"
import GoodsReceiptList from "./goods-receipt-list"
import GoodsReceiptDetail from "./goods-receipt-detail"

interface GoodsReceiptsLayoutProps {
  goodsReceipts: GoodsReceipt[]
  items?: Item[]
  locations?: LocationDTO[]
  organizationId?: string
  grCount?: number
}

export default function GoodsReceiptsLayout({
  goodsReceipts,
  items = [],
  locations = [],
  organizationId = "",
  grCount = 0,
}: GoodsReceiptsLayoutProps) {
  // Use the first goods receipt ID as default selected if available
  const defaultSelectedReceipt = goodsReceipts.length > 0 ? goodsReceipts[0].id : ""
  const [selectedReceipt, setSelectedReceipt] = useState(defaultSelectedReceipt)

  const selectedReceiptData = goodsReceipts.find((receipt) => receipt.id === selectedReceipt)

  console.log("Selected Receipt Data:", selectedReceiptData)

  const handleReceiptClick = (receiptId: string) => {
    setSelectedReceipt(receiptId)
  }

  return (
    <Suspense fallback={<Skeleton/>}> 
      <div className="grid grid-cols-1 md:grid-cols-3 border overflow-hidden">
        <div className="md:col-span-1 border-r">
          <GoodsReceiptList
            goodsReceipts={goodsReceipts}
            selectedReceipt={selectedReceipt}
            onReceiptClick={handleReceiptClick}
            items={items}
            locations={locations}
            organizationId={organizationId}
            grCount={grCount}
          />
        </div>
        <div className="md:col-span-2">
          {selectedReceiptData && <GoodsReceiptDetail receiptData={selectedReceiptData} />}
        </div>
      </div>
    </Suspense>
  )
}