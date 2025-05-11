"use client"

import type React from "react"
import type { UseFormReturn } from "react-hook-form"
import { Button } from "@/components/ui/button"

import type { OrderItem } from "@/types/order-item"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatPrice } from "@/lib/formatPrice"
import { Item } from "@/types/itemTypes"


// Define props with the imported OrderItem type
interface OrderItemsSectionProps {
  form: UseFormReturn<any>
  items: Item[]
  orderItems: OrderItem[]
  setOrderItems: React.Dispatch<React.SetStateAction<OrderItem[]>>
  fetchSuppliers: (itemId: string) => Promise<any[]>
}

export default function OrderItemsSection({
  form,
  items,
  orderItems,
  setOrderItems,
  fetchSuppliers,
}: OrderItemsSectionProps) {
  const handleRemoveItem = (index: number) => {
    setOrderItems((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl">Order Items</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Items table - clean and minimal */}
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead className="text-right">Tax Rate</TableHead>
                <TableHead className="text-right">Tax Amount</TableHead>
                {/* <TableHead className="text-right">Total</TableHead> */}
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orderItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-4">
                    No items added yet
                  </TableCell>
                </TableRow>
              ) : (
                orderItems.map((item, index) => {
                  const itemDetails = items.find((i) => i.id === item.itemId)

                  return (
                    <TableRow key={index}>
                      <TableCell>
                        {itemDetails?.name}
                        <span className="text-muted-foreground text-xs ml-1">({itemDetails?.sku})</span>
                      </TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">{
                        formatPrice(item.unitPrice, form.getValues("currency"))
                        }</TableCell>
                      <TableCell className="text-right">{item.taxRate}%</TableCell>
                      <TableCell className="text-right">{
                        formatPrice(item.taxAmount, form.getValues("currency"))
                        }</TableCell>
                      {/* <TableCell className="text-right font-medium">{
                        formatPrice(item.totalPrice, form.getValues("currency"))
                        }</TableCell> */}
                      <TableCell className="text-right">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleRemoveItem(index)}
                        >
                          Remove
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={5} className="text-right">
                  Subtotal:
                </TableCell>
                <TableCell colSpan={2} className="text-right">
                  {formatPrice(
                    form.getValues("subtotal") > 0 ? form.getValues("subtotal") : 0, // Ensure subtotal is not negative
                    form.getValues("currency")
                  )}
                  {/* {form.getValues("subtotal").toFixed(2)} */}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={5} className="text-right">
                  Tax:
                </TableCell>
                <TableCell colSpan={2} className="text-right">
                  {formatPrice(
                    form.getValues("taxAmount") > 0 ? form.getValues("taxAmount") : 0, // Ensure tax amount is not negative
                    form.getValues("currency")
                  )}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={5} className="text-right">
                  Shipping:
                </TableCell>
                <TableCell colSpan={2} className="text-right">
                  {formatPrice(
                    form.getValues("shippingCost") > 0 ? form.getValues("shippingCost") : 0, // Ensure shipping cost is not negative
                    form.getValues("currency")
                  )}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={5} className="text-right">
                  Discount:
                </TableCell>
                <TableCell colSpan={2} className="text-right">
                  {formatPrice(
                    form.getValues("discount") > 0 ? form.getValues("discount") : 0, // Ensure discount is not negative
                    form.getValues("currency")
                  )}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={5} className="text-right font-bold">
                  Total:
                </TableCell>
                <TableCell colSpan={2} className="text-right font-bold">
                  {formatPrice(
                    form.getValues("totalAmount") > 0 ? form.getValues("totalAmount") : 0, // Ensure total amount is not negative
                    form.getValues("currency")
                  )}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
