"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Check, ChevronsUpDown, Loader2, FileText, PlusCircle, AlertCircle } from "lucide-react"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createPurchaseOrder, getItemsBySupplier } from "@/actions/purchase-orders"
import OrderItemsSection from "./order-items-section"
import AdditionalDetailsSection from "./additonal-details-section"
import OrderDetailsSection from "./order-details-section"
import type { CreatePurchaseOrderInput, CreatePurchaseOrderLineInput } from "@/types/purchase-order"
import type { LocationDTO, SupplierDTO } from "@/types"
import type { Item } from "@/types/itemTypes"
import { generatePONumber } from "@/lib/generateOrderNumber"
import { cn } from "@/lib/utils"

// Define the schema for line items - making totalPrice required
const lineItemSchema = z.object({
  itemId: z.string().min(1, "Item is required"),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
  unitPrice: z.coerce.number().min(0, "Unit price must be at least 0"),
  taxRate: z.coerce.number().min(0, "Tax rate must be at least 0"),
  taxAmount: z.coerce.number().min(0).optional(),
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

// Define a type for order items that aligns with our line item schema
interface OrderItem {
  itemId: string
  quantity: number
  unitPrice: number
  taxRate: number
  taxAmount: number
  totalPrice: number // Required, not optional
}

export default function PurchaseOrderForm({
  items: allItems, // Rename to allItems to indicate it contains all items
  locations,
  suppliers, // Now accepting suppliers as a prop
  poCount = 0,
}: {
  items: Item[]
  locations: LocationDTO[]
  suppliers: SupplierDTO[] // Added suppliers prop
  poCount: number
  organizationId?: string // Made optional as we now pass suppliers directly
}) {
  const router = useRouter()

  // State for suppliers - initialized with the props
  const [loadingSuppliers, setLoadingSuppliers] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierDTO | null>(null)

  // State for supplier's items
  const [supplierItems, setSupplierItems] = useState<Item[]>([])
  const [loadingItems, setLoadingItems] = useState(false)

  // State for order items and submission
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // State for the item selection form
  const [selectedItemId, setSelectedItemId] = useState<string>("")
  const [quantity, setQuantity] = useState<number>(1)
  const [unitPrice, setUnitPrice] = useState<number>(0)
  const [taxRate, setTaxRate] = useState<number>(0)

  // Create form with default values
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      poNumber: generatePONumber("NEW", poCount + 1), // Use NEW as default initially
      date: new Date(),
      supplierId: "",
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

  // Update PO number when selected supplier changes
  useEffect(() => {
    if (selectedSupplier?.name) {
      // When a supplier is selected, update the PO number using the supplier's name
      const newPoNumber = generatePONumber(selectedSupplier.name, poCount + 1)
      console.log("Updating PO Number with supplier:", selectedSupplier.name)
      console.log("New PO Number:", newPoNumber)
      form.setValue("poNumber", newPoNumber)
      form.setValue("supplierName", selectedSupplier.name)
    }
  }, [selectedSupplier, poCount, form])

  // Calculate order totals when order items change
  useEffect(() => {
    const subtotal = orderItems.reduce((total, item) => total + item.quantity * item.unitPrice, 0)
    const taxAmount = orderItems.reduce(
      (total, item) => total + (item.quantity * item.unitPrice * item.taxRate) / 100,
      0,
    )

    form.setValue("subtotal", subtotal)
    form.setValue("taxAmount", taxAmount)

    const shippingCost = form.getValues("shippingCost") || 0
    const discount = form.getValues("discount") || 0
    const totalAmount = subtotal + taxAmount + shippingCost - discount

    form.setValue("totalAmount", totalAmount)

    // Set the lines with properly calculated totalPrice
    form.setValue(
      "lines",
      orderItems.map((item) => ({
        itemId: item.itemId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        taxRate: item.taxRate,
        taxAmount: item.taxAmount,
        totalPrice: item.quantity * item.unitPrice * (1 + item.taxRate / 100), // Calculate total price with tax
      })),
    )
  }, [orderItems, form])

  // Handle supplier selection
  const handleSupplierChange = async (supplierId: string) => {
    if (!supplierId) {
      setSelectedSupplier(null)
      setSupplierItems([])
      // Reset PO number to default when supplier is cleared
      form.setValue("poNumber", generatePONumber("NEW", poCount + 1))
      return
    }

    const supplier = suppliers.find((s) => s.id === supplierId)
    if (!supplier) return

    setSelectedSupplier(supplier)
    form.setValue("supplierId", supplierId)
    form.setValue("supplierName", supplier.name)

    // Update PO number with supplier name
    const newPoNumber = generatePONumber(supplier.name, poCount + 1)
    console.log("Supplier selected:", supplier.name)
    console.log("New PO Number:", newPoNumber)
    form.setValue("poNumber", newPoNumber)

    // Fetch items for this supplier
    setLoadingItems(true)
    try {
      const fetchedItems = await getItemsBySupplier(supplierId)

      // First cast to unknown, then to Item[] - this satisfies TypeScript's strict type checking
      const mappedItems = fetchedItems as unknown as Item[]

      // Set the state with the properly typed items
      setSupplierItems(mappedItems)
    } catch (error) {
      console.error("Error fetching supplier items:", error)
      toast.error("Failed to fetch items for this supplier")
      setSupplierItems([])
    } finally {
      setLoadingItems(false)
    }
  }

  // Clear the current order
  const clearOrder = () => {
    setOrderItems([])
    setSelectedItemId("")
    setQuantity(1)
    setUnitPrice(0)
    setTaxRate(0)
    toast.warning("Order cleared")
  }

  // Handle adding an item to the order
  const handleAddItem = () => {
    if (!selectedItemId) {
      toast.error("Please select an item")
      return
    }

    // Calculate tax amount
    const taxAmount = (quantity * unitPrice * taxRate) / 100
    // Calculate total price with tax
    const totalPrice = quantity * unitPrice * (1 + taxRate / 100)

    // Create new order item
    const newItem: OrderItem = {
      itemId: selectedItemId,
      quantity,
      unitPrice,
      taxRate,
      taxAmount,
      totalPrice,
    }

    setOrderItems((prev) => [...prev, newItem])
    toast.success("Item added to order")

    // Reset form fields but keep the item selection open
    setSelectedItemId("")
    setQuantity(1)
    setUnitPrice(0)
    setTaxRate(0)
  }

  // Handle form submission
  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (orderItems.length === 0) {
      toast.error("Please add at least one item to the order")
      return
    }

    setIsSubmitting(true)

    try {
      // Create line items for the purchase order
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
        form.reset()
        setOrderItems([])
        setSelectedSupplier(null)
        setSupplierItems([])
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

  // Check if supplier can be changed (only if no items added yet)
  const canChangeSupplier = orderItems.length === 0

  return (
    <div className="">
      <div className="flex items-center gap-2 mb-6">
        <FileText className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold tracking-tight">Create Purchase Order</h1>
      </div>

      {/* Supplier selection - first step */}
      <div className="bg-background border rounded-md p-4 mb-6">
        <h2 className="text-lg font-medium mb-4">Select Supplier</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="supplier-select" className="mb-1.5 block">
              Supplier
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between"
                  disabled={!canChangeSupplier || loadingSuppliers}
                >
                  {selectedSupplier ? selectedSupplier.name : "Select a supplier"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command className="w-full">
                  <CommandInput placeholder="Search supplier..." />
                  <CommandList>
                    <CommandEmpty>No supplier found.</CommandEmpty>
                    <CommandGroup>
                      {loadingSuppliers ? (
                        <div className="flex items-center justify-center p-2">
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          <span>Loading suppliers...</span>
                        </div>
                      ) : suppliers.length > 0 ? (
                        suppliers.map((supplier) => (
                          <CommandItem
                            key={supplier.id}
                            value={supplier.name}
                            onSelect={() => {
                              if (supplier.id) {
                                handleSupplierChange(supplier.id)
                              }
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedSupplier?.id === supplier.id ? "opacity-100" : "opacity-0",
                              )}
                            />
                            {supplier.name}
                          </CommandItem>
                        ))
                      ) : (
                        <CommandItem disabled>No suppliers available</CommandItem>
                      )}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {!canChangeSupplier && (
              <p className="text-xs text-muted-foreground mt-1">
                Supplier cannot be changed after adding items.
                <Button variant="link" className="p-0 h-auto text-xs underline" onClick={clearOrder}>
                  Clear items
                </Button>{" "}
                to change supplier.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Display alert if no supplier selected */}
      {!selectedSupplier && (
        <Alert className="mb-6 bg-red-50 text-red-800 flex items-center" variant={"destructive"}>
          <AlertCircle className="h-4 w-4 mb-4" />
          <AlertDescription>Please select a supplier to continue creating your purchase order.</AlertDescription>
        </Alert>
      )}

      {/* Only show the rest of the form if a supplier is selected */}
      {selectedSupplier && (
        <>
          {/* Item selection form */}
          <div className="bg-background border rounded-md p-4 mb-6">
            <h2 className="text-lg font-medium mb-4">Order Items for {selectedSupplier.name}</h2>

            {loadingItems ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span>Loading items...</span>
              </div>
            ) : supplierItems.length === 0 ? (
              <Alert className="mb-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No items found for this supplier. Please select a different supplier or add items to this supplier's
                  catalog.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="grid grid-cols-5 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="item-select" className="mb-1.5 block">
                    Item
                  </Label>
                  <select
                    id="item-select"
                    title="Select an item"
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={selectedItemId}
                    onChange={(e) => {
                      const itemId = e.target.value
                      setSelectedItemId(itemId)

                      if (itemId) {
                        const item = supplierItems.find((i) => i.id === itemId)
                        if (item) {
                          setUnitPrice(item.costPrice || 0)
                          // You could also set a default tax rate here if available
                        }
                      }
                    }}
                  >
                    <option value="">Select an item</option>
                    {supplierItems.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} ({item.sku})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="quantity-input" className="mb-1.5 block">
                    Quantity
                  </Label>
                  <Input
                    id="quantity-input"
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Number.parseInt(e.target.value) || 0)}
                    min={1}
                  />
                </div>

                <div>
                  <Label htmlFor="price-input" className="mb-1.5 block">
                    Unit Price
                  </Label>
                  <Input
                    id="price-input"
                    type="number"
                    step="1"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(Number.parseFloat(e.target.value) || 0)}
                    min={0}
                  />
                </div>

                <div>
                  <Label htmlFor="tax-rate-input" className="mb-1.5 block">
                    Tax Rate (%)
                  </Label>
                  <Input
                    id="tax-rate-input"
                    type="number"
                    step="1"
                    value={taxRate}
                    onChange={(e) => setTaxRate(Number.parseFloat(e.target.value) || 0)}
                    min={0}
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end mt-4">
              <Button
                type="button"
                onClick={handleAddItem}
                size="sm"
                className="text-white bg-primary hover:bg-primary/90"
                disabled={loadingItems || supplierItems.length === 0 || !selectedItemId}
              >
                <PlusCircle className="h-4 w-4 mr-1" />
                Add Item
              </Button>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column - Order Details */}
                <OrderDetailsSection
                  form={form}
                  suppliers={[selectedSupplier]} // Pass only the selected supplier
                  loadingSuppliers={false}
                  locations={locations}
                  disableSupplierChange={true} // Always disable since we've already selected
                />

                {/* Right Column - Additional Details */}
                <AdditionalDetailsSection form={form} />
              </div>

              {/* Order Items Section - Only the table, not the form */}
              <OrderItemsSection
                form={form}
                items={allItems} // Pass all items for lookup
                orderItems={orderItems}
                setOrderItems={setOrderItems}
                fetchSuppliers={() => Promise.resolve([])} // Not used in this approach
              />

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 mt-8">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    form.reset()
                    setOrderItems([])
                    setSelectedSupplier(null)
                    setSupplierItems([])
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting || orderItems.length === 0} className="gap-1.5">
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
        </>
      )}
    </div>
  )
}
