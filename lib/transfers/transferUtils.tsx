// utils/stockMovementUtils.ts
import { MovementStatus, StockMovementType } from '@/types/transfer';
import { 
  CheckCircle, 
  Truck, 
  Clock,
  Package,
  ArrowUp,
  ArrowDown,
  ArrowRightLeft,
  ShoppingCart,
  Wrench,
  RotateCcw,
  AlertTriangle,
  X,
  Factory,
  RefreshCw,
  Calculator
} from 'lucide-react';


export const getStatusIcon = (status: MovementStatus) => {
  const icons = {
    COMPLETED: <CheckCircle className="h-4 w-4" />,
    IN_TRANSIT: <Truck className="h-4 w-4" />,
    PENDING: <Clock className="h-4 w-4" />,
    FAILED: <X className="h-4 w-4" />
  };
  return icons[status] || <Package className="h-4 w-4" />;
};

export const getStatusColor = (status: MovementStatus) => {
  const colors = {
    COMPLETED: 'bg-green-100 text-green-800 border-green-300',
    IN_TRANSIT: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    PENDING: 'bg-blue-100 text-blue-800 border-blue-300',
    FAILED: 'bg-red-100 text-red-800 border-red-300'
  };
  return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
};

export const getMovementTypeIcon = (type: StockMovementType) => {
  const icons = {
    TRANSFER: <ArrowRightLeft className="h-4 w-4" />,
    ADJUSTMENT: <Wrench className="h-4 w-4" />,
    PURCHASE: <ShoppingCart className="h-4 w-4" />,
    SALE: <ArrowUp className="h-4 w-4" />,
    RETURN: <RotateCcw className="h-4 w-4" />,
    DAMAGE: <AlertTriangle className="h-4 w-4" />,
    LOSS: <X className="h-4 w-4" />,
    PRODUCTION: <Factory className="h-4 w-4" />,
    RESTOCK: <RefreshCw className="h-4 w-4" />,
    CYCLE_COUNT: <Calculator className="h-4 w-4" />
  };
  return icons[type] || <Package className="h-4 w-4" />;
};

export const getMovementTypeColor = (type: StockMovementType) => {
  const colors = {
    TRANSFER: 'bg-blue-100 text-blue-800 border-blue-300',
    ADJUSTMENT: 'bg-purple-100 text-purple-800 border-purple-300',
    PURCHASE: 'bg-green-100 text-green-800 border-green-300',
    SALE: 'bg-orange-100 text-orange-800 border-orange-300',
    RETURN: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    DAMAGE: 'bg-red-100 text-red-800 border-red-300',
    LOSS: 'bg-red-100 text-red-800 border-red-300',
    PRODUCTION: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    RESTOCK: 'bg-teal-100 text-teal-800 border-teal-300',
    CYCLE_COUNT: 'bg-gray-100 text-gray-800 border-gray-300'
  };
  return colors[type] || 'bg-gray-100 text-gray-800 border-gray-300';
};

export const formatDate = (date: Date | string) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatCurrency = (amount: number | null) => {
  if (amount === null || amount === undefined) return 'N/A';
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR'
  }).format(amount);
};

// Helper to truncate long text
export const truncateText = (text: string, maxLength: number = 30) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Helper to get quantity display with +/- indicators
export const formatQuantityWithDirection = (quantity: number, type: StockMovementType, fromLocation?: string | null, toLocation?: string | null) => {
  // For transfers, show neutral
  if (type === StockMovementType.TRANSFER) {
    return quantity.toString();
  }
  
  // For incoming stock (purchases, returns, restocks)
  if ([StockMovementType.PURCHASE, StockMovementType.RETURN, StockMovementType.RESTOCK].includes(type)) {
    return `+${quantity}`;
  }
  
  // For outgoing stock (sales, damage, loss)
  if ([StockMovementType.SALE, StockMovementType.DAMAGE, StockMovementType.LOSS].includes(type)) {
    return `-${quantity}`;
  }
  
  // For adjustments, show +/- based on actual value (you might need to determine this)
  return quantity.toString();
};