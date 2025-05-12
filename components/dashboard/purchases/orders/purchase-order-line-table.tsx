"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { usePurchaseOrderLineItems } from "@/hooks/usePurchaseOrderQueries"
import { formatPrice } from "@/lib/formatPrice"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { ChevronDown, ChevronRight } from "lucide-react"

interface PurchaseOrderLineTableProps {
  purchaseOrderId: string
}

const PurchaseOrderLineTable = ({ purchaseOrderId }: PurchaseOrderLineTableProps) => {
  const { lines } = usePurchaseOrderLineItems(purchaseOrderId)
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({})

  const toggleRowExpand = (id: string) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  // Desktop view - regular table
  const DesktopTable = () => (
    <div className="rounded-md border hidden sm:block">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-[50px] font-medium truncate whitespace-nowrap">Item</TableHead>
            <TableHead className="text-center font-medium">Qty</TableHead>
            <TableHead className="text-center font-medium">Received</TableHead>
            <TableHead className="text-right font-medium">Unit Price</TableHead>
            <TableHead className="text-right font-medium">Total</TableHead>
            <TableHead className="hidden md:table-cell font-medium">Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {lines && lines.length > 0 ? (
            lines.map((line) => (
              <TableRow key={line.id} className="hover:bg-muted/50">
                <TableCell className="font-medium truncate whitespace-nowrap">{line.item?.name || "Unknown Item"}</TableCell>
                <TableCell className="text-center">{line.quantity}</TableCell>
                <TableCell className="text-center">
                  <span
                    className={cn(
                      "px-2 py-1 rounded text-xs font-medium",
                      line.receivedQuantity === line.quantity
                        ? "bg-green-100 text-green-800"
                        : line.receivedQuantity > 0
                          ? "bg-amber-100 text-amber-800"
                          : "bg-gray-100 text-gray-800",
                    )}
                  >
                    {line.receivedQuantity}
                  </span>
                </TableCell>
                <TableCell className="text-right">{formatPrice(line.unitPrice)}</TableCell>
                <TableCell className="text-right font-medium">{formatPrice(line.totalPrice)}</TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">
                  {line.createdAt ? format(new Date(line.createdAt), "MMM d, yyyy") : "N/A"}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                No line items found for this purchase order
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )

  // Mobile view - card-like layout
  const MobileTable = () => (
    <div className="sm:hidden space-y-4">
      {lines && lines.length > 0 ? (
        lines.map((line) => (
          <div 
            key={line.id} 
            className="border rounded-md overflow-hidden bg-white"
          >
            <div 
              className="flex items-center justify-between p-4 cursor-pointer"
              onClick={() => toggleRowExpand(line.id)}
            >
              <div className="flex-1">
                <p className="font-medium truncate">{line.item?.name || "Unknown Item"}</p>
                <div className="flex items-center mt-1 space-x-2">
                  <p className="text-sm text-muted-foreground">Qty: {line.quantity}</p>
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded text-xs font-medium",
                      line.receivedQuantity === line.quantity
                        ? "bg-green-100 text-green-800"
                        : line.receivedQuantity > 0
                          ? "bg-amber-100 text-amber-800"
                          : "bg-gray-100 text-gray-800",
                    )}
                  >
                    Received: {line.receivedQuantity}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <p className="font-medium">{formatPrice(line.totalPrice)}</p>
                {expandedRows[line.id] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </div>
            </div>
            
            {expandedRows[line.id] && (
              <div className="px-4 pb-4 pt-0 border-t">
                <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <dt className="text-muted-foreground">Unit Price</dt>
                  <dd className="text-right">{formatPrice(line.unitPrice)}</dd>
                  
                  <dt className="text-muted-foreground">Date Added</dt>
                  <dd className="text-right">
                    {line.createdAt ? format(new Date(line.createdAt), "MMM d, yyyy") : "N/A"}
                  </dd>
                </dl>
              </div>
            )}
          </div>
        ))
      ) : (
        <div className="text-center py-6 text-muted-foreground border rounded-md">
          No line items found for this purchase order
        </div>
      )}
    </div>
  )

  return (
    <div className="space-y-4">
      <DesktopTable />
      <MobileTable />
    </div>
  )
}

export default PurchaseOrderLineTable