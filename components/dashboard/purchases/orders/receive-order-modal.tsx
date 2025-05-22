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
import { Package2, Loader2, AlertCircle } from "lucide-react"
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
  newReceivedQuantity: number
  price: number
  uom: string
  remainingQuantity: number // Add this to make calculations clearer
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
      const formattedItems: OrderItem[] = lines.map(line => {
        const orderedQty = Number(line.quantity || 0)
        const receivedQty = Number(line.receivedQuantity || 0)
        const remainingQty = Math.max(0, orderedQty - receivedQty)
        
        return {
          id: line.id,
          productName: line.item?.name || "Unknown Item",
          sku: line.item?.sku || "N/A",
          orderedQuantity: orderedQty,
          receivedQuantity: receivedQty,
          newReceivedQuantity: 0, // Start with 0 for new receiving
          remainingQuantity: remainingQty,
          price: line.unitPrice || 0,
          uom: line.item?.unitOfMeasure || "EA"
        }
      })
      setOrderItems(formattedItems)
    }
  }, [lines])

  // Handle quantity change for a specific item
  const handleQuantityChange = (id: string, value: string) => {
    const inputValue = parseInt(value) || 0
    
    setOrderItems(prevItems => 
      prevItems.map(item => {
        if (item.id !== id) return item
        
        // Ensure we don't exceed the remaining quantity
        const newQuantity = Math.max(0, Math.min(inputValue, item.remainingQuantity))
        
        return {
          ...item,
          newReceivedQuantity: newQuantity,
        }
      })
    )
  }

  // Handle form submission
  const handleSubmit = async () => {
    setIsLoading(true)
    
    try {
      const itemsToReceive = orderItems.filter(item => item.newReceivedQuantity > 0)
      
      if (itemsToReceive.length === 0) {
        toast.error("Please enter quantities to receive")
        setIsLoading(false)
        return
      }

      const payload: ReceivePayload = {
        purchaseOrderId: purchaseOrder.id,
        poNumber: purchaseOrder.poNumber,
        items: itemsToReceive.map(item => ({
          id: item.id,
          receivedQuantity: item.newReceivedQuantity,
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
  
  // Calculate totals
  const totalNewlyReceived = orderItems.reduce((sum, item) => sum + item.newReceivedQuantity, 0)
  const totalOrdered = orderItems.reduce((sum, item) => sum + item.orderedQuantity, 0)
  const totalPreviouslyReceived = orderItems.reduce((sum, item) => sum + item.receivedQuantity, 0)
  const totalRemaining = orderItems.reduce((sum, item) => sum + item.remainingQuantity, 0)

  // Check if there are items that can still be received
  const hasItemsToReceive = orderItems.some(item => item.remainingQuantity > 0)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <Package2 className="h-5 w-5 text-blue-600" />
            Receive Order: {purchaseOrder?.poNumber}
          </DialogTitle>
          <DialogDescription>
            Enter the quantities received for each item below. You can only receive up to the remaining quantity for each item.
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
          ) : !hasItemsToReceive ? (
            <div className="py-8 flex justify-center items-center">
              <div className="flex flex-col items-center gap-2 text-center">
                <AlertCircle className="h-12 w-12 text-green-500" />
                <h3 className="text-lg font-semibold text-green-700">All Items Fully Received</h3>
                <p className="text-muted-foreground">
                  All items in this purchase order have been fully received.
                </p>
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
                  <TableHead className="text-center">Previously Received</TableHead>
                  <TableHead className="text-center">Remaining</TableHead>
                  <TableHead className="text-center">Receive Now</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orderItems.map((item) => (
                  <TableRow key={item.id} className={item.remainingQuantity === 0 ? "opacity-50" : ""}>
                    <TableCell className="font-medium">{item.productName}</TableCell>
                    <TableCell>{item.sku}</TableCell>
                    <TableCell className="text-center">{item.uom}</TableCell>
                    <TableCell className="text-right">{formatPrice(item.price)}</TableCell>
                    <TableCell className="text-center font-medium">{item.orderedQuantity}</TableCell>
                    <TableCell className="text-center">
                      <span className={item.receivedQuantity > 0 ? "text-green-600 font-medium" : "text-gray-500"}>
                        {item.receivedQuantity}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={item.remainingQuantity > 0 ? "text-blue-600 font-medium" : "text-gray-500"}>
                        {item.remainingQuantity}
                      </span>
                    </TableCell>
                    <TableCell className="w-32">
                      {item.remainingQuantity > 0 ? (
                        <Input
                          type="number"
                          value={item.newReceivedQuantity || ""}
                          onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                          min="0"
                          max={item.remainingQuantity}
                          placeholder="0"
                          className="text-center"
                        />
                      ) : (
                        <div className="text-center text-gray-500 text-sm py-2">
                          Complete
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                
                {orderItems.length === 0 && !isLoadingLines && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No items found for this purchase order
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>
        
        {hasItemsToReceive && (
          <div className="bg-muted/30 p-4 rounded-md mt-2 space-y-2">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Ordered:</span>
                <span className="font-semibold">{totalOrdered}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Previously Received:</span>
                <span className="font-semibold text-green-600">{totalPreviouslyReceived}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Remaining:</span>
                <span className="font-semibold text-blue-600">{totalRemaining}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Receiving Now:</span>
                <span className="font-semibold text-purple-600">{totalNewlyReceived}</span>
              </div>
            </div>
          </div>
        )}
        
        <DialogFooter className="flex items-center justify-between">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={
              isLoading || 
              isLoadingLines || 
              totalNewlyReceived === 0 || 
              orderItems.length === 0 ||
              !hasItemsToReceive
            }
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
                Confirm Receive ({totalNewlyReceived} items)
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}