"use client"

import type { PurchaseOrder } from "@prisma/client"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Edit, 
  FileText,
  MoreVertical, 
  Building, 
  Mail, 
  Calendar, 
  Truck, 
  CreditCard, 
  User,
  Phone,
  MapPin,
  AlertCircle,
  Loader2,
  Package2
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useState } from "react"
import { deletePurchaseOrder, sendPurchaseOrderEmail } from "@/actions/purchase-orders"
import { ConfirmationDialog } from "@/components/ui/data-table"
import toast from "react-hot-toast"
import PurchaseOrderLineTable from "./purchase-order-line-table"
import { formatPrice } from "@/lib/formatPrice"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { formatDate } from "date-fns"
import ReceiveOrderModal from "./receive-order-modal"


// Define the ReceivePayload interface for type safety
interface ReceivePayload {
  purchaseOrderId: string;
  poNumber: string;
  items: {
    id: string;
    receivedQuantity: number;
  }[];
}
// Extended interface to include supplier details
interface PurchaseOrderDetailProps {
  orderData: PurchaseOrder & {
    supplier?: {
      id: string;
      name: string;
      email: string | null;
      phone: string | null;
      address: string | null;
      taxId: string | null;
      paymentTerms: string | null;
      isActive: boolean;
    } | null;
    enhancedSupplier?: any; // For handling separately fetched supplier data
  }
}

export default function PurchaseOrderDetail({ orderData }: PurchaseOrderDetailProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);
  const [isConfirmingReceive, setIsConfirmingReceive] = useState(false);
  const [isProcessingReceive, setIsProcessingReceive] = useState(false);
  const router = useRouter();
  
  // Get supplier information - try different sources based on what's available
  const supplier = orderData.supplier || orderData.enhancedSupplier || null;
  
  // Use the most reliable supplier information
  const supplierName = supplier?.name || orderData.supplierName || "Unknown Supplier";
  const supplierEmail = supplier?.email || orderData.supplierEmail || null;
  const supplierPhone = supplier?.phone || orderData.supplierPhone || null;
  const supplierAddress = supplier?.address || null;
  const supplierPaymentTerms = supplier?.paymentTerms || orderData.paymentTerms || "Net 30";

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'sent':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'confirmed':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300'
      case 'received':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300'
      case 'partial':
        return 'bg-purple-100 text-purple-800 border-purple-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const handleReceive = () =>{
    setIsReceiveModalOpen(true)
    console.log("Order received successfully")
    // toast.success("Order received successfully")
  }

   // This handles the actual receiving of items
  const handleReceiveOrder = async (payload: ReceivePayload) => {
    setIsProcessingReceive(true);
    
    try {
      // The API call is now handled in the ReceiveOrderModal
      // We're just handling the UI update here
      console.log("Received order data:", payload);
      
      // Update the UI
      toast.success("Order received successfully");
      
      // Close the modal
      setIsReceiveModalOpen(false);
      
      // Refresh the page to show updated data
      router.refresh();
      
    } catch (error) {
      console.error("Error receiving order:", error);
      toast.error("Failed to process received items");
    } finally {
      setIsProcessingReceive(false);
    }
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
        router.push('/dashboard/purchases/orders')
      }
    } catch (error) {
      console.error("Error deleting purchase order:", error)
      toast.error("Failed to delete purchase order")
      setIsDeleting(false)
    }
  }

  // Handle sending email
  const handleSendEmail = () => {
    setIsEmailDialogOpen(true);
  }

  // Send the purchase order email
  const sendEmail = async () => {
    if (!supplierEmail) {
      toast.error("No supplier email address available");
      return;
    }
    
    setIsSendingEmail(true);
    try {
      const response = await sendPurchaseOrderEmail(orderData.id);
      
      if (response.success) {
        toast.success(response.message);
        setIsEmailDialogOpen(false);
        router.refresh(); // Refresh the page to update the status
      } else {
        toast.error(response.message || "Failed to send email");
      }
    } catch (error) {
      console.error("Error sending email:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSendingEmail(false);
    }
  }

  return (
    <div className="h-full">
      <div className="px-6 py-4 border-b bg-background sticky top-0 z-10 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-xl font-bold">{orderData.poNumber}</h2>
              <Badge 
                className={`text-sm px-3 py-1 border ${getStatusColor(orderData.status)}`}
              >
                {orderData.status}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1 flex items-center gap-2 flex-wrap">
              <span className="font-medium">{supplierName}</span> 
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-muted-foreground"></span> 
              <span>{formatDate(orderData.date, "yyyy-MM-dd")}</span>
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
           
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2" 
              onClick={handleSendEmail}
              disabled={isSendingEmail}
            >
              {isSendingEmail ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Mail className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">Send Email</span>
            </Button>

             <Button size="sm" className="gap-2 rounded"
              onClick={handleReceive}
            >
             <Package2 className="h-4 w-4" />
              <span className="hidden sm:inline">Receive Order</span>
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
                <DropdownMenuItem className="text-destructive">Cancel Order</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive" onClick={handleDelete}>Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Supplier Card */}
        <Card className="overflow-hidden border-0 bg-gradient-to-br from-white to-gray-50">
          <div className="bg-blue-50 px-6 py-4 border-b border-blue-100">
            <div className="flex items-center gap-2">
              <Building className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-blue-700">Supplier Details</h3>
            </div>
          </div>
          <CardContent className="p-6">
            {supplier || supplierName ? (
              <div className="space-y-4">
                <div className="flex flex-col">
                  <p className="text-lg font-medium">{supplierName}</p>
                  
                  {supplierEmail && (
                    <div className="flex items-center gap-2 mt-3 text-muted-foreground">
                      <a href={`mailto:${supplierEmail}`} className="hover:text-blue-600 transition-colors flex items-center gap-2">
                        <Mail className="h-4 w-4 text-blue-500" />
                        {supplierEmail}
                      </a>
                    </div>
                  )}
                  
                  {supplierPhone && (
                    <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                      <Phone className="h-4 w-4 text-blue-500" />
                      <a href={`tel:${supplierPhone}`} className="hover:text-blue-600 transition-colors">
                        {supplierPhone}
                      </a>
                    </div>
                  )}
                  
                  {supplierAddress && (
                    <div className="flex items-start gap-2 mt-2 text-muted-foreground">
                      <MapPin className="h-4 w-4 text-blue-500 mt-0.5" />
                      <span>{supplierAddress}</span>
                    </div>
                  )}
                  
                  {supplier?.taxId && (
                    <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                      <FileText className="h-4 w-4 text-blue-500" />
                      <span>Tax ID: {supplier.taxId}</span>
                    </div>
                  )}
                  
                  {!supplier && (
                    <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-amber-700">
                        Limited supplier information available. The full supplier record is not linked to this order.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-4 text-center text-muted-foreground">
                No supplier information available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Details Card */}
        <Card className="overflow-hidden border-0 bg-gradient-to-br from-white to-gray-50">
          <div className="bg-purple-50 px-6 py-4 border-b border-purple-100">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-purple-700">Order Details</h3>
            </div>
          </div>
          <CardContent className="p-6 text-sm">
            <div className="grid gap-2">
              <div className="flex items-center justify-between border-b border-gray-100">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4 text-purple-500" />
                  <span>Order Date:</span>
                </div>
                <div className="font-medium whitespace-nowrap">{formatDate(orderData.date, "yyyy-MM-dd")}</div>
              </div>

              <div className="flex items-center justify-between border-b border-gray-100">
                <div className="flex items-center gap-2 text-muted-foreground whitespace-nowrap">
                  <Truck className="h-4 w-4 text-purple-500" />
                  <span>Delivery Date:</span>
                </div>
                <div className="font-medium whitespace-nowrap text-left">
                  {orderData.expectedDeliveryDate ? formatDate(orderData.expectedDeliveryDate, "yyyy-MM-dd") : "N/A"}
                </div>
              </div>

              <div className="flex items-center justify-between border-b border-gray-100">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CreditCard className="h-4 w-4 text-purple-500" />
                  <span>Payment Terms:</span>
                </div>
                <div className="font-medium">{supplierPaymentTerms}</div>
              </div>

              {orderData.paymentStatus && (
                <div className="flex items-center justify-between border-b border-gray-100">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CreditCard className="h-4 w-4 text-purple-500" />
                    <span>Payment Status:</span>
                  </div>
                  <Badge variant={orderData.paymentStatus.toLowerCase() === 'paid' ? 'success' : 'secondary'}>
                    {orderData.paymentStatus}
                  </Badge>
                </div>
              )}

              <div className="flex items-center justify-between border-b border-gray-100">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="h-4 w-4 text-purple-500" />
                  <span>Created By:</span>
                </div>
                <div className="font-medium">
                  {/* {orderData.createdBy?.name || orderData.createdById || "Unknown"} */}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <FileText className="h-4 w-4 text-purple-500" />
                  <span>Total Amount:</span>
                </div>
                <div className="text-lg font-bold text-purple-700">
                  {formatPrice(orderData.totalAmount)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Items Section - Full Width */}
        <div className="col-span-1 md:col-span-2">
          <div className="flex items-center gap-2 mb-4 px-1">
            <div className="h-5 w-1 bg-indigo-500 rounded-full"></div>
            <h3 className="text-xl font-semibold">Order Items</h3>
          </div>
          
          <PurchaseOrderLineTable purchaseOrderId={orderData.id} />

           {/* Receive Order Modal */}
    <ReceiveOrderModal
            isOpen={isReceiveModalOpen}
            onClose={() => setIsReceiveModalOpen(false)}
           purchaseOrderId={orderData.id}
            onReceiveOrder={handleReceiveOrder}
            purchaseOrder={orderData}
          />

          {/* Order Summary - For Mobile */}
          <div className="mt-6 sm:hidden">
            <Card className="border-0 shadow-md bg-gray-50">
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span>{formatPrice(orderData.subtotal)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Tax:</span>
                    <span>{formatPrice(orderData.taxAmount)}</span>
                  </div>
                  {orderData.shippingCost > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Shipping:</span>
                      <span>{formatPrice(orderData.shippingCost)}</span>
                    </div>
                  )}
                  {orderData.discount > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Discount:</span>
                      <span>-{formatPrice(orderData.discount)}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t flex justify-between items-center">
                    <span className="font-semibold">Total:</span>
                    <span className="font-bold text-lg">{formatPrice(orderData.totalAmount)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Notes Section - If Available */}
      {orderData.notes && (
        <div className="px-6 pb-6">
          <Card className="border-0 shadow-md bg-amber-50">
            <CardContent className="p-4">
              <h4 className="font-medium text-amber-800 mb-2">Notes</h4>
              <p className="text-amber-900">{orderData.notes}</p>
            </CardContent>
          </Card>
        </div>
      )}
            
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

      {/* Email Confirmation Dialog */}
      <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Send Purchase Order Email</DialogTitle>
            <DialogDescription>
              Send purchase order {orderData.poNumber} to {supplierName}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {!supplierEmail ? (
              <div className="flex items-start gap-2 bg-amber-50 p-3 rounded-md">
                <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-amber-700">
                  No supplier email address is available. Please add a supplier email address to send this purchase order.
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-blue-50 p-3 rounded-md">
                <Mail className="h-5 w-5 text-blue-500 flex-shrink-0" />
                <p className="text-sm">
                  This will send a professional purchase order email to: <strong>{supplierEmail}</strong>
                </p>
              </div>
            )}
            
            {orderData.status === 'SUBMITTED' && (
              <div className="mt-4 flex items-start gap-2 bg-yellow-50 p-3 rounded-md">
                <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-yellow-700">
                  This purchase order has already been sent. Sending it again will send another email to the supplier.
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEmailDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={sendEmail}
              disabled={!supplierEmail || isSendingEmail}
              className="gap-2"
            >
              {isSendingEmail ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4" />
                  Send Email
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}