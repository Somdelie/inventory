import { getStockTransfers } from '@/actions/inventory'
import StockMovementsTable from '@/components/dashboard/stock/StockTransfersTable'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowLeftRight, Package, Plus, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

const StockMovementsPage = async () => {
  // Note: You might want to rename getStockTransfers to getStockMovements 
  // to better reflect that it now handles all movement types
  const movements = await getStockTransfers();
  console.log("Stock Movements:", movements)

  // Quick stats for header
  const transferCount = movements.filter(m => m.type === 'TRANSFER').length;
  const totalMovements = movements.length;

  return (
    <div className="">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Package className="h-8 w-8 text-primary" />
              Stock Movements
            </h1>
            <p className="text-gray-600 mt-1">
              Track all inventory movements - transfers, purchases, sales, and adjustments
            </p>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <ArrowLeftRight className="h-4 w-4" />
                {transferCount} transfers
              </span>
              <span className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                {totalMovements} total movements
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/inventory/stock">
            <Button variant="outline">
              View Inventory
            </Button>
          </Link>
        </div>
      </div>

      {/* Table */}
      <StockMovementsTable movements={movements} />
    </div>
  )
}

export default StockMovementsPage