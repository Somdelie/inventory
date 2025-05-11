"use client"

import { useState, useEffect } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface ItemSuppliersLayoutProps {
  suppliers: {
    id: string
    supplierId: string
    name: string
    isPreferred: boolean
    supplierSku?: string
    leadTime?: number | null
    minOrderQty?: number | null
    unitCost?: number | null
    lastPurchaseDate?: string | null
    notes?: string
  }[]
  itemId: string
  initialSelectedSupplierId?: string
  onSupplierSelect: (supplier: any) => void
}

export default function ItemSuppliersLayout({ 
  suppliers, 
  itemId, 
  initialSelectedSupplierId,
  onSupplierSelect
}: ItemSuppliersLayoutProps) {
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | undefined>(initialSelectedSupplierId)
  const [searchTerm, setSearchTerm] = useState("")
  
  // Filter suppliers based on search term
  const filteredSuppliers = suppliers.filter(supplier => 
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase())
  )
  
  // Select first supplier by default if none is selected
  useEffect(() => {
    if (!selectedSupplierId && suppliers.length > 0) {
      setSelectedSupplierId(suppliers[0].id)
      onSupplierSelect(suppliers[0])
    }
  }, [suppliers, selectedSupplierId, onSupplierSelect])
  
  // Handle supplier selection
  const handleSupplierClick = (supplier: any) => {
    setSelectedSupplierId(supplier.id)
    onSupplierSelect(supplier)
  }

  return (
    <Card className="h-[calc(100vh-220px)] md:h-[calc(100vh-180px)] flex flex-col">
      <CardHeader className="px-4 py-3 border-b">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search suppliers..." 
            className="h-8 focus-visible:ring-0 border-none shadow-none" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          {filteredSuppliers.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-muted-foreground">
              {suppliers.length === 0 ? "No suppliers found" : "No results match your search"}
            </div>
          ) : (
            <ul className="divide-y">
              {filteredSuppliers.map((supplier) => (
                <li key={supplier.id}>
                  <button
                    onClick={() => handleSupplierClick(supplier)}
                    className={cn(
                      "w-full text-left flex flex-col px-4 py-3 transition-colors hover:bg-muted",
                      selectedSupplierId === supplier.id && "bg-muted border-l-4 border-primary",
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{supplier.name}</span>
                      {supplier.isPreferred && (
                        <Badge className="ml-2 bg-green-300 text-green-800">
                          Preferred
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      <span>ID: {supplier.supplierId.substring(0, 8)}...</span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}