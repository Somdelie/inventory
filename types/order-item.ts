// types/order-item.ts
// This file will serve as the single source of truth for OrderItem type

export interface OrderItem {
  itemId: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  taxAmount: number; // Required, not optional
  totalPrice: number; // Required, not optional
}

// Export a function to create a new OrderItem with calculated values
export function createOrderItem(
  itemId: string,
  quantity: number,
  unitPrice: number,
  taxRate: number
): OrderItem {
  const taxAmount = quantity * unitPrice * taxRate / 100;
  const totalPrice = quantity * unitPrice + taxAmount;
  
  return {
    itemId,
    quantity,
    unitPrice,
    taxRate,
    taxAmount,
    totalPrice
  };
}