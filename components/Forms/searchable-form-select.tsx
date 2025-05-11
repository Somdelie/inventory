"use client"

import { FormField, FormItem, FormLabel, FormMessage, FormControl } from "@/components/ui/form"
import { SearchableSelect, type SelectOption } from "@/components/ui/searchable-select"
import { useId } from "react"
import type { UseFormReturn } from "react-hook-form"

interface SearchableFormSelectProps {
  form: UseFormReturn<any>
  name: string
  label: string
  options: SelectOption[]
  placeholder?: string
  emptyMessage?: string
  disabled?: boolean
  className?: string
}

export function SearchableFormSelect({
  form,
  name,
  label,
  options,
  placeholder,
  emptyMessage,
  disabled,
  className,
}: SearchableFormSelectProps) {
  const id = useId()

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={className} id={id}>
          <FormLabel className="font-medium">{label}</FormLabel>
          <FormControl>
            <SearchableSelect
              formItemId={id}
              options={options}
              value={field.value}
              onValueChange={field.onChange}
              placeholder={placeholder}
              emptyMessage={emptyMessage}
              disabled={disabled}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}