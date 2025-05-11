"use client"

import type { PurchaseOrder } from "@prisma/client"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, FileText, MoreVertical } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useState } from "react"
import { deletePurchaseOrder } from "@/actions/purchase-orders"
import { ConfirmationDialog } from "@/components/ui/data-table"
import toast from "react-hot-toast"

interface PurchaseOrderDetailProps {
  orderData: PurchaseOrder
}

export default function PurchaseOrderDetail({ orderData }: PurchaseOrderDetailProps) {
   const [isDeleting, setIsDeleting] = useState(false);
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })
  }

  const handleDelete = () => {
    setIsConfirmDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    setIsDeleting(true)
    try {
    const response = await deletePurchaseOrder(orderData.id)
    if (response?.status === 200) {
      toast.success(response?.message)
      setIsDeleting(false)
      setIsConfirmDialogOpen(false)
    }
    } catch (error) {
      console.error("Error deleting purchase order:", error)
      toast.error("Failed to delete purchase order")
      setIsDeleting(false)
    }
  }


  return (
    <div className="h-full">
      <div className="p-6 border-b bg-background sticky top-0 z-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-4">
              <h2 className="text-3xl font-bold">{orderData.poNumber}</h2>
              <Badge variant="secondary" className="text-sm px-3 py-1">
                {orderData.status}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              {orderData.supplierName} • {formatDate(orderData.date)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2">
              <Edit className="h-4 w-4" />
              Edit
            </Button>
            <Button variant="outline" className="gap-2">
              <FileText className="h-4 w-4" />
              PDF/Print
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Duplicate</DropdownMenuItem>
                <DropdownMenuItem>Mark as Received</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive" 
                >Cancel Order</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive"
                onClick={handleDelete}
                >Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-4">Supplier</h3>
            <div className="space-y-2">
              <p className="text-lg font-medium">{orderData.supplierName}</p>
              <p className="text-muted-foreground">Supplier Address</p>
              <p className="text-muted-foreground">
                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">Supplier Contact Info</span>
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-4">Order Details</h3>
            <div className="grid grid-cols-2 gap-y-4">
              <div className="text-muted-foreground">Order Date:</div>
              <div>{formatDate(orderData.date)}</div>

              <div className="text-muted-foreground">Expected Delivery:</div>
              <div>{orderData.expectedDeliveryDate ? formatDate(orderData.expectedDeliveryDate) : "N/A"}</div>

              <div className="text-muted-foreground">Payment Terms:</div>
              <div>Net 40</div>

              <div className="text-muted-foreground truncate">Created By:</div>
              <div>{orderData?.createdById}</div>
            </div>
          </CardContent>
        </Card>

        <div className="col-span-1 md:col-span-2">
          <h3 className="text-xl font-semibold mb-4">Order Items</h3>
          {/* Order items would go here */}
        </div>
      </div>
      
            {/* Delete Confirmation Dialog */}
            <ConfirmationDialog
              open={isConfirmDialogOpen}
              onOpenChange={setIsConfirmDialogOpen}
              title="Delete Purchase Order"
              description={
                isConfirmDialogOpen ? (
                  <>
                    Are you sure you want to delete{" "}
                    <strong className="text-primary">{orderData?.poNumber}</strong> from
                    your orders?
                    <br />
                    This action cannot be undone.
                  </>
                ) : (
                  "Are you sure you want to delete this item?"
                )
              }
              onConfirm={handleConfirmDelete}
              isConfirming={isDeleting}
              confirmLabel="Delete"
              variant="destructive"
            />
    </div>
  )
}
