"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Check, X } from "lucide-react"
import { useGoodsReceiptLineItems } from "@/hooks/useGoodsReceiptQueries"
import { formatPrice } from "@/lib/formatPrice"

interface GoodsReceiptLineTableProps {
  goodsReceiptId: string
}

export default function GoodsReceiptLineTable({ goodsReceiptId }: GoodsReceiptLineTableProps) {
  const { lines, isLoading, error } = useGoodsReceiptLineItems(goodsReceiptId)

  if (isLoading) {
    return <LoadingSkeleton />
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md text-red-800 text-sm">
        Error loading receipt line items: {error instanceof Error ? error.message : 'Unknown error'}
      </div>
    )
  }

  if (!lines || lines.length === 0) {
    return (
      <div className="bg-gray-50 p-8 rounded-md text-center">
        <p className="text-muted-foreground">No items in this receipt</p>
      </div>
    )
  }

  return (
    <Card className="border overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Item Name</TableHead>
              <TableHead className="text-center w-[100px]">Ordered</TableHead>
              <TableHead className="text-center w-[100px]">Received</TableHead>
              <TableHead className="text-center w-[100px]">Total</TableHead>
              <TableHead className="text-center w-[100px]">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lines.map((line:any) => {
              const isFullyReceived = (line.receivedQuantity || 0) >= (line.purchaseOrderLine?.quantity || 0)
              
              return (
                <TableRow key={line.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{line.item?.name || "Unknown Item"}</div>
                      {line.notes && (
                        <div className="text-xs text-muted-foreground mt-1">{line.notes}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-medium">
                    {line.purchaseOrderLine?.quantity || 0}
                  </TableCell>
                  <TableCell className="text-center font-medium">{line.receivedQuantity}</TableCell>
                  <TableCell className="text-center font-medium">{formatPrice(line?.purchaseOrderLine.totalPrice)}</TableCell>

                  <TableCell className="text-center">
                    {isFullyReceived ? (
                      <Badge variant="success" className="ml-auto">
                        <Check className="h-3.5 w-3.5 mr-1" />
                        Complete
                      </Badge>
                    ) : (
                      <Badge variant="warning" className="ml-auto">
                        <X className="h-3.5 w-3.5 mr-1" />
                        Partial
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}

function LoadingSkeleton() {
  return (
    <Card className="border">
      <div className="p-1">
        <div className="flex items-center justify-between p-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-8 w-24" />
        </div>
        <div className="space-y-2 p-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex justify-between items-center">
              <Skeleton className="h-12 w-full max-w-[70%]" />
              <Skeleton className="h-12 w-24" />
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}