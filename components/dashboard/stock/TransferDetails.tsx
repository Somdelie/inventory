'use client'

import React, { useState, useTransition } from 'react';
import { ArrowLeft, Check, Clock, Truck, Package, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { approveStockTransfer, completeStockTransfer } from '@/actions/inventory';

// Enums matching your Prisma schema
type StockMovementStatus = 'CREATED' | 'APPROVED' | 'IN_TRANSIT' | 'COMPLETED' | 'CANCELED';
type StockMovementType = 'TRANSFER' | 'ADJUSTMENT' | 'PURCHASE' | 'SALE' | 'RETURN' | 'DAMAGE' | 'LOSS' | 'PRODUCTION' | 'RESTOCK' | 'CYCLE_COUNT';

interface TransferProps {
  transfer: {
    id: string;
    quantity: number;
    stockNumber: string;
    type: StockMovementType;
    status: StockMovementStatus;
    reason: string | null;
    referenceId: string | null;
    referenceType: string | null;
    notes: string | null;
    unitCost: number | null;
    totalValue: number | null;
    createdAt: string | Date;
    updatedAt: string | Date;
    itemId: string;
    fromLocationId: string | null;
    toLocationId: string | null;
    userId: string;
    organizationId: string;
    item: {
      name: string;
      sku: string;
    };
    fromLocation: {
      name: string;
    } | null;
    toLocation: {
      name: string;
    } | null;
    user: {
      name: string;
    };
  } | null; // Make transfer nullable
}

const TransferDetails: React.FC<TransferProps> = ({ transfer }) => {
  const [isPending, startTransition] = useTransition();
  
  // Handle null transfer case
  if (!transfer) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Transfer Not Found</h2>
            <p className="text-gray-600 mb-4">The transfer you're looking for doesn't exist or may have been deleted.</p>
            <Button variant="outline" className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const [currentStatus, setCurrentStatus] = useState(transfer?.status || 'CREATED');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleApproveTransfer = () => {
    startTransition(async () => {
      try {
        const result = await approveStockTransfer(transfer.id);
        
        if (result.success) {
          setCurrentStatus('APPROVED');
          toast.success(result.message);
        } else {
          toast.error(result.error);
        }
      } catch (error) {
        toast.error('Failed to approve transfer');
        console.error('Error approving transfer:', error);
      }
    });
  };

  const getStatusIcon = (statusType: string, completed: boolean, current: boolean) => {
    // Helper function to determine if this status is the next one to be activated
    const isNextInSequence = (statusType: string, currentStatus: StockMovementStatus) => {
      if (statusType === 'Approved' && currentStatus === 'CREATED') return true;
      if (statusType === 'In Transit' && currentStatus === 'APPROVED') return true;
      if (statusType === 'Completed' && currentStatus === 'IN_TRANSIT') return true;
      return false;
    };

    if (statusType === 'Created') {
      return completed ? (
        <Clock className="h-4 w-4 text-white" />
      ) : (
        <Clock className="h-4 w-4 text-gray-400" />
      );
    } else if (statusType === 'Approved') {
      if (completed || current) {
        return <Check className="h-4 w-4 text-white" />;
      } else if (isNextInSequence(statusType, currentStatus)) {
        return <Check className="h-4 w-4 text-primary" />;
      } else {
        return <Check className="h-4 w-4 text-gray-400" />;
      }
    } else if (statusType === 'In Transit') {
      if (completed || current) {
        return <Truck className="h-4 w-4 text-white" />;
      } else if (isNextInSequence(statusType, currentStatus)) {
        return <Truck className="h-4 w-4 text-primary" />;
      } else {
        return <Truck className="h-4 w-4 text-gray-400" />;
      }
    } else if (statusType === 'Completed') {
      if (completed || current) {
        return <Check className="h-4 w-4 text-white" />;
      } else if (isNextInSequence(statusType, currentStatus)) {
        return <Check className="h-4 w-4 text-primary" />;
      } else {
        return <Check className="h-4 w-4 text-gray-400" />;
      }
    }
    return <div className="h-4 w-4 rounded-full border-2 border-gray-300" />;
  };

  const getStatusColor = (statusType: string, completed: boolean, current: boolean) => {
    if (statusType === 'Created') {
      return completed ? 'bg-primary shadow' : 'bg-gray-200 border border-primary';
    } else if (statusType === 'Approved') {
      return (completed || current) ? 'bg-primary' : 'bg-rose-200 border border-primary';
    } else if (statusType === 'In Transit') {
      // In Transit gets a static background, border animation handled separately
      return (completed || current ) ? 'bg-rose-500' : 'bg-rose-100 border border-primary';
    } else if (statusType === 'Completed') {
      return (completed || current) ? 'bg-primary' : 'bg-gray-200';
    }
    return 'bg-gray-200';
  };

  // Helper function to determine line color between steps
  const getLineColor = (currentStepIndex: number, statusHistory: any[]) => {
    const currentStep = statusHistory[currentStepIndex];
    const nextStep = statusHistory[currentStepIndex + 1];
    
    // If current step is completed, the line to the next step should be primary
    if (currentStep.completed) {
      return 'bg-primary';
    }
    
    // Default gray color for incomplete sections
    return 'bg-gray-300';
  };

  // Generate status history based on current status
  const generateStatusHistory = (currentStatus: StockMovementStatus) => {
    const allStatuses = [
      {
        status: 'Created',
        description: 'Transfer created',
        completed: true, // DRAFT is always completed (created)
        current: currentStatus === 'CREATED'
      },
      {
        status: 'Approved',
        description: 'Transfer approved',
        completed: ['APPROVED', 'IN_TRANSIT', 'COMPLETED'].includes(currentStatus),
        current: currentStatus === 'APPROVED'
      },
      {
        status: 'In Transit',
        description: 'Items in transit',
        completed: ['IN_TRANSIT', 'COMPLETED'].includes(currentStatus),
        current: currentStatus === 'IN_TRANSIT'
      },
      {
        status: 'Completed',
        description: 'Transfer completed',
        completed: currentStatus === 'COMPLETED',
        current: currentStatus === 'COMPLETED'
      }
    ];

    // Don't show canceled status in the timeline, handle it separately
    return allStatuses.map(status => ({
      ...status,
      date: status.completed ? new Date(transfer.createdAt).toLocaleDateString() : null
    }));
  };

  const statusHistory = generateStatusHistory(currentStatus);

 const updateTransferStatus = async () => {
    setIsSubmitting(true);
    startTransition(async () => {
      try {
        let result;

        if (currentStatus === 'CREATED') {
          result = await approveStockTransfer(transfer.id);
          if (result.success) {
            setCurrentStatus('APPROVED');
          }
        } else if (currentStatus === 'APPROVED' || currentStatus === 'IN_TRANSIT') {
          result = await completeStockTransfer(transfer.id);
          if (result.success) {
            setCurrentStatus('COMPLETED');
          }
        }

        if (result?.success) {
          toast.success(result.message);
        } else {
          toast.error(result?.error || 'Unknown error');
        }
      } catch (err) {
        toast.error('Something went wrong updating the transfer status.');
        console.error(err);
      } finally {
        setIsSubmitting(false);
      }
    });
  };

  const getNextAction = () => {
    switch (currentStatus) {
      case 'CREATED':
        return {
          label: 'Approve Transfer',
          color: 'bg-red-500 hover:bg-red-600',
          action: updateTransferStatus,
        };
      case 'APPROVED':
      case 'IN_TRANSIT':
        return {
          label: 'Complete Transfer',
          color: 'bg-red-500 hover:bg-red-600',
          action: updateTransferStatus,
        };
      default:
        return null;
    }
  };

  const nextAction = getNextAction();

  const getStatusBadge = (status: StockMovementStatus) => {
    switch (status) {
      case 'CREATED':
        return { label: 'Created', className: 'bg-gray-100 text-gray-800 border-gray-300' };
      case 'APPROVED':
        return { label: 'Approved', className: 'bg-blue-100 text-blue-800 border-blue-300' };
      case 'IN_TRANSIT':
        return { label: 'In Transit', className: 'bg-yellow-100 text-yellow-800 border-yellow-300' };
      case 'COMPLETED':
        return { label: 'Completed', className: 'bg-green-100 text-green-800 border-green-300' };
      case 'CANCELED':
        return { label: 'Canceled', className: 'bg-red-100 text-red-800 border-red-300' };
      default:
        return { label: status, className: 'bg-gray-100 text-gray-800 border-gray-300' };
    }
  };

  const statusBadge = getStatusBadge(currentStatus);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2 text-primary">
                Transfer {transfer.stockNumber}
                <Badge className={statusBadge.className}>
                  {statusBadge.label}
                </Badge>
              </h1>
            </div>
          </div>
          <div className="flex gap-2">
           {nextAction && (
            <Button
              className={`${nextAction.color} text-white`}
              onClick={nextAction.action}
              disabled={isSubmitting}
            >
              <Package className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Processing...' : nextAction.label}
            </Button>
          )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Transfer Status */}
            <Card>
              <CardHeader>
                <CardTitle>Transfer Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {statusHistory.map((status, index) => (
                    <div key={index} className="flex items-start gap-4 relative">
                      {/* Connecting line with dynamic color */}
                      {index < statusHistory.length - 1 && (
                        <div className={`absolute left-4 top-8 w-0.5 h-12 ${getLineColor(index, statusHistory)}`}></div>
                      )}
                      
                      {/* Status circle with animated border for In Transit */}
                      {status.status === 'In Transit' && currentStatus === 'IN_TRANSIT' ? (
                        <div className="relative">
                          {/* Animated border */}
                          <div className="absolute inset-0 w-8 h-8 rounded-full border-2 border-dashed border-rose-300 animate-spin" style={{animationDuration: '3s'}}></div>
                          {/* Static content */}
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${getStatusColor(status.status, status.completed, status.current)}`}>
                            {getStatusIcon(status.status, status.completed, status.current)}
                          </div>
                        </div>
                      ) : (
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${getStatusColor(status.status, status.completed, status.current)}`}>
                          {getStatusIcon(status.status, status.completed, status.current)}
                        </div>
                      )}
                      
                      <div className="flex-1 pt-1">
                        <div className="font-medium text-gray-900">{status.status}</div>
                        <div className="text-sm text-gray-500">{status.description}</div>
                      </div>
                      {status.date && (
                        <div className="text-sm text-gray-500 pt-1">{status.date}</div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Transfer Items */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Transfer Items</CardTitle>
                {nextAction && (
                  <Button 
                    className={`${nextAction.color} text-white`}
                    onClick={nextAction.action}
                    disabled={isPending}
                  >
                    <Package className="h-4 w-4 mr-2" />
                    {isPending ? 'Processing...' : nextAction.label}
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Table Header */}
                  <div className="grid grid-cols-4 gap-4 pb-2 border-b text-sm font-medium text-gray-600">
                    <div>Item</div>
                    <div>Quantity</div>
                    <div>Notes</div>
                    <div></div>
                  </div>
                  
                  {/* Single Item Row */}
                  <div className="grid grid-cols-4 gap-4 py-3 border-b last:border-b-0">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                        <Package className="h-4 w-4 text-gray-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{transfer.item.name}</div>
                        <div className="text-sm text-gray-500">{transfer.item.sku}</div>
                      </div>
                    </div>
                    <div className="text-gray-900 font-medium">{transfer.quantity}</div>
                    <div className="text-gray-600 text-sm">{transfer.notes || '-'}</div>
                    <div></div>
                  </div>
                </div>

                {/* Notes Section */}
                {transfer.notes && (
                  <div className="mt-6 pt-6 border-t">
                    <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
                    <p className="text-gray-600">{transfer.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* From Location */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-gray-600" />
                  From Location
                </CardTitle>
                <p className="text-sm text-gray-500">Source of items</p>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-medium text-gray-900">
                  {transfer.fromLocation?.name || 'N/A'}
                </div>
              </CardContent>
            </Card>

            {/* To Location */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-gray-600" />
                  To Location
                </CardTitle>
                <p className="text-sm text-gray-500">Destination for items</p>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-medium text-gray-900">
                  {transfer.toLocation?.name || 'N/A'}
                </div>
              </CardContent>
            </Card>

            {/* Transfer Details */}
            <Card>
              <CardHeader>
                <CardTitle>Transfer Details</CardTitle>
                <p className="text-sm text-gray-500">Information about this transfer</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="text-gray-900">{new Date(transfer.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Items:</span>
                    <span className="text-gray-900">{transfer.quantity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Created By:</span>
                    <span className="text-gray-900">{transfer.user.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <span className="text-gray-900">{transfer.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Reason:</span>
                    <span className="text-gray-900">{transfer.reason || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Created:</span>
                    <span className="text-gray-900">{new Date(transfer.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Updated:</span>
                    <span className="text-gray-900">{new Date(transfer.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransferDetails;