"use client"

import type { GoodsReceipt } from "@prisma/client"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Edit, 
  FileText,
  MoreVertical, 
  Building, 
  Calendar, 
  Truck, 
  User,
  MapPin,
  AlertCircle,
  Loader2,
  Package2,
  CheckCircle2
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useState } from "react"
import { ConfirmationDialog } from "@/components/ui/data-table"
import toast from "react-hot-toast"
import GoodsReceiptLineTable from "./goods-receipt-line-table"
import { formatDate } from "date-fns"
import { useRouter } from "next/navigation"
import { useDeleteGoodsReceipt, useUpdateGoodsReceiptStatus } from "@/hooks/useGoodsReceiptQueries"
import { useReceivedBy } from "@/hooks/useGetRecievedBy"

// Extended interface to include purchase order details
interface GoodsReceiptDetailProps {
  receiptData: GoodsReceipt & {
    location?: {
      name: string;
    },
    purchaseOrder?: {
      id: string;
      poNumber: string;
      supplierName: string;
      supplier?: {
        id: string;
        name: string;
        email: string | null;
        phone: string | null;
        address: string | null;
      } | null;
    } | null;
    enhancedPurchaseOrder?: any; // For handling separately fetched purchase order data
  }
}

export default function GoodsReceiptDetail({ receiptData }: GoodsReceiptDetailProps) {
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const router = useRouter();

  console.log("Receipt Data:", receiptData);

  // Use React Query hooks
  const deleteGoodsReceipt = useDeleteGoodsReceipt(receiptData.organizationId);
  const updateStatus = useUpdateGoodsReceiptStatus(
    receiptData.id, 
    receiptData.organizationId
  );

 // Use the custom hook for fetching receivedBy user data
  const { receivedByUser, isLoading: loadingUser } = useReceivedBy(receiptData.receivedById);


// console.log("Received By:", receivedByUser);


  // Get purchase order information - try different sources based on what's available
  const purchaseOrder = receiptData.purchaseOrder || receiptData.enhancedPurchaseOrder || null;
  
  // Use the most reliable purchase order information
  const poNumber = purchaseOrder?.poNumber || "Unknown PO";
  const supplierName = purchaseOrder?.supplier?.name || purchaseOrder?.supplierName || "Unknown Supplier";

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'canceled':
        return 'bg-red-100 text-red-800 border-red-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const handleDelete = () => {
    setIsConfirmDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    try {
      await deleteGoodsReceipt.mutateAsync(receiptData.id);
      setIsConfirmDialogOpen(false);
      router.push('/dashboard/inventory/receipts');
    } catch (error) {
      console.error("Error deleting goods receipt:", error);
    }
  }

  const handleCompleteReceipt = async () => {
    try {
      await updateStatus.mutateAsync({ status: 'COMPLETED' });
      router.refresh();
    } catch (error) {
      console.error("Error completing goods receipt:", error);
    }
  }

  return (
    <div className="h-full">
      <div className="px-6 py-4 border-b bg-background sticky top-0 z-10 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-xl font-bold">{receiptData.receiptNumber}</h2>
              <Badge 
                className={`text-xs px-3 py-1 border ${getStatusColor(receiptData.status)}`}
              >
                {receiptData.status}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1 flex items-center gap-2 flex-wrap">
              <span className="font-medium">PO: {poNumber}</span> 
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-muted-foreground"></span> 
              <span>{formatDate(receiptData.date, "yyyy-MM-dd")}</span>
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {receiptData.status === 'PENDING' && (
              <Button 
                size="sm" 
                className="gap-2" 
                onClick={handleCompleteReceipt}
                disabled={updateStatus.isPending}
              >
                {updateStatus.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">Mark as Complete</span>
              </Button>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Print Receipt</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">Cancel Receipt</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive" onClick={handleDelete}>Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Purchase Order Information Card */}
        <Card className="overflow-hidden border-0 bg-gradient-to-br from-white to-gray-50">
          <div className="bg-blue-50 px-6 py-4 border-b border-blue-100">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-blue-700">Purchase Order Details</h3>
            </div>
          </div>
          <CardContent className="p-6">
            {purchaseOrder ? (
              <div className="space-y-4">
                <div className="flex flex-col">
                  <p className="text-lg font-medium">PO #{poNumber}</p>
                  
                  <div className="flex items-center gap-2 mt-3 text-muted-foreground">
                    <Building className="h-4 w-4 text-blue-500" />
                    <span>{supplierName}</span>
                  </div>
                  
                  {purchaseOrder.supplier?.address && (
                    <div className="flex items-start gap-2 mt-2 text-muted-foreground">
                      <MapPin className="h-4 w-4 text-blue-500 mt-0.5" />
                      <span>{purchaseOrder.supplier.address}</span>
                    </div>
                  )}
                  
                  {!purchaseOrder.supplier && (
                    <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-amber-700">
                        Limited supplier information available. The full supplier record is not linked to this purchase order.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-4 text-center text-muted-foreground">
                No purchase order information available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Receipt Details Card */}
        <Card className="overflow-hidden border-0 bg-gradient-to-br from-white to-gray-50">
          <div className="bg-purple-50 px-6 py-4 border-b border-purple-100">
            <div className="flex items-center gap-2">
              <Package2 className="h-5 w-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-purple-700">Receipt Details</h3>
            </div>
          </div>
          <CardContent className="p-6 text-sm">
            <div className="grid gap-2">
              <div className="flex items-center justify-between border-b border-gray-100">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4 text-purple-500" />
                  <span>Receipt Date:</span>
                </div>
                <div className="font-medium whitespace-nowrap">{formatDate(receiptData.date, "yyyy-MM-dd")}</div>
              </div>

              <div className="flex items-center justify-between border-b border-gray-100">
                <div className="flex items-center gap-2 text-muted-foreground whitespace-nowrap">
                  <Truck className="h-4 w-4 text-purple-500" />
                  <span>Delivery Location:</span>
                </div>
                <div className="font-medium whitespace-nowrap text-left">
                  {receiptData.location ? receiptData.location.name.substring(0, 13) : "Unknown Location"}
                </div>
              </div>

              <div className="flex items-center justify-between border-b border-gray-100">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="h-4 w-4 text-purple-500" />
                  <span>Received By:</span>
                </div>
                <div className="font-medium">
                  {receivedByUser?.name || "Unknown User"}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <FileText className="h-4 w-4 text-purple-500" />
                  <span>Status:</span>
                </div>
                <div className="text-lg font-bold text-purple-700">
                  {receiptData.status}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Receipt Items Section - Full Width */}
        <div className="col-span-1 md:col-span-2">
          <div className="flex items-center gap-2 mb-4 px-1">
            <div className="h-5 w-1 bg-indigo-500 rounded-full"></div>
            <h3 className="text-xl font-semibold">Received Items</h3>
          </div>
          
          <GoodsReceiptLineTable goodsReceiptId={receiptData.id} />
        </div>
      </div>
      
      {/* Notes Section - If Available */}
      {receiptData.notes && (
        <div className="px-6 pb-6">
          <Card className="border-0 shadow-md bg-amber-50">
            <CardContent className="p-4">
              <h4 className="font-medium text-amber-800 mb-2">Notes</h4>
              <p className="text-amber-900">{receiptData.notes}</p>
            </CardContent>
          </Card>
        </div>
      )}
            
      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={isConfirmDialogOpen}
        onOpenChange={setIsConfirmDialogOpen}
        title="Delete Goods Receipt"
        description={
          isConfirmDialogOpen ? (
            <>
              Are you sure you want to delete{" "}
              <strong className="text-primary">{receiptData?.receiptNumber}</strong> from
              your records?
              <br />
              This action cannot be undone.
            </>
          ) : (
            "Are you sure you want to delete this item?"
          )
        }
        onConfirm={handleConfirmDelete}
        isConfirming={deleteGoodsReceipt.isPending}
        confirmLabel="Delete"
        variant="destructive"
      />
    </div>
  )
}