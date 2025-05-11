"use client"

import { useState, useEffect } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import ItemSupplierForm from "@/components/dashboard/items/item-supplier-form"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { removeSupplierFromItem } from "@/actions/item-suppliers"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"

interface ClientSupplierSelectorProps {
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
    createdAt?: string
    updatedAt?: string
  }[]
  itemId: string
  initialSelectedSupplierId?: string
  // updateItemSupplier: (supplierId: string, data: any) => Promise<{ success: boolean; message: string }>
}

export default function ClientSupplierSelector({ 
  suppliers, 
  itemId, 
  initialSelectedSupplierId,
}: ClientSupplierSelectorProps) {
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | undefined>(initialSelectedSupplierId)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  
  // Filter suppliers based on search term
  const filteredSuppliers = suppliers.filter(supplier => 
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase())
  )
  
  // Find the selected supplier object
  const selectedSupplier = suppliers.find(s => s.id === selectedSupplierId)

  // Select first supplier by default if none is selected
  useEffect(() => {
    if (!selectedSupplierId && suppliers.length > 0) {
      setSelectedSupplierId(suppliers[0].id)
    }
  }, [suppliers, selectedSupplierId])
  
  // Handle supplier removal
  const handleRemoveSupplier = async () => {
    if (!selectedSupplier) return
    
    try {
      setIsDeleting(true)
      
      const response = await removeSupplierFromItem(
        itemId,
        selectedSupplier.supplierId
      )
      
      if (response.status === 200) {
        toast.success("Supplier removed successfully")
        
        // After successful removal, close the dialog
        setIsDeleteDialogOpen(false)
        
        // If there are other suppliers left, select the first one
        if (suppliers.length > 1) {
          // Find the next supplier to select (excluding the one being removed)
          const nextSupplier = suppliers.find(s => s.id !== selectedSupplierId)
          if (nextSupplier) {
            setSelectedSupplierId(nextSupplier.id)
          }
        } else {
          // If this was the last supplier, clear the selection
          setSelectedSupplierId(undefined)
        }
      } else {
        toast.error(response.message || "Failed to remove supplier")
      }
    } catch (error) {
      toast.error("An unexpected error occurred")
    } finally {
      setIsDeleting(false)
    }
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 border rounded">
      {/* Left column: Suppliers layout */}
      <div className="border-r-2">
        <div className="border-b-2 px-4 py-2 flex items-center justify-between">  
          <h2 className="text-lg font-medium flex items-center">Suppliers    <Badge variant="outline" className="bg-green-100 text-green-800">
            {filteredSuppliers.length}
          </Badge></h2>
          <Button
            variant="outline"
            size="sm"
            className="text-muted-foreground hover:text-primary hover:bg-primary/10 rounded"
            onClick={() => setSelectedSupplierId(undefined)}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Clear Selection
          </Button>
        </div>
        <div className="h-[calc(100vh-220px)] md:h-[calc(100vh-180px)] flex flex-col rounded-none">
          <CardHeader className="px-4 py-3 border-b">
            <div className="flex items-center gap-2 border rounded-md px-2 bg-muted/50">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search suppliers..." 
                className="focus-visible:ring-0 border-none shadow-none" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-0">
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
                        onClick={() => setSelectedSupplierId(supplier.id)}
                        className={cn(
                          "w-full text-left flex flex-col px-4 py-3 transition-colors hover:bg-muted",
                          selectedSupplierId === supplier.id && "bg-slate-100 border-l-2 border-primary",
                        )}
                      >
                        <div className="flex items-center justify-between">
                        <div className="">
                          <span className="font-medium">{supplier.name}</span>
                           <div className="text-sm text-muted-foreground mt-1">
                          <span>
                            SKU: {supplier.supplierSku ? supplier.supplierSku.substring(0, 18) + "" : "N/A"}
                          </span>
                        </div>
                        </div>
                          {supplier.isPreferred && (
                            <Badge className="ml-2 bg-green-200 text-green-600 shadow-none">
                              Preferred
                            </Badge>
                          )}
                        </div>
                       
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </ScrollArea>
          </CardContent>
        </div>
      </div>

      {/* Right column: Supplier form */}
      <div>
        <div className="border-b-2 px-4 py-2 flex items-center justify-between">  
          <h2 className="text-lg font-medium">Supplier Details</h2>
          {selectedSupplier && (
            <Button 
              variant="outline" 
              size="sm" 
              className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Remove
            </Button>
          )}
        </div>
        {selectedSupplier ? (
          <ItemSupplierForm 
            supplier={selectedSupplier} 
            itemId={itemId} 
          />
        ) : (
          <div className="flex items-center justify-center h-64 rounded-lg bg-muted/50">
            <p className="text-muted-foreground">Select a supplier to view details</p>
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove {selectedSupplier?.name} as a supplier for this item. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleRemoveSupplier()
              }}
              className="bg-red-500 hover:bg-red-600"
              disabled={isDeleting}
            >
              {isDeleting ? "Removing..." : "Remove Supplier"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}