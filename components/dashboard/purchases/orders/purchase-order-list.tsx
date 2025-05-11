"use client"

import type React from "react"

import { Search, ChevronDown, Plus, Package2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { type PurchaseOrder, PurchaseOrderStatus } from "@prisma/client"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import type { Item } from "@/types/itemTypes"
import type { LocationDTO } from "@/types"
import { formatPrice } from "@/lib/formatPrice"
import { useState, useEffect } from "react"

interface PurchaseOrderListProps {
  purchaseOrders: PurchaseOrder[]
  selectedOrder: string
  onOrderClick: (orderId: string) => void
  items?: Item[]
  locations?: LocationDTO[]
  organizationId?: string
  poCount?: number
}

export default function PurchaseOrderList({ 
  purchaseOrders, 
  selectedOrder, 
  onOrderClick,
  organizationId,
  poCount = 0
}: PurchaseOrderListProps) {
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [filteredOrders, setFilteredOrders] = useState<PurchaseOrder[]>(purchaseOrders)
  const [isSearching, setIsSearching] = useState<boolean>(false)

  const purchaseOrderStatus = PurchaseOrderStatus

  useEffect(() => {
    // Reset filtered orders when purchaseOrders prop changes
    if (searchTerm.length < 3) {
      setFilteredOrders(purchaseOrders)
    } else {
      handleSearch(searchTerm)
    }
  }, [purchaseOrders, searchTerm])

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case purchaseOrderStatus.SUBMITTED:
        return "purple"
      case purchaseOrderStatus.DRAFT:
        return "secondary"
      case purchaseOrderStatus.APPROVED:
        return "success"
      case purchaseOrderStatus.CANCELED:
        return "destructive"
      case purchaseOrderStatus.PARTIALLY_RECEIVED:
        return "warning"
      case purchaseOrderStatus.RECEIVED:
        return "success"
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
      const filtered = purchaseOrders.filter(
        (order) =>
          order.supplierName?.toLowerCase().includes(searchLower) ||
          order.poNumber.toLowerCase().includes(searchLower) ||
          order.status.toLowerCase().includes(searchLower),
      )
      setFilteredOrders(filtered)
    } else {
      setIsSearching(false)
      setFilteredOrders(purchaseOrders)
    }
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleSearch(event.target.value)
  }

  // Create URL with query parameters for the "Create Purchase Order" link
  const createPOUrl = () => {
    const params = new URLSearchParams();
    
    if (poCount !== undefined) {
      params.append('poCount', poCount.toString());
    }
    
    if (organizationId) {
      params.append('orgId', organizationId);
    }
    
    const baseUrl = "/dashboard/purchases/orders/create";
    return params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl;
  };

  return (
    <Card className="rounded-none shadow-none bg-background border-0 overflow-hidden h-full">
      <CardHeader className="p-0 border-b bg-background/80 backdrop-blur-sm sticky top-0 z-8">
        <div className="relative">
          <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
          <Input
            placeholder="Search PO number or supplier"
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
            {purchaseOrders.length === 0 ? (
              <EmptyState createUrl={createPOUrl()} />
            ) : (
              <div>
                {isSearching && filteredOrders.length === 0 ? (
                  <NoSearchResults searchTerm={searchTerm} />
                ) : (
                  filteredOrders.map((order) => (
                    <Button
                      key={order.id}
                      onClick={() => onOrderClick(order.id)}
                      variant="ghost"
                      className={cn(
                        "w-full h-auto justify-start text-left px-4 py-3 rounded-none transition-all hover:bg-muted/70 border-b shadow-none",
                        selectedOrder === order.id ? "bg-muted" : "bg-transparent",
                      )}
                    >
                      <div className="w-full">
                        <div className="flex items-center justify-between">
                          <span
                            className={cn(
                              "font-medium text-rose-500 text-sm",
                              selectedOrder === order.id && "text-rose-600",
                            )}
                          >
                            {order.poNumber}
                          </span>
                          <span className="font-semibold">{formatPrice(order.totalAmount || 0)}</span>
                        </div>
                        <div className="flex justify-between text-sm mt-2">
                          <span className="text-muted-foreground">{order.supplierName}</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-2 flex items-center justify-between">
                          <span>
                            {new Date(order.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                          <Badge
                            variant={getStatusBadgeVariant(order.status)}
                            className="text-xs font-medium px-2 py-0.5"
                          >
                            {order.status}
                          </Badge>
                        </div>
                      </div>
                    </Button>
                  ))
                )}
                {isSearching && filteredOrders.length > 0 && filteredOrders.length !== purchaseOrders.length && (
                  <div className="flex items-center justify-center py-3 text-sm text-muted-foreground bg-muted/20 rounded-lg mt-2">
                    Showing {filteredOrders.length} of {purchaseOrders.length} purchase orders
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

function EmptyState({ createUrl = "/dashboard/purchases/orders/create" }: { createUrl: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-center p-5">
      <div className="bg-primary/10 p-3 rounded-full mb-4">
        <Package2 className="h-8 w-8 text-primary/70" />
      </div>
      <h3 className="text-lg font-medium mb-1">No purchase orders yet</h3>
      <p className="text-muted-foreground text-sm max-w-md mb-4">
        Create your first purchase order to start tracking your inventory purchases.
      </p>
      <Link href={createUrl}>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Create Purchase Order
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
        No purchase orders match <span className="font-medium">"{searchTerm}"</span>
      </p>
    </div>
  )
}