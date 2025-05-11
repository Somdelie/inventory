"use client"

import type { UseFormReturn } from "react-hook-form"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import type { LocationDTO } from "@/types/location"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { SupplierDTO } from "@/types"
import { SearchableFormSelect } from "@/components/Forms/searchable-form-select"

interface OrderDetailsSectionProps {
  form: UseFormReturn<any>
  suppliers: SupplierDTO[]
  loadingSuppliers: boolean
  locations: LocationDTO[]
  disableSupplierChange?: boolean
}

export default function OrderDetailsSection({
  form,
  locations,
}: OrderDetailsSectionProps) {
  // Transform locations to the format expected by SearchableSelect
  const locationOptions = locations.map((location) => ({
    value: location.id,
    label: `${location.name} (${location.type})`,
  }))

  // Transform suppliers to the format expected by SearchableSelect

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl">Order Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* PO Number */}
        <FormField
          control={form.control}
          name="poNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-medium">PO Number</FormLabel>
              <FormControl>
                <Input {...field} readOnly className="bg-muted/50" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Order Date */}
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-medium">Order Date</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  {...field}
                  value={field.value ? new Date(field.value).toISOString().split("T")[0] : ""}
                  onChange={(e) => {
                    field.onChange(e.target.value ? new Date(e.target.value) : null)
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Delivery Location */}
        <SearchableFormSelect
          form={form}
          name="locationId"
          label="Delivery Location"
          options={locationOptions}
          placeholder="Select a location"
          emptyMessage="No locations available"
          disabled={locations.length === 0}
        />
      </CardContent>
    </Card>
  )
}
