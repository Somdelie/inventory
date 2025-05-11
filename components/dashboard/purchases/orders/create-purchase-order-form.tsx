"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { createPurchaseOrder } from "@/actions/purchase-orders"
import OrderItemsSection from "./order-items-section"
import AdditionalDetailsSection from "./additonal-details-section"
import OrderDetailsSection from "./order-details-section"
import { getSuppliersByItemId } from "@/actions/item-suppliers"
import type { Item } from "@/types/itemTypes"
import type { CreatePurchaseOrderInput, CreatePurchaseOrderLineInput } from "@/types/purchase-order"
import type { LocationDTO } from "@/types/location" // Import the LocationDTO from the correct location
import type { OrderItem } from "@/types/order-item"
import { generatePONumber } from "@/lib/generateOrderNumber"
import { SupplierDTO } from "@/types"


// Define the schema for line items - making taxAmount and totalPrice required
const lineItemSchema = z.object({
  itemId: z.string().min(1, "Item is required"),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
  unitPrice: z.coerce.number().min(0, "Unit price must be at least 0"),
  taxRate: z.coerce.number().min(0, "Tax rate must be at least 0"),
  taxAmount: z.coerce.number().min(0), // Required now, not optional
  totalPrice: z.coerce.number().min(0), // Required now, not optional
})

// Define the schema for the form
const formSchema = z.object({
  poNumber: z.string(),
  date: z.date(),
  supplierId: z.string().min(1, "Supplier is required"),
  supplierName: z.string().optional(),
  locationId: z.string().min(1, "Delivery location is required"),
  subtotal: z.coerce.number().min(0),
  taxAmount: z.coerce.number().min(0),
  shippingCost: z.coerce.number().min(0).default(0),
  discount: z.coerce.number().min(0).default(0),
  totalAmount: z.coerce.number().min(0),
  notes: z.string().optional().nullable(), // This allows null values
  paymentTerms: z.string().optional().nullable(), // This allows null values
  expectedDeliveryDate: z.date().optional().nullable(), // This allows null values
  lines: z.array(lineItemSchema).min(1, "At least one item is required"),
})

export default function PurchaseOrderForm({
  items,
  locations,
  poCount = 0,
}: {
  items: Item[]
  locations: LocationDTO[] // Using the imported LocationDTO
  poCount: number
}) {
  const router = useRouter()

  // State for suppliers fetching - properly typed
  const [suppliers, setSuppliers] = useState<SupplierDTO[]>([])
  const [loadingSuppliers, setLoadingSuppliers] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierDTO | null>(null)

  // State for order items - using the imported OrderItem type
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])

  // Generate initial PO Number with a default prefix before supplier is selected
  const generateInitialPoNumber = () => {
    // Use a temporary placeholder until an actual supplier is selected
    // This will be replaced once a supplier is selected
    return generatePONumber("TMP", poCount + 1)
  }

  // Create form with default values
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      poNumber: generateInitialPoNumber(),
      date: new Date(),
      supplierId: "",
      supplierName: "",
      locationId: "",
      subtotal: 0,
      taxAmount: 0,
      shippingCost: 0,
      discount: 0,
      totalAmount: 0,
      notes: "",
      paymentTerms: "",
      expectedDeliveryDate: null,
      lines: [],
    },
  })

  // Update form when poCount changes
  useEffect(() => {
    form.setValue("poNumber", generateInitialPoNumber())
  }, [poCount, form])

  // Watch for supplier changes in the form
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "supplierId" && value.supplierId) {
        const supplier = suppliers.find((s) => s.id === value.supplierId)
        if (supplier) {
          setSelectedSupplier(supplier)
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [form, suppliers])

  // Update PO number when selected supplier changes
  useEffect(() => {
    if (selectedSupplier?.name) {
      form.setValue("poNumber", generatePONumber(selectedSupplier.name, poCount + 1))
      form.setValue("supplierName", selectedSupplier.name)
    }
  }, [selectedSupplier, poCount, form])

  // Calculate order totals when order items change
  useEffect(() => {
    const subtotal = orderItems.reduce((total, item) => total + item.quantity * item.unitPrice, 0)
    const taxAmount = orderItems.reduce((total, item) => total + item.taxAmount, 0)

    form.setValue("subtotal", subtotal)
    form.setValue("taxAmount", taxAmount)

    const shippingCost = form.getValues("shippingCost") || 0
    const discount = form.getValues("discount") || 0
    const totalAmount = subtotal + taxAmount + shippingCost - discount

    form.setValue("totalAmount", totalAmount)

    // Set the lines with all required properties
    form.setValue(
      "lines",
      orderItems.map((item) => ({
        itemId: item.itemId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        taxRate: item.taxRate,
        taxAmount: item.taxAmount,
        totalPrice: item.totalPrice,
      })),
    )
  }, [orderItems, form])

  // Handle fetching suppliers for an item
  const fetchSuppliers = async (itemId: string) => {
    if (!itemId) {
      return []
    }

    setLoadingSuppliers(true)

    try {
      const data = await getSuppliersByItemId(itemId)
      setSuppliers(data || [])
      return data || []
    } catch (error) {
      console.error("Error fetching suppliers:", error)
      toast.error("Failed to fetch suppliers")
      return []
    } finally {
      setLoadingSuppliers(false)
    }
  }

  // Handle form submission with proper type casting
  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (orderItems.length === 0) {
      toast.error("Please add at least one item to the order")
      return
    }

    setIsSubmitting(true)

    try {
      // Find the selected supplier to get the name
      const selectedSupplier = suppliers.find((s) => s.id === values.supplierId)
      if (selectedSupplier) {
        values.supplierName = selectedSupplier.name
      }

      // Create line items that match the CreatePurchaseOrderLineInput interface
      const lines: CreatePurchaseOrderLineInput[] = orderItems.map((item) => ({
        itemId: item.itemId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        taxRate: item.taxRate,
        taxAmount: item.taxAmount,
        totalPrice: item.totalPrice,
      }))

      // Create the server-compatible data object
      const serverData: CreatePurchaseOrderInput = {
        poNumber: values.poNumber,
        date: values.date,
        supplierId: values.supplierId,
        supplierName: values.supplierName,
        locationId: values.locationId,
        subtotal: values.subtotal,
        taxAmount: values.taxAmount,
        shippingCost: values.shippingCost,
        discount: values.discount,
        totalAmount: values.totalAmount,
        // Convert null to undefined for optional string fields
        notes: values.notes || undefined,
        paymentTerms: values.paymentTerms || undefined,
        // Convert null to undefined for optional date field
        expectedDeliveryDate: values.expectedDeliveryDate || undefined,
        lines: lines,
      }

      const result = await createPurchaseOrder(serverData)

      if (result.success) {
        toast.success("Purchase order created successfully")
        router.refresh() // Refresh the page to reset form
        form.reset({
          ...form.formState.defaultValues,
          poNumber: generateInitialPoNumber(),
        })
        setOrderItems([])
      } else {
        toast.error(result.error || "Failed to create purchase order")
      }
    } catch (error) {
      console.error("Error submitting form:", error)
      toast.error("An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Left Column - Order Details */}
          <OrderDetailsSection
            form={form}
            suppliers={suppliers}
            loadingSuppliers={loadingSuppliers}
            locations={locations}
          />

          {/* Right Column - Additional Details */}
          <AdditionalDetailsSection form={form} />
        </div>

        {/* Order Items Section */}
        <OrderItemsSection
          form={form}
          items={items}
          orderItems={orderItems}
          setOrderItems={setOrderItems}
          fetchSuppliers={fetchSuppliers}
        />

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              form.reset({
                ...form.formState.defaultValues,
                poNumber: generateInitialPoNumber(),
              })
              setOrderItems([])
            }}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting || orderItems.length === 0}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Purchase Order"
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
