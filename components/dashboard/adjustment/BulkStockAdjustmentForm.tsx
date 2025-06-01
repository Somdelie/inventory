'use client'

import React, { useState, useEffect } from 'react'
import { ArrowLeft, AlertCircle, Save, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AdjustmentType } from '@prisma/client'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { toast } from 'sonner'

// Import the separated components
import LocationSelector from './LocationSelector'
import AdjustmentTypeSelector from './AdjustmentTypeSelector'
import ItemSelector from './ItemSelector'
import AdjustmentLineItem from './AdjustmentLineItem'
import { 
  ItemForAdjustment, 
  Location, 
  AdjustmentLineForm 
} from '@/types/adjustment'

import { 
  createStockAdjustment, 
  getItemsForAdjustment, 
  getLocations,
  CreateAdjustmentInput
} from '@/actions/stock-adjustments'

interface BulkStockAdjustmentFormProps {
  organizationId: string
  currentUserId: string
}

export default function BulkStockAdjustmentForm({ 
  organizationId, 
  currentUserId 
}: BulkStockAdjustmentFormProps) {
  const router = useRouter()
  
  // Form state
  const [selectedLocationId, setSelectedLocationId] = useState('')
  const [adjustmentType, setAdjustmentType] = useState<AdjustmentType>('STOCK_COUNT')
  const [reason, setReason] = useState('')
  const [notes, setNotes] = useState('')
  const [adjustmentLines, setAdjustmentLines] = useState<AdjustmentLineForm[]>([])
  
  // Data state
  const [locations, setLocations] = useState<Location[]>([])
  const [items, setItems] = useState<ItemForAdjustment[]>([])
  
  // Loading states
  const [loadingLocations, setLoadingLocations] = useState(true)
  const [loadingItems, setLoadingItems] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  
  // Error state
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Load locations on mount
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const result = await getLocations(organizationId)
        if (result.success) {
          setLocations(result.data || [])
        }
      } catch (error) {
        console.error('Error fetching locations:', error)
      } finally {
        setLoadingLocations(false)
      }
    }

    fetchLocations()
  }, [organizationId])

  // Load items when location is selected
  useEffect(() => {
    if (selectedLocationId) {
      const fetchItems = async () => {
        setLoadingItems(true)
        try {
          const result = await getItemsForAdjustment(organizationId, selectedLocationId)
          if (result.success) {
            setItems(result.data || [])
          }
        } catch (error) {
          console.error('Error fetching items:', error)
        } finally {
          setLoadingItems(false)
        }
      }

      fetchItems()
    } else {
      setItems([])
    }
  }, [organizationId, selectedLocationId])

  const handleItemSelect = (item: ItemForAdjustment) => {
    const newLine: AdjustmentLineForm = {
      itemId: item.id,
      beforeQuantity: item.currentStock,
      afterQuantity: item.currentStock,
      adjustmentQuantity: 0,
      notes: '',
      item: item
    }
    
    setAdjustmentLines([...adjustmentLines, newLine])
  }

  const handleLineUpdate = (index: number, field: string, value: any) => {
    const updatedLines = [...adjustmentLines]
    updatedLines[index] = { ...updatedLines[index], [field]: value }
    setAdjustmentLines(updatedLines)
  }

  const handleRemoveLine = (index: number) => {
    const updatedLines = adjustmentLines.filter((_, i) => i !== index)
    setAdjustmentLines(updatedLines)
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!selectedLocationId) {
      newErrors.location = 'Location is required'
    }

    if (!reason.trim()) {
      newErrors.reason = 'Reason is required'
    }

    if (adjustmentLines.length === 0) {
      newErrors.lines = 'At least one item is required'
    }

    // Validate each line
    adjustmentLines.forEach((line, index) => {
      if (line.afterQuantity < 0) {
        newErrors[`line_${index}_quantity`] = 'Final stock cannot be negative'
      }
      
      // Require notes for stock reductions
      const adjustment = line.adjustmentQuantity
      if (adjustment < 0 && !line.notes?.trim()) {
        newErrors[`line_${index}_notes`] = 'Reason is required for stock reductions'
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setSubmitting(true)

    try {
      const adjustmentData: CreateAdjustmentInput = {
        locationId: selectedLocationId,
        adjustmentType,
        reason: reason.trim(),
        notes: notes.trim() || undefined,
        lines: adjustmentLines.map(line => ({
          itemId: line.itemId,
          beforeQuantity: line.beforeQuantity,
          afterQuantity: line.afterQuantity,
          adjustmentQuantity: line.adjustmentQuantity,
          notes: line.notes?.trim() || undefined
        })),
        organizationId,
        createdBy: currentUserId
      }

      const result = await createStockAdjustment(adjustmentData)
      
      if (result.success) {
        toast.success(result.message || 'Adjustment created successfully')
//reset form state
        setSelectedLocationId('')
        setAdjustmentType('STOCK_COUNT')
        setReason('')
        setNotes('')
        setAdjustmentLines([])
        setErrors({})
      } else {
        toast.error(result.error || 'Failed to create adjustment')
      }
    } catch (error) {
      console.error('Error creating adjustment:', error)
      toast.error('Failed to create adjustment')
    } finally {
      setSubmitting(false)
    }
  }

  const selectedItemIds = adjustmentLines.map(line => line.itemId)
  const totalAdjustment = adjustmentLines.reduce((sum, line) => sum + line.adjustmentQuantity, 0)

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-4 mb-4">
          <Link
            href="/dashboard/inventory/adjustments"
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Adjustments
          </Link>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Create Stock Adjustment</h1>
        <p className="text-gray-600 mt-2">
          Adjust inventory levels for multiple items at once
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Adjustment Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <LocationSelector
              locations={locations}
              value={selectedLocationId}
              onValueChange={(value) => {
                setSelectedLocationId(value)
                setAdjustmentLines([])
              }}
              disabled={loadingLocations}
              error={errors.location}
            />

            <AdjustmentTypeSelector
              value={adjustmentType}
              onValueChange={setAdjustmentType}
            />

            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="reason">Reason *</Label>
              <Input
                id="reason"
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter reason for this adjustment..."
                className={cn(errors.reason && "border-destructive")}
              />
              {errors.reason && (
                <p className="text-sm text-destructive">{errors.reason}</p>
              )}
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes about this adjustment..."
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Item Selection */}
        {selectedLocationId && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Add Items</h2>
            
            <ItemSelector
              items={items}
              selectedItems={selectedItemIds}
              onItemSelect={handleItemSelect}
              loading={loadingItems}
            />
            
            {errors.lines && (
              <p className="mt-2 text-sm text-destructive flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.lines}
              </p>
            )}
          </div>
        )}

        {/* Adjustment Lines */}
        {adjustmentLines.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">Adjustment Items</h2>
              <div className="text-sm text-gray-600">
                {adjustmentLines.length} item{adjustmentLines.length !== 1 ? 's' : ''} • 
                Net adjustment: {totalAdjustment > 0 ? '+' : ''}{totalAdjustment}
              </div>
            </div>
            
            <div className="space-y-4">
              {adjustmentLines.map((line, index) => (
                <AdjustmentLineItem
                  key={line.itemId}
                  line={line}
                  index={index}
                  onUpdate={handleLineUpdate}
                  onRemove={handleRemoveLine}
                  adjustmentType={adjustmentType}
                />
              ))}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Button variant="outline" asChild>
            <Link href="/dashboard/inventory/adjustments">
              Cancel
            </Link>
          </Button>
          <Button
            type="submit"
            disabled={submitting || adjustmentLines.length === 0}
          >
            {submitting ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {submitting ? 'Creating...' : 'Create Adjustment'}
          </Button>
        </div>
      </form>
    </div>
  )
}