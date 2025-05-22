"use client"

import type React from "react"

import { Search, ChevronDown, Plus, Package2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { type GoodsReceipt, GoodsReceiptStatus } from "@prisma/client"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import type { Item } from "@/types/itemTypes"
import type { LocationDTO } from "@/types"
import { useState, useEffect } from "react"
import { PurchaseOrder } from "@/types/purchase-order"

interface GoodsReceiptListProps {
  // extend GoodsReceipt with additional properties like enhancedPurchaseOrder
  goodsReceipts: (GoodsReceipt & {
    enhancedPurchaseOrder?: PurchaseOrder
  })[]
  selectedReceipt: string
  onReceiptClick: (receiptId: string) => void
  items?: Item[]
  locations?: LocationDTO[]
  organizationId?: string
  grCount?: number
}

export default function GoodsReceiptList({ 
  goodsReceipts, 
  selectedReceipt, 
  onReceiptClick,
  organizationId,
  grCount = 0
}: GoodsReceiptListProps) {
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [filteredReceipts, setFilteredReceipts] = useState<(GoodsReceipt & { enhancedPurchaseOrder?: PurchaseOrder })[]>(goodsReceipts)
  const [isSearching, setIsSearching] = useState<boolean>(false)

  const goodsReceiptStatus = GoodsReceiptStatus

  useEffect(() => {
    // Reset filtered receipts when goodsReceipts prop changes
    if (searchTerm.length < 3) {
      setFilteredReceipts(goodsReceipts)
    } else {
      handleSearch(searchTerm)
    }
  }, [goodsReceipts, searchTerm])

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case goodsReceiptStatus.PENDING:
        return "warning"
      case goodsReceiptStatus.COMPLETED:
        return "success"
      case goodsReceiptStatus.CANCELED:
        return "destructive"
      default:
        return "default"
    }
  }

  const handleSearch = (term: string) => {
    setSearchTerm(term)

    // Only filter if search term is at least 3 characters
    if (term.length >= 3) {
      setIsSearching(true)
      const searchLower = term.toLowerCase()
      const filtered = goodsReceipts.filter(
        (receipt) =>
          receipt.receiptNumber.toLowerCase().includes(searchLower) ||
          receipt.status.toLowerCase().includes(searchLower),
      )
      setFilteredReceipts(filtered)
    } else {
      setIsSearching(false)
      setFilteredReceipts(goodsReceipts)
    }
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleSearch(event.target.value)
  }

  // Create URL with query parameters for the "Create Goods Receipt" link
  const createGRUrl = () => {
    const params = new URLSearchParams();
    
    if (grCount !== undefined) {
      params.append('grCount', grCount.toString());
    }
    
    if (organizationId) {
      params.append('orgId', organizationId);
    }
    
    const baseUrl = "/dashboard/inventory/receipts/create";
    return params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl;
  };

  return (
    <Card className="rounded-none shadow-none bg-background border-0 overflow-hidden h-full">
      <CardHeader className="p-0 border-b bg-background/80 backdrop-blur-sm sticky top-0 z-8">
        <div className="relative">
          <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
          <Input
            placeholder="Search receipt number"
            className="pl-9 h-10 bg-background focus-visible:ring-primary/50 transition-all rounded-none"
            onChange={handleInputChange}
            value={searchTerm}
            type="text"
            name="search"
            id="search"
            autoComplete="off"
          />
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-8rem)]">
          <div className="p-0">
            {goodsReceipts.length === 0 ? (
              <EmptyState createUrl={createGRUrl()} />
            ) : (
              <div>
                {isSearching && filteredReceipts.length === 0 ? (
                  <NoSearchResults searchTerm={searchTerm} />
                ) : (
                  filteredReceipts.map((receipt) => (
                    <Button
                      key={receipt.id}
                      onClick={() => onReceiptClick(receipt.id)}
                      variant="ghost"
                      className={cn(
                        "w-full h-auto justify-start text-left px-4 py-3 rounded-none transition-all hover:bg-muted/70 border-b shadow-none",
                        selectedReceipt === receipt.id ? "bg-muted" : "bg-transparent",
                      )}
                    >
                      <div className="w-full">
                        <div className="flex items-center justify-between">
                          <span
                            className={cn(
                              "font-medium text-primary text-sm",
                              selectedReceipt === receipt.id && "text-rose-800 font-semibold",
                            )}
                          >
                            {receipt.receiptNumber}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm mt-2">
                          <span className="text-muted-foreground">
                            PO: {receipt.enhancedPurchaseOrder?.poNumber || "N/A"}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-2 flex items-center justify-between">
                          <span>
                            {new Date(receipt.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                          <Badge
                            variant={getStatusBadgeVariant(receipt.status)}
                            className="text-xs font-medium px-2 py-0.5"
                          >
                            {receipt.status}
                          </Badge>
                        </div>
                      </div>
                    </Button>
                  ))
                )}
                {isSearching && filteredReceipts.length > 0 && filteredReceipts.length !== goodsReceipts.length && (
                  <div className="flex items-center justify-center py-3 text-sm text-muted-foreground bg-muted/20 rounded-lg mt-2">
                    Showing {filteredReceipts.length} of {goodsReceipts.length} goods receipts
                  </div>
                )}
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

function EmptyState({ createUrl = "/dashboard/inventory/receipts/create" }: { createUrl: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-center p-5">
      <div className="bg-primary/10 p-3 rounded-full mb-4">
        <Package2 className="h-8 w-8 text-primary/70" />
      </div>
      <h3 className="text-lg font-medium mb-1">No goods receipts yet</h3>
      <p className="text-muted-foreground text-sm max-w-md mb-4">
        Create your first goods receipt to track inventory received from suppliers.
      </p>
      <Link href={createUrl}>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Create Goods Receipt
        </Button>
      </Link>
    </div>
  )
}

function NoSearchResults({ searchTerm }: { searchTerm: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-48 text-center p-5 bg-muted/20 rounded-lg">
      <Search className="h-8 w-8 text-muted-foreground mb-3" />
      <h3 className="text-lg font-medium mb-1">No results found</h3>
      <p className="text-muted-foreground text-sm max-w-md">
        No goods receipts match <span className="font-medium">"{searchTerm}"</span>
      </p>
    </div>
  )
}