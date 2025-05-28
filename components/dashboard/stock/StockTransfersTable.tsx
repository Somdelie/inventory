"use client"

import React, { useState } from 'react';
import { Search, Download, Plus, MoreHorizontal, Eye, Edit2, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import StockMovementDataTable from './TransferDataTable';
import { ConfirmationDialog } from '@/components/ui/data-table';
import { toast } from 'sonner';
import { deleteStockTransfer } from '@/actions/inventory';
import { useRouter } from 'next/navigation';

// Updated type definition based on your Prisma model
interface StockMovement {
  id: string;
  stockNumber: string;
  quantity: number;
  type: 'TRANSFER' | 'ADJUSTMENT' | 'PURCHASE' | 'SALE' | 'RETURN' | 'DAMAGE' | 'LOSS' | 'PRODUCTION' | 'RESTOCK' | 'CYCLE_COUNT';
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
}

interface StockMovementsTableProps {
  movements: StockMovement[];
}

const StockMovementsTable: React.FC<StockMovementsTableProps> = ({ movements }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<StockMovement | null>(null);
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const route = useRouter();

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };
  

  const handleViewMovement = (movement: StockMovement) => {
    route.push(`/dashboard/inventory/transfers/${movement.id}`);
  };

  const handleDeleteClick = (movement: StockMovement) => {
    setItemToDelete(movement);
    setIsConfirmDialogOpen(true);
  };

  const handleDeleteMovement = async (movement: StockMovement) => {
    setIsDeleting(true);
    try {
      setIsDeleting(true);
      setItemToDelete(movement);
    const result = await deleteStockTransfer(movement.id);
      if (result.success) {
        toast.success('Transfer deleted successfully');
      } else {
        toast.error('Failed to delete transfer');
      }

    } catch (error) {
      console.error('Error deleting movement:', error);
      toast.error('Failed to delete transfer');
    } finally {
      setIsDeleting(false);
      setIsConfirmDialogOpen(false);
    }
  };

  // Filter movements
  const filteredMovements = movements.filter(movement => {
    const matchesSearch = 
      movement.id.toString().includes(searchTerm) ||
      movement.fromLocation?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movement.toLocation?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  // Sort movements
  const sortedMovements = [...filteredMovements].sort((a, b) => {
    let aValue: any, bValue: any;
    
    switch (sortBy) {
      case 'id':
        aValue = a.id;
        bValue = b.id;
        break;
      case 'createdAt':
        aValue = new Date(a.createdAt);
        bValue = new Date(b.createdAt);
        break;
      case 'fromLocation':
        aValue = a.fromLocation?.name || '';
        bValue = b.fromLocation?.name || '';
        break;
      case 'toLocation':
        aValue = a.toLocation?.name || '';
        bValue = b.toLocation?.name || '';
        break;
      case 'item':
        aValue = a.item.name;
        bValue = b.item.name;
        break;
      case 'quantity':
        aValue = a.quantity;
        bValue = b.quantity;
        break;
      default:
        aValue = new Date(a.createdAt);
        bValue = new Date(b.createdAt);
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Updated columns with proper item and quantity rendering
  const columns = [
    {
      key: 'stockNumber',
      label: 'Transfer #',
      sortable: true,
      render: (movement: StockMovement) => (
        <span className="font-mono text-sm font-medium text-primary">
          {movement.stockNumber}
        </span>
      )
    },
    {
      key: 'createdAt',
      label: 'Date',
      sortable: true,
      render: (movement: StockMovement) => (
        <span className="text-sm text-gray-600">
          {new Date(movement.createdAt).toLocaleDateString()}
        </span>
      )
    },
    {
      key: 'fromLocation',
      label: 'From',
      sortable: true,
      render: (movement: StockMovement) => (
        <span className="text-sm text-gray-700">
          {movement.fromLocation?.name || 'N/A'}
        </span>
      )
    },
    {
      key: 'toLocation',
      label: 'To', 
      sortable: true,
      render: (movement: StockMovement) => (
        <span className="text-sm text-gray-700">
          {movement.toLocation?.name || 'N/A'}
        </span>
      )
    },
    {
      key: 'items',
      label: 'Items',
      sortable: false,
      render: (movement: StockMovement) => (
        <span className="text-sm font-medium text-gray-900">
          {movement.quantity}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: false,
      render: (movement: StockMovement) => {
        const getStatusDisplay = (movement: StockMovement) => {
         ;
          return { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' };
        };
        
        const status = getStatusDisplay(movement);
        return (
          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${status.color}`}>
            {status.label}
          </span>
        );
      }
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (movement: StockMovement) => (
      <div className="flex items-center">
        <Button
    variant="ghost"
    size="icon"
    className="h-8 w-8 mr-2"
    onClick={() => handleDeleteClick(movement)}
  ><Trash2/></Button>
        <Button
          variant="link"
          size="icon"
          className="h-8 w-8 mr-2"
          onClick={() => handleViewMovement(movement)}
        ><Eye/></Button>
      </div>
      )
    }
  ];

  return (
    <div className="">
      <Card>
        <CardContent className="p-6">
          {/* Search and Actions */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-6">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search transfers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Transfer
              </Button>
            </div>
          </div>

          {/* Data Table */}
          <StockMovementDataTable 
            data={sortedMovements} 
            columns={columns}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
          />

          {/* Empty state */}
          {filteredMovements.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No movements found matching your search.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
  open={isConfirmDialogOpen}
  onOpenChange={setIsConfirmDialogOpen}
  title="Delete Transfer"
  description={`Are you sure you want to delete this transfer? This action cannot be undone.`}
  onConfirm={() => {
    if (itemToDelete) {
      handleDeleteMovement(itemToDelete);
    }
  }}
  isConfirming={isDeleting}
  confirmLabel="Delete"
  cancelLabel="Cancel"
  variant="destructive"
/>

    </div>
  );
};

export default StockMovementsTable;