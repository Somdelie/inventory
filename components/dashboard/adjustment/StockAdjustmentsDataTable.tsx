"use client"

import React, { useState } from 'react'
import { MoreHorizontal, Eye, CheckCircle, XCircle, Plus } from "lucide-react"
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { approveStockAdjustment, cancelStockAdjustment } from '@/actions/stock-adjustments'
import { Column, DataTable } from '@/components/ui/data-table'

// Types based on your Prisma schema
interface AdjustmentLine {
  id: string
  beforeQuantity: number
  afterQuantity: number
  adjustmentQuantity: number
  notes?: string | null
  serialNumbers: string[]
  itemId: string
  adjustmentId: string
  createdAt: Date
  updatedAt: Date | null
  item: {
    name: string
    sku: string
  }
}

export interface Adjustment {
  id: string
  adjustmentNumber: string
  date: Date | string
  adjustmentType: string
  reason: string
  status: string
  notes?: string | null
  createdAt: Date
  updatedAt: Date | null
  locationId: string
  organizationId: string
  createdBy: string
  approvedById?: string | null
  location: {
    id: string
    name: string
    type: string
    createdAt: Date
    updatedAt: Date
    phone: string | null
    email: string | null
    address: string | null
    organizationId: string | null
    isActive: boolean
  }
  createdByUser: {
    name: string
    email: string
  }
  approvedBy?: {
    name: string
    email: string
  } | null
  lines: AdjustmentLine[]
}

interface StockAdjustmentsDataTableProps {
  data: Adjustment[]
  currentUserId: string
}

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  const statusConfig = {
    DRAFT: { variant: 'secondary' as const, label: 'Draft' },
    APPROVED: { variant: 'default' as const, label: 'Approved' },
    COMPLETED: { variant: 'default' as const, label: 'Completed' },
    CANCELED: { variant: 'destructive' as const, label: 'Canceled' }
  }

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.DRAFT

  return (
    <Badge variant={config.variant}>
      {config.label}
    </Badge>
  )
}

// Adjustment type badge
const AdjustmentTypeBadge = ({ type }: { type: string }) => {
  const typeConfig = {
    STOCK_COUNT: { variant: 'outline' as const, label: 'Stock Count' },
    DAMAGE: { variant: 'destructive' as const, label: 'Damage' },
    THEFT: { variant: 'destructive' as const, label: 'Theft' },
    EXPIRED: { variant: 'secondary' as const, label: 'Expired' },
    WRITE_OFF: { variant: 'secondary' as const, label: 'Write Off' },
    CORRECTION: { variant: 'default' as const, label: 'Correction' },
    OTHER: { variant: 'outline' as const, label: 'Other' }
  }

  const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.OTHER

  return (
    <Badge variant={config.variant}>
      {config.label}
    </Badge>
  )
}

export default function StockAdjustmentsDataTable({ 
  data, 
  currentUserId 
}: StockAdjustmentsDataTableProps) {
  const router = useRouter()
  const [adjustments, setAdjustments] = useState(data)
  const [isActionLoading, setIsActionLoading] = useState<string | null>(null)

  const handleApprove = async (adjustmentId: string) => {
    setIsActionLoading(adjustmentId)
    try {
      const result = await approveStockAdjustment(adjustmentId, currentUserId)
      if (result.success) {
        // Update the local state to reflect the change
        setAdjustments(prev => prev.map(adj => 
          adj.id === adjustmentId 
            ? { ...adj, status: 'COMPLETED', approvedBy: { name: 'You', email: '' } }
            : adj
        ))
        router.refresh()
      } else {
        alert(result.error || 'Failed to approve adjustment')
      }
    } catch (error) {
      console.error('Error approving adjustment:', error)
      alert('Failed to approve adjustment')
    } finally {
      setIsActionLoading(null)
    }
  }

  const handleCancel = async (adjustmentId: string) => {
    if (!confirm('Are you sure you want to cancel this adjustment?')) return
    
    setIsActionLoading(adjustmentId)
    try {
      const result = await cancelStockAdjustment(adjustmentId)
      if (result.success) {
        // Update the local state to reflect the change
        setAdjustments(prev => prev.map(adj => 
          adj.id === adjustmentId 
            ? { ...adj, status: 'CANCELED' }
            : adj
        ))
        router.refresh()
      } else {
        alert(result.error || 'Failed to cancel adjustment')
      }
    } catch (error) {
      console.error('Error canceling adjustment:', error)
      alert('Failed to cancel adjustment')
    } finally {
      setIsActionLoading(null)
    }
  }

  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  // Handle row click to navigate to details
  const handleRowClick = (adjustment: Adjustment) => {
    router.push(`/dashboard/inventory/adjustments/${adjustment.id}`)
  }

  // Render row actions
  const renderRowActions = (adjustment: Adjustment) => {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0" disabled={isActionLoading === adjustment.id}>
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={`/dashboard/inventory/adjustments/${adjustment.id}`}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </Link>
          </DropdownMenuItem>
          
          {adjustment.status === 'DRAFT' && (
            <>
              <DropdownMenuItem 
                onClick={(e) => {
                  e.stopPropagation()
                  handleApprove(adjustment.id)
                }}
                disabled={isActionLoading === adjustment.id}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Approve
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={(e) => {
                  e.stopPropagation()
                  handleCancel(adjustment.id)
                }}
                disabled={isActionLoading === adjustment.id}
                className="text-destructive"
              >
                <XCircle className="mr-2 h-4 w-4" />
                Cancel
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  // Define columns for your custom DataTable
  const columns: Column<Adjustment>[] = [
    {
      header: "Adjustment #",
      accessorKey: "adjustmentNumber",
      cell: (adjustment) => (
        <Link 
          href={`/dashboard/inventory/adjustments/${adjustment.id}`}
          className="font-medium text-primary hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {adjustment.adjustmentNumber}
        </Link>
      ),
    },
    {
      header: "Date",
      accessorKey: "date",
      cell: (adjustment) => formatDate(adjustment.date),
    },
    {
      header: "Type",
      accessorKey: "adjustmentType",
      cell: (adjustment) => <AdjustmentTypeBadge type={adjustment.adjustmentType} />,
    },
    {
      header: "Location",
      accessorKey: "location",
      cell: (adjustment) => (
        <div>
          <div className="font-medium">{adjustment.location.name}</div>
          <div className="text-sm text-muted-foreground capitalize">
            {adjustment.location.type.toLowerCase()}
          </div>
        </div>
      ),
    },
    {
      header: "Reason",
      accessorKey: "reason",
      cell: (adjustment) => (
        <div className="max-w-[200px] truncate" title={adjustment.reason}>
          {adjustment.reason}
        </div>
      ),
    },
    {
      header: "Items",
      accessorKey: "lines",
      cell: (adjustment) => (
        <div className="text-center">
          {adjustment.lines?.length || 0}
        </div>
      ),
      className: "text-center",
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (adjustment) => <StatusBadge status={adjustment.status} />,
    },
  ]

  return (
    <DataTable
      title="Stock Adjustments"
      subtitle="Manage inventory adjustments and stock corrections"
      emptyStateModalTitle="No stock adjustments found"
      emptyStateModalDescription="Create your first stock adjustment to get started"
      data={adjustments}
      columns={columns}
      keyField="id"
      onRowClick={handleRowClick}
      renderRowActions={renderRowActions}
      actions={{
        onAdd: () => router.push('/dashboard/inventory/adjustments/create'),
      }}
      filters={{
        searchFields: ['adjustmentNumber', 'reason'],
        enableDateFilter: true,
        getItemDate: (adjustment) => adjustment.date,
      }}
      pagination={{
        defaultItemsPerPage: 10,
        itemsPerPageOptions: [5, 10, 25, 50],
      }}
    />
  )
}