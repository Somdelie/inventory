"use client"

import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { format } from "date-fns"
import { CalendarIcon, Loader2, RefreshCw } from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { updateItemSupplier } from "@/actions/item-suppliers"

const formSchema = z.object({
  isPreferred: z.boolean().default(false),
  supplierSku: z.string().optional(),
  leadTime: z.coerce.number().int().min(0).optional().nullable(),
  minOrderQty: z.coerce.number().int().min(0).optional().nullable(),
  unitCost: z.coerce.number().min(0).optional().nullable(),
  lastPurchaseDate: z.date().optional().nullable(),
  notes: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface ItemSupplierFormProps {
  supplier: {
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
  }
  itemId: string
}

export default function ItemSupplierForm({ supplier, itemId }: ItemSupplierFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGeneratingSku, setIsGeneratingSku] = useState(false)
  const router = useRouter()

  // Create the form with default values from the supplier
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      isPreferred: supplier.isPreferred || false,
      supplierSku: supplier.supplierSku || "",
      leadTime: supplier.leadTime || null,
      minOrderQty: supplier.minOrderQty || null,
      unitCost: supplier.unitCost || null,
      lastPurchaseDate: supplier.lastPurchaseDate ? new Date(supplier.lastPurchaseDate) : null,
      notes: supplier.notes || "",
    },
  })

  // Update form values when supplier changes
  useEffect(() => {
    form.reset({
      isPreferred: supplier.isPreferred || false,
      supplierSku: supplier.supplierSku || "",
      leadTime: supplier.leadTime || null,
      minOrderQty: supplier.minOrderQty || null,
      unitCost: supplier.unitCost || null,
      lastPurchaseDate: supplier.lastPurchaseDate ? new Date(supplier.lastPurchaseDate) : null,
      notes: supplier.notes || "",
    });
  }, [supplier, form]);

  async function onSubmit(values: FormValues) {
    try {
      setIsSubmitting(true)
      // Pass both the supplierId and itemId for the relationship lookup
      const result = await updateItemSupplier(supplier.supplierId, {
        ...values,
        itemId: itemId,
        lastPurchaseDate: values.lastPurchaseDate ? values.lastPurchaseDate.toISOString() : null,
      })

      if (result.success) {
        toast.success(result.message || "Supplier updated successfully")
        router.refresh()
      } else {
        toast.error(result.message || "Failed to update supplier")
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Generate a random supplier SKU
  const generateSupplierSku = () => {
    setIsGeneratingSku(true)
    // Generate a random SKU based on supplier name and current date
    try {
      // Extract first 3 letters of supplier name (uppercase)
      const supplierPrefix = supplier.name.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'X');
      
      // Generate random alphanumeric characters (4 digits)
      const randomPart = Math.floor(1000 + Math.random() * 9000).toString();
      
      // Add current date as YYMMDD format
      const date = new Date();
      const datePart = date.getFullYear().toString().substring(2) + 
                      (date.getMonth() + 1).toString().padStart(2, '0') + 
                      date.getDate().toString().padStart(2, '0');
      
      // Combine all parts
      const generatedSku = `${supplierPrefix}-${randomPart}-${datePart}`;
      
      // Update the form
      form.setValue('supplierSku', generatedSku);
      toast.success('Generated supplier SKU');
    } catch (error) {
      console.error('Error generating SKU:', error);
      toast.error('Failed to generate supplier SKU');
    } finally {
      setIsGeneratingSku(false);
    }
  };

  return (
    <Card className="rounded-none border-none shadow-none py-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="isPreferred"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Preferred Supplier</FormLabel>
                    <FormDescription>Mark this supplier as preferred for this item</FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="supplierSku"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Supplier SKU</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input placeholder="Supplier's SKU for this item" {...field} />
                    </FormControl>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="icon"
                            type="button"
                            onClick={generateSupplierSku}
                            disabled={isGeneratingSku}
                          >
                            <RefreshCw className={cn(
                              "h-4 w-4", 
                              isGeneratingSku && "animate-spin"
                            )} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Generate supplier SKU</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="leadTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lead Time (days)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        value={field.value === null ? "" : field.value}
                        onChange={(e) => field.onChange(e.target.value === "" ? null : Number.parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="minOrderQty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Order Quantity</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        value={field.value === null ? "" : field.value}
                        onChange={(e) => field.onChange(e.target.value === "" ? null : Number.parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="unitCost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit Cost</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                      value={field.value === null ? "" : field.value}
                      onChange={(e) => field.onChange(e.target.value === "" ? null : Number.parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastPurchaseDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Last Purchase Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                        >
                          {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value || undefined}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Additional notes about this supplier" className="resize-none" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Supplier"
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}