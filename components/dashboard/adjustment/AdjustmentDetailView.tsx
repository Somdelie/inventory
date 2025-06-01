'use client'

import React, { useState } from 'react'
import { ArrowLeft, CheckCircle, XCircle, Printer, Download, Calendar, MapPin, User, FileText, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { AdjustmentStatus, AdjustmentType } from '@prisma/client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

import { approveStockAdjustment, cancelStockAdjustment } from '@/actions/stock-adjustments'
import { toast } from 'sonner'

// Types
interface AdjustmentItem {
  id: string
  beforeQuantity: number
  afterQuantity: number
  adjustmentQuantity: number
  notes?: string
  item: {
    id: string
    name: string
    sku: string
    costPrice: number
  }
}

interface AdjustmentData {
  id: string
  adjustmentNumber: string
  date: Date | string // Accept both Date and string
  adjustmentType: AdjustmentType
  reason: string
  notes?: string
  status: AdjustmentStatus
  location: {
    id: string
    name: string
    type: string
  }
  createdByUser: {
    name: string
    email: string
  }
  approvedBy?: {
    name: string
    email: string
  }
  lines: AdjustmentItem[]
  organizationId: string
  createdAt: string
  updatedAt: string
}

interface AdjustmentDetailViewProps {
  adjustment: AdjustmentData
  currentUserId: string
  canApprove: boolean
}

export default function AdjustmentDetailView({
  adjustment,
  currentUserId,
  canApprove
}: AdjustmentDetailViewProps) {
  const router = useRouter()
  const [isApproving, setIsApproving] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const [showApproveDialog, setShowApproveDialog] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)

  // Calculate summary data
  const totalItems = adjustment.lines.length
  const increasedItems = adjustment.lines.filter(line => line.adjustmentQuantity > 0).length
  const decreasedItems = adjustment.lines.filter(line => line.adjustmentQuantity < 0).length
  const unchangedItems = adjustment.lines.filter(line => line.adjustmentQuantity === 0).length
  const totalQuantityChange = adjustment.lines.reduce((sum, line) => sum + line.adjustmentQuantity, 0)

  // Status styling
  const getStatusBadge = (status: AdjustmentStatus) => {
    switch (status) {
      case 'DRAFT':
        return <Badge variant="secondary">Draft</Badge>
      case 'APPROVED':
        return <Badge variant="default" className="bg-blue-500">Approved</Badge>
      case 'COMPLETED':
        return <Badge variant="default" className="bg-green-500">Completed</Badge>
      case 'CANCELED':
        return <Badge variant="destructive">Canceled</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  // Adjustment type styling
  const getAdjustmentTypeInfo = (type: AdjustmentType) => {
    switch (type) {
      case 'DAMAGE':
        return { label: 'Damage', color: 'text-red-600', bgColor: 'bg-red-50' }
      case 'THEFT':
        return { label: 'Theft', color: 'text-red-600', bgColor: 'bg-red-50' }
      case 'EXPIRED':
        return { label: 'Expired', color: 'text-orange-600', bgColor: 'bg-orange-50' }
      case 'WRITE_OFF':
        return { label: 'Write Off', color: 'text-red-600', bgColor: 'bg-red-50' }
      case 'STOCK_COUNT':
        return { label: 'Stock Count', color: 'text-blue-600', bgColor: 'bg-blue-50' }
      case 'CORRECTION':
        return { label: 'Correction', color: 'text-purple-600', bgColor: 'bg-purple-50' }
      case 'OTHER':
        return { label: 'Other', color: 'text-gray-600', bgColor: 'bg-gray-50' }
      default:
        return { label: type, color: 'text-gray-600', bgColor: 'bg-gray-50' }
    }
  }

  const handleApprove = async () => {
    setIsApproving(true)
    try {
      const result = await approveStockAdjustment(adjustment.id, currentUserId)
      if (result.success) {
        toast.success('Adjustment approved successfully')
        router.refresh()
      } else {
        toast.error(result.error || 'Failed to approve adjustment')
      }
    } catch (error) {
      toast.error('Failed to approve adjustment')
    } finally {
      setIsApproving(false)
      setShowApproveDialog(false)
    }
  }

  const handleCancel = async () => {
    setIsCancelling(true)
    try {
      const result = await cancelStockAdjustment(adjustment.id)
      if (result.success) {
        toast.success('Adjustment cancelled successfully')
        router.refresh()
      } else {
        toast.error(result.error || 'Failed to cancel adjustment')
      }
    } catch (error) {
      toast.error('Failed to cancel adjustment')
    } finally {
      setIsCancelling(false)
      setShowCancelDialog(false)
    }
  }

  const typeInfo = getAdjustmentTypeInfo(adjustment.adjustmentType)
  const canModify = adjustment.status === 'DRAFT'
  const showApproveButton = canApprove && adjustment.status === 'DRAFT'
  const showCancelButton = canModify

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/dashboard/inventory/adjustments"
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Adjustments
          </Link>
        </div>
        
        <div className="flex items-center space-x-2">
          {showApproveButton && (
            <Button 
              onClick={() => setShowApproveDialog(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve
            </Button>
          )}
          
          {showCancelButton && (
            <Button 
              variant="destructive" 
              onClick={() => setShowCancelDialog(true)}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          )}
          
          <Button variant="outline">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Title and Status */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Adjustment {adjustment.adjustmentNumber}
          </h1>
          <p className="text-gray-600 mt-1">
            {format(new Date(adjustment.date), 'MMM dd, yyyy')}
          </p>
        </div>
        <div className="text-right">
          {getStatusBadge(adjustment.status)}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Adjustment Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Adjustment Details */}
          <Card>
            <CardHeader>
              <CardTitle>Adjustment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Adjustment Number</label>
                  <p className="text-sm text-gray-900 font-mono">{adjustment.adjustmentNumber}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Date</label>
                  <div className="flex items-center text-sm text-gray-900">
                    <Calendar className="h-4 w-4 mr-2" />
                    {format(new Date(adjustment.date), 'MMM dd, yyyy')}
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Location</label>
                  <div className="flex items-center text-sm text-gray-900">
                    <MapPin className="h-4 w-4 mr-2" />
                    {adjustment.location.name}
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Type</label>
                  <div className={`inline-flex items-center px-2 py-1 rounded-md text-sm font-medium ${typeInfo.color} ${typeInfo.bgColor}`}>
                    {typeInfo.label}
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <div className="text-sm">{getStatusBadge(adjustment.status)}</div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Created By</label>
                  <div className="flex items-center text-sm text-gray-900">
                    <User className="h-4 w-4 mr-2" />
                    {adjustment.createdByUser.name}
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <label className="text-sm font-medium text-gray-500">Reason</label>
                <p className="text-sm text-gray-900 mt-1">{adjustment.reason}</p>
              </div>
              
              {adjustment.notes && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Notes</label>
                  <div className="flex items-start text-sm text-gray-900 mt-1">
                    <FileText className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                    <p>{adjustment.notes}</p>
                  </div>
                </div>
              )}
              
              {adjustment.approvedBy && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Approved By</label>
                  <div className="flex items-center text-sm text-gray-900">
                    <User className="h-4 w-4 mr-2" />
                    {adjustment.approvedBy.name}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Adjustment Items */}
          <Card>
            <CardHeader>
              <CardTitle>Adjustment Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {adjustment.lines.map((line, index) => (
                  <div key={line.id} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900">{line.item.name}</h4>
                        <p className="text-sm text-gray-500">SKU: {line.item.sku}</p>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${
                          line.adjustmentQuantity === 0 
                            ? 'text-gray-500' 
                            : line.adjustmentQuantity > 0 
                              ? 'text-green-600' 
                              : 'text-red-600'
                        }`}>
                          {line.adjustmentQuantity === 0 
                            ? '0' 
                            : line.adjustmentQuantity > 0 
                              ? `+${line.adjustmentQuantity}` 
                              : line.adjustmentQuantity
                          }
                        </div>
                        <div className="text-sm text-gray-500">
                          {line.beforeQuantity} → {line.afterQuantity}
                        </div>
                      </div>
                    </div>
                    
                    {line.notes && (
                      <div className="mt-2 p-2 bg-white rounded border">
                        <p className="text-sm text-gray-700">{line.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Summary */}
        <div className="space-y-6">
          {/* Adjustment Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Adjustment Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Items Count</label>
                <p className="text-2xl font-bold text-gray-900">{totalItems}</p>
              </div>
              
              <Separator />
              
              <div>
                <label className="text-sm font-medium text-gray-500">Total Quantity Change</label>
                <p className={`text-2xl font-bold ${
                  totalQuantityChange === 0 
                    ? 'text-gray-500' 
                    : totalQuantityChange > 0 
                      ? 'text-green-600' 
                      : 'text-red-600'
                }`}>
                  {totalQuantityChange === 0 
                    ? '0' 
                    : totalQuantityChange > 0 
                      ? `+${totalQuantityChange}` 
                      : totalQuantityChange
                  }
                </p>
              </div>
              
              <Separator />
              
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-500">Quantity Changes</label>
                
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="text-lg font-bold text-green-600">{increasedItems}</div>
                    <div className="text-xs text-green-600">Increased</div>
                  </div>
                  
                  <div className="bg-red-50 p-3 rounded-lg">
                    <div className="text-lg font-bold text-red-600">{decreasedItems}</div>
                    <div className="text-xs text-red-600">Decreased</div>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-lg font-bold text-gray-600">{unchangedItems}</div>
                    <div className="text-xs text-gray-600">Unchanged</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status Alert */}
          {adjustment.status === 'DRAFT' && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This adjustment is in draft status. It needs to be approved to take effect on inventory levels.
              </AlertDescription>
            </Alert>
          )}
          
          {adjustment.status === 'COMPLETED' && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                This adjustment has been completed and inventory levels have been updated.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>

      {/* Approval Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Stock Adjustment</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this stock adjustment? This will update inventory levels and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleApprove} 
              disabled={isApproving}
              className="bg-green-600 hover:bg-green-700"
            >
              {isApproving ? 'Approving...' : 'Approve'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Stock Adjustment</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this stock adjustment? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              Keep Draft
            </Button>
            <Button 
              variant="destructive"
              onClick={handleCancel} 
              disabled={isCancelling}
            >
              {isCancelling ? 'Cancelling...' : 'Cancel Adjustment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}