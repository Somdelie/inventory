'use client'

import React, { useState } from 'react'
import { Plus, MoreHorizontal, Eye, CheckCircle, XCircle, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { approveStockAdjustment, cancelStockAdjustment } from '@/actions/stock-adjustments'

// Types based on your Prisma schema
interface AdjustmentLine {
  id: string
  beforeQuantity: number
  afterQuantity: number
  adjustmentQuantity: number
  notes?: string
  item: {
    name: string
    sku: string
  }
}

interface Adjustment {
  id: string
  adjustmentNumber: string
  date: Date | string
  adjustmentType: string
  reason: string
  status: string
  location: {
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
  } | null
  lines: AdjustmentLine[]
  createdAt: Date | string
}

interface StockAdjustmentsListProps {
  initialData: {
    adjustments: Adjustment[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }
  currentUserId: string
}

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  const statusConfig = {
    DRAFT: { color: 'bg-gray-100 text-gray-800', label: 'Draft' },
    APPROVED: { color: 'bg-blue-100 text-blue-800', label: 'Approved' },
    COMPLETED: { color: 'bg-green-100 text-green-800', label: 'Completed' },
    CANCELED: { color: 'bg-red-100 text-red-800', label: 'Canceled' }
  }

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.DRAFT

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  )
}

// Adjustment type badge
const AdjustmentTypeBadge = ({ type }: { type: string }) => {
  const typeConfig = {
    STOCK_COUNT: { color: 'bg-blue-50 text-blue-700', label: 'Stock Count' },
    DAMAGE: { color: 'bg-red-50 text-red-700', label: 'Damage' },
    THEFT: { color: 'bg-red-50 text-red-700', label: 'Theft' },
    EXPIRED: { color: 'bg-orange-50 text-orange-700', label: 'Expired' },
    WRITE_OFF: { color: 'bg-gray-50 text-gray-700', label: 'Write Off' },
    CORRECTION: { color: 'bg-green-50 text-green-700', label: 'Correction' },
    OTHER: { color: 'bg-purple-50 text-purple-700', label: 'Other' }
  }

  const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.OTHER

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  )
}

// Actions dropdown
const ActionsDropdown = ({ 
  adjustment, 
  onApprove, 
  onCancel, 
  currentUserId,
  isLoading
}: { 
  adjustment: Adjustment
  onApprove: (id: string) => void
  onCancel: (id: string) => void
  currentUserId: string
  isLoading: boolean
}) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        disabled={isLoading}
      >
        <MoreHorizontal className="h-4 w-4 text-gray-500" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="py-1">
            <Link
              href={`/dashboard/inventory/adjustments/${adjustment.id}`}
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              onClick={() => setIsOpen(false)}
            >
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </Link>
            
            {adjustment.status === 'DRAFT' && (
              <>
                <button
                  onClick={() => {
                    onApprove(adjustment.id)
                    setIsOpen(false)
                  }}
                  className="w-full flex items-center px-4 py-2 text-sm text-green-700 hover:bg-green-50"
                  disabled={isLoading}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </button>
                <button
                  onClick={() => {
                    onCancel(adjustment.id)
                    setIsOpen(false)
                  }}
                  className="w-full flex items-center px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                  disabled={isLoading}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function StockAdjustmentsList({ initialData, currentUserId }: StockAdjustmentsListProps) {
  const router = useRouter()
  const [adjustments, setAdjustments] = useState(initialData.adjustments)
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
        // Refresh the page to get updated data
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
        // Refresh the page to get updated data
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
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const handleRefresh = () => {
    router.refresh()
  }

  const { pagination } = initialData

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Stock Adjustments</h2>
            <p className="text-sm text-gray-500 mt-1">
              Manage inventory adjustments and stock corrections
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleRefresh}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
            <Link
              href="/dashboard/inventory/adjustments/create"
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Adjustment
            </Link>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Adjustment #
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reason
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Items
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created By
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {adjustments.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                  No stock adjustments found
                  <div className="mt-2">
                    <Link
                      href="/dashboard/inventory/adjustments/create"
                      className="text-red-600 hover:text-red-800"
                    >
                      Create your first adjustment
                    </Link>
                  </div>
                </td>
              </tr>
            ) : (
              adjustments.map((adjustment) => (
                <tr key={adjustment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {adjustment.adjustmentNumber}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatDate(adjustment.date)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <AdjustmentTypeBadge type={adjustment.adjustmentType} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{adjustment.location.name}</div>
                    <div className="text-sm text-gray-500 capitalize">
                      {adjustment.location.type.toLowerCase()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {adjustment.reason}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {adjustment.lines.length} item{adjustment.lines.length !== 1 ? 's' : ''}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={adjustment.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{adjustment.createdByUser.name}</div>
                    <div className="text-sm text-gray-500">{adjustment.createdByUser.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    {isActionLoading === adjustment.id ? (
                      <RefreshCw className="h-4 w-4 animate-spin text-gray-500 mx-auto" />
                    ) : (
                      <ActionsDropdown
                        adjustment={adjustment}
                        onApprove={handleApprove}
                        onCancel={handleCancel}
                        currentUserId={currentUserId}
                        isLoading={isActionLoading !== null}
                      />
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
            </div>
            <div className="flex space-x-2">
              {pagination.page > 1 && (
                <Link
                  href={`/dashboard/inventory/adjustments?page=${pagination.page - 1}`}
                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
                >
                  Previous
                </Link>
              )}
              
              <span className="px-3 py-1 text-sm bg-red-50 text-red-700 border border-red-200 rounded">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              
              {pagination.page < pagination.totalPages && (
                <Link
                  href={`/dashboard/inventory/adjustments?page=${pagination.page + 1}`}
                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
                >
                  Next
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}