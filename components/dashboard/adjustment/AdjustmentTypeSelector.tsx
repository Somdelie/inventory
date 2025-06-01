'use client'

import React, { useState } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { AdjustmentType } from '@prisma/client'
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

const adjustmentTypes = [
  { value: 'STOCK_COUNT' as const, label: 'Stock Count', description: 'Physical count adjustments' },
  { value: 'DAMAGE' as const, label: 'Damage', description: 'Damaged goods write-off' },
  { value: 'THEFT' as const, label: 'Theft', description: 'Stolen inventory' },
  { value: 'EXPIRED' as const, label: 'Expired', description: 'Expired items removal' },
  { value: 'WRITE_OFF' as const, label: 'Write Off', description: 'General write-offs' },
  { value: 'CORRECTION' as const, label: 'Correction', description: 'System corrections' },
  { value: 'OTHER' as const, label: 'Other', description: 'Other adjustments' }
]

interface AdjustmentTypeSelectorProps {
  value: AdjustmentType
  onValueChange: (value: AdjustmentType) => void
}

export default function AdjustmentTypeSelector({
  value,
  onValueChange
}: AdjustmentTypeSelectorProps) {
  const [open, setOpen] = useState(false)
  const selectedType = adjustmentTypes.find(type => type.value === value)

  return (
    <div>
      <Label htmlFor="adjustment-type-select">Adjustment Type *</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between mt-2"
          >
            {selectedType ? (
              <span>{selectedType.label}</span>
            ) : (
              <span className="text-muted-foreground">Select type...</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder="Search adjustment types..." />
            <CommandEmpty>No adjustment type found.</CommandEmpty>
            <CommandGroup>
              {adjustmentTypes.map((type) => (
                <CommandItem
                  key={type.value}
                  value={`${type.label} ${type.description}`}
                  onSelect={() => {
                    onValueChange(type.value)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === type.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div>
                    <div className="font-medium">{type.label}</div>
                    <div className="text-sm text-muted-foreground">
                      {type.description}
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}