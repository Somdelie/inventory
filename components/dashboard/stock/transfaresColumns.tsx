// config/stockMovementColumns.tsx
import { Eye, Edit2, Trash2, MoreHorizontal, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { formatDate, formatQuantityWithDirection, getMovementTypeColor, getMovementTypeIcon, getStatusColor, getStatusIcon, truncateText } from '@/lib/transfers/transferUtils';
import { getMovementDirection, getMovementStatus, getMovementTypeDisplay, StockMovement } from '@/types/transfer';
import { formatPrice } from '@/lib/formatPrice';


export const createStockMovementColumns = (handleViewMovement: (movement: StockMovement) => void) => [

  {
    key: 'type',
    label: 'Type',
    sortable: true,
    render: (movement: StockMovement) => (
      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-sm font-medium border ${getMovementTypeColor(movement.type)}`}>
        {getMovementTypeIcon(movement.type)}
        {getMovementTypeDisplay(movement.type)}
      </div>
    )
  },
  {
    key: 'quantity',
    label: 'Quantity',
    sortable: true,
    render: (movement: StockMovement) => {
      const direction = getMovementDirection(movement);
      const quantityDisplay = formatQuantityWithDirection(movement.quantity, movement.type, movement.fromLocation?.name, movement.toLocation?.name);
      
      return (
        <div className="flex items-center gap-1">
          <span className={`font-medium ${
            quantityDisplay.startsWith('+') ? 'text-green-600' :
            quantityDisplay.startsWith('-') ? 'text-red-600' :
            'text-gray-900'
          }`}>
            {quantityDisplay}
          </span>
        </div>
      );
    }
  },
  {
    key: 'locations',
    label: 'Movement',
    sortable: false,
    render: (movement: StockMovement) => {
      const direction = getMovementDirection(movement);
      
      if (direction === 'TRANSFER') {
        return (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-600">{movement.fromLocation?.name}</span>
            <ArrowRight className="h-3 w-3 text-gray-400" />
            <span className="text-gray-600">{movement.toLocation?.name}</span>
          </div>
        );
      } else if (direction === 'IN') {
        return (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-green-600">→ {movement.toLocation?.name || 'System'}</span>
          </div>
        );
      } else {
        return (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-red-600">{movement.fromLocation?.name || 'System'} →</span>
          </div>
        );
      }
    }
  },
  {
    key: 'reason',
    label: 'Reason',
    sortable: false,
    render: (movement: StockMovement) => (
      <span className="text-sm text-gray-600">
        {movement.reason || movement.referenceType || 'N/A'}
      </span>
    )
  },
  {
    key: 'value',
    label: 'Value',
    sortable: true,
    render: (movement: StockMovement) => (
      <div className="flex flex-col">
        {movement.totalValue && (
          <span className="font-medium text-gray-900">
            {formatPrice(movement.totalValue)}
          </span>
        )}
        {movement.unitCost && (
          <span className="text-xs text-gray-500">
            {formatPrice(movement.unitCost)} each
          </span>
        )}
        {!movement.totalValue && !movement.unitCost && (
          <span className="text-sm text-gray-400">N/A</span>
        )}
      </div>
    )
  },
  {
    key: 'user',
    label: 'Created By',
    sortable: false,
    render: (movement: StockMovement) => (
      <span className="text-gray-700">{movement.user.name}</span>
    )
  },
  {
    key: 'createdAt',
    label: 'Date',
    sortable: true,
    render: (movement: StockMovement) => (
      <span className="text-sm text-gray-600">
        {formatDate(movement.createdAt)}
      </span>
    )
  },
  {
    key: 'status',
    label: 'Status',
    sortable: true,
    render: (movement: StockMovement) => {
      const status = getMovementStatus(movement);
      return (
        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-sm font-medium border ${getStatusColor(status)}`}>
          {getStatusIcon(status)}
          {status.replace('_', ' ')}
        </div>
      );
    }
  },
  {
    key: 'actions',
    label: 'Actions',
    sortable: false,
    render: (movement: StockMovement) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => handleViewMovement(movement)}>
            <Eye className="w-4 h-4 mr-2" /> View Details
          </DropdownMenuItem>
          {movement.type === 'TRANSFER' && (
            <DropdownMenuItem>
              <Edit2 className="w-4 h-4 mr-2" /> Edit Transfer
            </DropdownMenuItem>
          )}
          <DropdownMenuItem className="text-red-600">
            <Trash2 className="w-4 h-4 mr-2" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }
];

// Filter options for movement types
export const movementTypeFilterOptions = [
  { value: 'all', label: 'All Types' },
  { value: 'TRANSFER', label: 'Transfers' },
  { value: 'PURCHASE', label: 'Purchases' },
  { value: 'SALE', label: 'Sales' },
  { value: 'ADJUSTMENT', label: 'Adjustments' },
  { value: 'RETURN', label: 'Returns' },
  { value: 'DAMAGE', label: 'Damage' },
  { value: 'LOSS', label: 'Loss' },
  { value: 'PRODUCTION', label: 'Production' },
  { value: 'RESTOCK', label: 'Restock' },
  { value: 'CYCLE_COUNT', label: 'Cycle Count' }
];

// Status filter options
export const statusFilterOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'IN_TRANSIT', label: 'In Transit' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'FAILED', label: 'Failed' }
];