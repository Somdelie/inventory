"use client"

import { useState, useEffect } from "react"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { formatPrice } from "@/lib/formatPrice"
import { Package2, Loader2 } from "lucide-react"
import { toast } from "react-hot-toast"
import { usePurchaseOrderLineItems } from "@/hooks/usePurchaseOrderQueries"
import { receiveOrder } from "@/actions/purchase-orders"

// Define TypeScript interfaces
interface OrderItem {
  id: string
  productName: string
  sku: string
  orderedQuantity: number
  receivedQuantity: number
  price: number
  uom: string
}

interface PurchaseOrderData {
  id: string
  poNumber: string
  status?: string
}

interface ReceivePayload {
  purchaseOrderId: string
  poNumber: string
  items: {
    id: string
    receivedQuantity: number
  }[]
}

interface ReceiveOrderModalProps {
  isOpen: boolean
  onClose: () => void
  purchaseOrder: PurchaseOrderData
  onReceiveOrder: (payload: ReceivePayload) => void
  purchaseOrderId: string
}

export default function ReceiveOrderModal({ 
  isOpen, 
  onClose, 
  purchaseOrder, 
  purchaseOrderId
}: ReceiveOrderModalProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  
  // Fetch order lines using the hook
  const { lines, isLoading: isLoadingLines } = usePurchaseOrderLineItems(purchaseOrderId)
  
  // Transform the lines into OrderItem format when they change
  useEffect(() => {
    if (lines && lines.length > 0) {
      const formattedItems: OrderItem[] = lines.map(line => ({
        id: line.id,
        productName: line.item?.name || "Unknown Item",
        sku: line.item?.sku || "N/A",
        orderedQuantity: line.quantity || 0,
        receivedQuantity: line.receivedQuantity || 0,
        price: line.unitPrice || 0,
        uom: line.item?.unitOfMeasure || "EA"
      }))
      
      setOrderItems(formattedItems)
    }
  }, [lines])
  
  // Handle quantity change for a specific item
  const handleQuantityChange = (id: string, value: string) => {
    // Ensure value is a non-negative number
    const quantity = Math.max(0, parseInt(value) || 0)
    
    // Get the matching item to check against orderedQuantity
    const item = orderItems.find(item => item.id === id)
    
    // Make sure the received quantity doesn't exceed ordered quantity
    const validQuantity = item 
      ? Math.min(quantity, item.orderedQuantity) 
      : quantity
    
    setOrderItems(orderItems.map(item => 
      item.id === id ? { ...item, receivedQuantity: validQuantity } : item
    ))
  }
  
  // Handle form submission
  const handleSubmit = async () => {
    setIsLoading(true)
    
    try {
      const payload: ReceivePayload = {
        purchaseOrderId: purchaseOrder.id,
        poNumber: purchaseOrder.poNumber,
        items: orderItems.map(item => ({
          id: item.id,
          receivedQuantity: item.receivedQuantity
        }))
      }
      
      await receiveOrder(payload)
      toast.success("Order received successfully!")
      onClose()
    } catch (error) {
      console.error("Error receiving order:", error)
      toast.error("Failed to receive order. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }
  
  // Calculate total received items
  const totalReceived = orderItems.reduce((sum, item) => sum + item.receivedQuantity, 0)
  const totalOrdered = orderItems.reduce((sum, item) => sum + item.orderedQuantity, 0)
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <Package2 className="h-5 w-5 text-blue-600" />
            Receive Order: {purchaseOrder?.poNumber}
          </DialogTitle>
          <DialogDescription>
            Enter the quantities received for each item below.
          </DialogDescription>
        </DialogHeader>
        
        <div className="max-h-[60vh] overflow-y-auto">
          {isLoadingLines ? (
            <div className="py-8 flex justify-center items-center">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading order items...</p>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead className="text-center">UOM</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-center">Ordered</TableHead>
                  <TableHead className="text-center">Received</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orderItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.productName}</TableCell>
                    <TableCell>{item.sku}</TableCell>
                    <TableCell className="text-center">{item.uom}</TableCell>
                    <TableCell className="text-right">{formatPrice(item.price)}</TableCell>
                    <TableCell className="text-center">{item.orderedQuantity}</TableCell>
                    <TableCell className="w-32">
                      <Input
                        type="number"
                        value={item.receivedQuantity}
                        onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                        min="0"
                        max={item.orderedQuantity}
                        className="text-center"
                      />
                    </TableCell>
                  </TableRow>
                ))}
                
                {orderItems.length === 0 && !isLoadingLines && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No items found for this purchase order
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>
        
        <div className="bg-muted/30 p-3 rounded-md mt-2">
          <div className="flex justify-between items-center">
            <span>Total Items Received:</span>
            <span className="font-semibold">{totalReceived} / {totalOrdered}</span>
          </div>
        </div>
        
        <DialogFooter className="flex items-center justify-between">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isLoading || isLoadingLines || totalReceived === 0 || orderItems.length === 0}
            className="gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Package2 className="h-4 w-4" />
                Confirm Receive
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}