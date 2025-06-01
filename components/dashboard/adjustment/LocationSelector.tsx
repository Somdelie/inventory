'use client'

import React, { useState } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
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
import { Location } from '@/types/adjustment'

interface LocationSelectorProps {
  locations: Location[]
  value: string
  onValueChange: (value: string) => void
  disabled?: boolean
  error?: string
}

export default function LocationSelector({
  locations,
  value,
  onValueChange,
  disabled = false,
  error
}: LocationSelectorProps) {
  const [open, setOpen] = useState(false)
  const selectedLocation = locations.find(location => location.id === value)

  return (
    <div>
      <Label htmlFor="location-select">Location *</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between mt-2",
              error && "border-destructive"
            )}
            disabled={disabled}
          >
            {selectedLocation ? (
              <span>{selectedLocation.name} ({selectedLocation.type})</span>
            ) : (
              <span className="text-muted-foreground">Select location...</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder="Search locations..." />
            <CommandEmpty>No location found.</CommandEmpty>
            <CommandGroup>
              {locations.map((location) => (
                <CommandItem
                  key={location.id}
                  value={`${location.name} ${location.type}`}
                  onSelect={() => {
                    onValueChange(location.id)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === location.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div>
                    <div className="font-medium">{location.name}</div>
                    <div className="text-sm text-muted-foreground capitalize">
                      {location.type.toLowerCase()}
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
      {error && (
        <p className="mt-1 text-sm text-destructive">{error}</p>
      )}
    </div>
  )
}