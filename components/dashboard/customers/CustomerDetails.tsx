"use client"

import { useTransition } from "react"
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  ShoppingCart,
  DollarSign,
  Edit,
  Trash2,
  Plus,
  Package,
  Eye,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import CreateOrderModal from "./CreateOrderModal"
import { formatPrice } from "@/lib/formatPrice"


// Types
type SalesOrderStatus =
  | "DRAFT"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "COMPLETED"
  | "CANCELED"
  | "RETURNED"
  | "REFUNDED"
  | "FAILED"
  | "PENDING"

type PaymentStatus = "PENDING" | "PARTIAL" | "PAID" | "REFUNDED"

interface SalesOrderLine {
  id: string
  quantity: number
  unitPrice: number
  totalPrice: number
  item: {
    name: string
    sku: string
  }
}

interface SalesOrder {
  id: string
  orderNumber: string
  date: string
  status: SalesOrderStatus
  subtotal: number
  taxAmount: number
  shippingCost: number | null
  discount: number | null
  totalAmount: number
  paymentStatus: PaymentStatus
  paymentMethod: string | null
  notes: string | null
  source: "SALES_ORDER" | "POS"
  createdAt: string
  lines: SalesOrderLine[]
}

interface Customer {
  id: string
  name: string
  email: string | null
  phone: string | null
  address: string | null
  taxId: string | null
  notes: string | null
  isActive: boolean
  createdAt: string
  updatedAt?: string
  organizationId: string
  salesOrders?: SalesOrder[]
}

interface CustomerDetailsProps {
  customer: Customer
  currentUserId: string
}

export default function CustomerDetails({ customer, currentUserId }: CustomerDetailsProps) {
  const [isPending, startTransition] = useTransition()

  const handleGoBack = () => {
    startTransition(() => {
      window.history.back()
    })
  }

  const handleOrderCreated = () => {
    // Refresh the page or refetch data
    window.location.reload()
  }

  const getStatusBadge = (status: SalesOrderStatus) => {
    switch (status) {
      case "PENDING":
        return { label: "Pending", className: "bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100" }
      case "DRAFT":
        return { label: "Draft", className: "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100" }
      case "CONFIRMED":
        return { label: "Confirmed", className: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100" }
      case "PROCESSING":
        return { label: "Processing", className: "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100" }
      case "COMPLETED":
        return { label: "Completed", className: "bg-green-50 text-green-700 border-green-200 hover:bg-green-100" }
      case "CANCELED":
        return { label: "Canceled", className: "bg-red-50 text-red-700 border-red-200 hover:bg-red-100" }
      default:
        return { label: status, className: "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100" }
    }
  }

  const getPaymentStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case "PENDING":
        return { label: "Payment Pending", className: "bg-yellow-50 text-yellow-700 border-yellow-200" }
      case "PAID":
        return { label: "Paid", className: "bg-green-50 text-green-700 border-green-200" }
      case "PARTIAL":
        return { label: "Partially Paid", className: "bg-orange-50 text-orange-700 border-orange-200" }
      case "REFUNDED":
        return { label: "Refunded", className: "bg-red-50 text-red-700 border-red-200" }
      default:
        return { label: status, className: "bg-gray-50 text-gray-700 border-gray-200" }
    }
  }

  const salesOrders = customer.salesOrders || []
  const totalOrders = salesOrders.length
  const totalSpent = salesOrders.reduce((sum, order) => sum + order.totalAmount, 0)
  const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0
  const completedOrders = salesOrders.filter((order) => order.status === "COMPLETED").length

  return (
    <div className="">
      <div className="">
        <div className="">
          <div className="">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleGoBack} disabled={isPending}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                  <h1 className="text-2xl font-bold flex items-center gap-2 text-primary">
                    {customer.name}
                    <Badge
                      className={
                        customer.isActive
                          ? "bg-green-100 text-green-800 border-green-300"
                          : "bg-red-100 text-red-800 border-red-300"
                      }
                    >
                      {customer.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </h1>
                  <p className="text-sm text-gray-500">
                    Customer since {new Date(customer.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Customer
                </Button>
                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
                <CreateOrderModal
                  customer={{
                    id: customer.id,
                    name: customer.name,
                    organizationId: customer.organizationId,
                  }}
                  createdBy={currentUserId}
                  onOrderCreated={handleOrderCreated}
                >
                  <Button className="bg-primary hover:bg-primary/90 text-white" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    New Order
                  </Button>
                </CreateOrderModal>
              </div>
            </div>

            {/* Layout Structure */}
            <div className="space-y-6">
              {/* Customer Statistics - Full Width */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <ShoppingCart className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Total Orders</p>
                        <p className="text-xl font-bold text-gray-900">{totalOrders}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <DollarSign className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Total Spent</p>
                        <p className="text-xl font-bold text-gray-900">{
                            formatPrice(totalSpent)
                            }</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <DollarSign className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Avg Order Value</p>
                        <p className="text-xl font-bold text-gray-900">{
                            formatPrice(averageOrderValue)
                            }</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                        <Package className="h-4 w-4 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Completed</p>
                        <p className="text-xl font-bold text-gray-900">{completedOrders}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Customer Information */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5 text-gray-600" />
                        Customer Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <User className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500">Name</p>
                            <p className="font-medium text-gray-900">{customer.name}</p>
                          </div>
                        </div>

                        {customer.email && (
                          <div className="flex items-center gap-3">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-500">Email</p>
                              <p className="font-medium text-gray-900">{customer.email}</p>
                            </div>
                          </div>
                        )}

                        {customer.phone && (
                          <div className="flex items-center gap-3">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-500">Phone</p>
                              <p className="font-medium text-gray-900">{customer.phone}</p>
                            </div>
                          </div>
                        )}

                        {customer.address && (
                          <div className="flex items-center gap-3">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-500">Address</p>
                              <p className="font-medium text-gray-900">{customer.address}</p>
                            </div>
                          </div>
                        )}

                        {customer.taxId && (
                          <div className="flex items-center gap-3">
                            <FileText className="h-4 w-4 text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-500">Tax ID</p>
                              <p className="font-medium text-gray-900">{customer.taxId}</p>
                            </div>
                          </div>
                        )}

                        <Separator />

                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Status:</span>
                            <Badge
                              className={
                                customer.isActive
                                  ? "bg-green-100 text-green-800 border-green-300"
                                  : "bg-red-100 text-red-800 border-red-300"
                              }
                            >
                              {customer.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Created:</span>
                            <span className="text-gray-900">{new Date(customer.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Last Updated:</span>
                            <span className="text-gray-900">
                              {customer.updatedAt ? new Date(customer.updatedAt).toLocaleDateString() : 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-6">
                  {/* Customer Notes */}
                  {customer.notes && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-gray-600" />
                          Notes
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600">{customer.notes}</p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Quick Actions */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <CreateOrderModal
                          customer={{
                            id: customer.id,
                            name: customer.name,
                            organizationId: customer.organizationId,
                          }}
                          createdBy={currentUserId}
                          onOrderCreated={handleOrderCreated}
                        >
                          <Button variant="outline" className="w-full justify-start">
                            <Plus className="h-4 w-4 mr-2" />
                            Create New Order
                          </Button>
                        </CreateOrderModal>
                        <Button variant="outline" className="w-full justify-start">
                          <Mail className="h-4 w-4 mr-2" />
                          Send Email
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Customer
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          View All Orders
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Recent Orders - Full Width */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Recent Orders</CardTitle>
                  <Button variant="outline" size="sm">
                    View All Orders
                  </Button>
                </CardHeader>
                <CardContent>
                  {salesOrders.length > 0 ? (
                    <div className="space-y-4">
                      {/* Table Header */}
                      <div className="grid grid-cols-6 gap-4 pb-2 border-b text-sm font-medium text-gray-600">
                        <div>Order #</div>
                        <div>Date</div>
                        <div>Items</div>
                        <div>Status</div>
                        <div>Total</div>
                        <div>Actions</div>
                      </div>

                      {/* Order Rows */}
                      {salesOrders.map((order) => {
                        const statusBadge = getStatusBadge(order.status)
                        const paymentBadge = getPaymentStatusBadge(order.paymentStatus)

                        return (
                          <div key={order.id} className="grid grid-cols-6 gap-4 py-3 border-b last:border-b-0">
                            <div className="font-medium text-primary">{order.orderNumber}</div>
                            <div className="text-gray-600 text-sm">{new Date(order.date).toLocaleDateString()}</div>
                            <div className="text-gray-600 text-sm">{order.lines.length} items</div>
                            <div className="flex flex-col gap-1">
                              <Badge className={statusBadge.className} variant="outline">
                                {statusBadge.label}
                              </Badge>
                              <Badge className={paymentBadge.className} variant="outline">
                                {paymentBadge.label}
                              </Badge>
                            </div>
                            <div className="font-medium text-gray-900">{
                                formatPrice(order.totalAmount)
                                }</div>
                            <div>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Orders Yet</h3>
                      <p className="text-gray-600 mb-4">This customer hasn't placed any orders yet.</p>
                      <CreateOrderModal
                        customer={{
                          id: customer.id,
                          name: customer.name,
                          organizationId: customer.organizationId,
                        }}
                        createdBy={currentUserId}
                        onOrderCreated={handleOrderCreated}
                      >
                        <Button className="bg-primary hover:bg-primary/90 text-white">
                          <Plus className="h-4 w-4 mr-2" />
                          Create First Order
                        </Button>
                      </CreateOrderModal>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}