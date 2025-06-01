'use client'

import React, { useState, useEffect } from 'react'
import { AlertCircle, Trash2, Plus, Minus } from 'lucide-react'
import { AdjustmentType } from '@prisma/client'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from "@/lib/utils"
import { AdjustmentLineForm } from '@/types/adjustment'

interface AdjustmentLineItemProps {
  line: AdjustmentLineForm
  index: number
  onUpdate: (index: number, field: string, value: any) => void
  onRemove: (index: number) => void
  adjustmentType: AdjustmentType
}

export default function AdjustmentLineItem({
  line,
  index,
  onUpdate,
  onRemove,
  adjustmentType
}: AdjustmentLineItemProps) {
  const currentStock = line.beforeQuantity
  const [adjustmentAmount, setAdjustmentAmount] = useState(Math.abs(line.adjustmentQuantity) || 0);
  const [operationType, setOperationType] = useState<'increase' | 'decrease'>(
    line.adjustmentQuantity < 0 ? 'decrease' : 'increase'
  );

  // Determine if this adjustment type should only allow decreases
  const isReductionOnly = ['DAMAGE', 'THEFT', 'EXPIRED', 'WRITE_OFF'].includes(adjustmentType);
  
  // FIXED: Force operation type to 'decrease' for reduction-only adjustment types
  useEffect(() => {
    if (isReductionOnly) {
      setOperationType('decrease');
      // Also update the parent immediately when adjustment type changes
      if (adjustmentAmount > 0) {
        updateParent(adjustmentAmount, 'decrease');
      }
    }
  }, [adjustmentType, isReductionOnly, adjustmentAmount]);

  // Function to update parent with new values
  const updateParent = (newAmount: number, newOperation: 'increase' | 'decrease') => {
    const finalAdjustment = newOperation === 'decrease' ? -newAmount : newAmount;
    const newQuantity = Math.max(0, currentStock + finalAdjustment);
    
    onUpdate(index, 'adjustmentQuantity', finalAdjustment);
    onUpdate(index, 'afterQuantity', newQuantity);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    const maxAmount = operationType === 'decrease' ? currentStock : 9999;
    const newAmount = Math.max(0, Math.min(maxAmount, value));
    
    setAdjustmentAmount(newAmount);
    updateParent(newAmount, operationType);
  };

  const handleOperationChange = (newOperation: 'increase' | 'decrease') => {
    // FIXED: Prevent changing operation type for reduction-only adjustments
    if (isReductionOnly && newOperation === 'increase') {
      return; // Don't allow changing to increase for damage/theft/etc.
    }
    
    setOperationType(newOperation);
    updateParent(adjustmentAmount, newOperation);
  };

  const handleQuickAmount = (amount: number) => {
    setAdjustmentAmount(amount);
    updateParent(amount, operationType);
  };

  const finalQuantity = operationType === 'decrease' 
    ? Math.max(0, currentStock - adjustmentAmount)
    : currentStock + adjustmentAmount;

  const getOperationColor = () => {
    if (operationType === 'decrease') {
      return 'border-red-300 bg-red-50 text-red-700';
    }
    return 'border-green-300 bg-green-50 text-green-700';
  };

  const getOperationIcon = () => {
    return operationType === 'decrease' ? '−' : '+';
  };

  // FIXED: Better label based on operation type and adjustment type
  const getOperationLabel = () => {
    if (isReductionOnly) {
      switch (adjustmentType) {
        case 'DAMAGE':
          return 'Amount Damaged';
        case 'THEFT':
          return 'Amount Stolen';
        case 'EXPIRED':
          return 'Amount Expired';
        case 'WRITE_OFF':
          return 'Amount to Write Off';
        default:
          return 'Amount to Remove';
      }
    }
    return operationType === 'decrease' ? 'Amount to Remove' : 'Amount to Add';
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-medium text-gray-900">{line.item?.name}</h3>
          <p className="text-sm text-gray-500">
            SKU: {line.item?.sku} • {line.item?.categoryName}
          </p>
        </div>
        <Button
          onClick={() => onRemove(index)}
          variant='ghost'
          size='icon'
          className='text-rose-600'
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Current Stock */}
        <div className="space-y-2">
          <Label>Current Stock</Label>
          <Input
            type="number"
            value={currentStock}
            disabled
            className="bg-muted cursor-not-allowed text-center font-medium"
          />
          <p className="text-xs text-muted-foreground text-center">Available</p>
        </div>

        {/* Operation Type */}
        <div className="space-y-2">
          <Label>Operation</Label>
          <Select 
            value={operationType} 
            onValueChange={handleOperationChange}
            disabled={isReductionOnly} // FIXED: Always disabled for reduction-only types
          >
            <SelectTrigger className={cn("font-medium", getOperationColor())}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="decrease" className="text-red-700">
                <span className="flex items-center gap-2">
                  <Minus className="h-4 w-4" />
                  Reduce Stock
                </span>
              </SelectItem>
              {!isReductionOnly && (
                <SelectItem value="increase" className="text-green-700">
                  <span className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Increase Stock
                  </span>
                </SelectItem>
              )}
            </SelectContent>
          </Select>
          {isReductionOnly && (
            <p className="text-xs text-red-600">
              {adjustmentType} only allows reductions
            </p>
          )}
        </div>

        {/* Adjustment Amount */}
        <div className="space-y-2">
          <Label>
            {getOperationLabel()}
          </Label>
          <div className="relative">
            <span className={cn(
              "absolute left-3 top-1/2 transform -translate-y-1/2 font-bold text-lg",
              operationType === 'decrease' ? 'text-red-600' : 'text-green-600'
            )}>
              {getOperationIcon()}
            </span>
            <Input
              type="number"
              value={adjustmentAmount}
              onChange={handleAmountChange}
              min="0"
              max={operationType === 'decrease' ? currentStock : undefined}
              className="pl-8 text-center font-medium"
              placeholder="0"
            />
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Max: {operationType === 'decrease' ? currentStock : '∞'}
          </p>
        </div>

        {/* Calculation Display */}
        <div className="space-y-2">
          <Label>Calculation</Label>
          <div className={cn(
            "px-3 py-2 rounded-md text-center text-sm font-mono",
            operationType === 'decrease' ? 'bg-red-100 border border-red-200' : 'bg-green-100 border border-green-200'
          )}>
            {currentStock} {getOperationIcon()} {adjustmentAmount} = {finalQuantity}
          </div>
          <p className="text-xs text-muted-foreground text-center">
            {currentStock} → {finalQuantity}
          </p>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label>
            Reason/Notes
            {operationType === 'decrease' && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <Textarea
            placeholder={
              isReductionOnly
                ? `Why were these items ${adjustmentType.toLowerCase()}? (required)`
                : operationType === 'decrease' 
                  ? "Why are you removing stock? (required)" 
                  : "Optional notes"
            }
            value={line.notes || ''}
            onChange={(e) => onUpdate(index, 'notes', e.target.value)}
            className={cn(
              "resize-none",
              operationType === 'decrease' && !line.notes?.trim() && "border-red-300 focus:border-red-500"
            )}
            rows={2}
          />
          {operationType === 'decrease' && !line.notes?.trim() && (
            <p className="text-xs text-red-600">
              Reason required for stock reductions
            </p>
          )}
        </div>
      </div>

      {/* Summary Alert */}
      <Alert className={cn(
        "mt-4",
        operationType === 'decrease' 
          ? "border-red-200 bg-red-50" 
          : "border-green-200 bg-green-50"
      )}>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>
            {operationType === 'decrease' ? 'Stock Reduction' : 'Stock Increase'}:
          </strong>{' '}
          {operationType === 'decrease' ? 'Remove' : 'Add'} {adjustmentAmount} units.
          Final stock will be <strong>{finalQuantity}</strong> units.
          {operationType === 'decrease' && adjustmentAmount > 0 && (
            <span className="block mt-1 text-red-700">
              ⚠️ This will permanently reduce your inventory.
            </span>
          )}
        </AlertDescription>
      </Alert>

      {/* Quick Presets - Only show for reductions or when operation is decrease */}
      {operationType === 'decrease' && currentStock > 0 && (
        <div className="mt-3 flex gap-2 flex-wrap">
          <Label className="text-xs text-gray-600 w-full">
            Quick amounts {isReductionOnly ? `(${adjustmentType.toLowerCase()})` : ''}:
          </Label>
          {[1, 5, 10, Math.floor(currentStock / 2), currentStock].filter((val, idx, arr) => 
            val > 0 && val <= currentStock && arr.indexOf(val) === idx
          ).map((amount) => (
            <Button
              key={amount}
              variant="outline"
              size="sm"
              type="button"
              onClick={() => handleQuickAmount(amount)}
              className="text-xs px-2 py-1 h-6"
            >
              {amount === currentStock ? 'All' : amount}
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}