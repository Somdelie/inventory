// types/purchase-order.ts

// Instead of enums, use string literal types to match Prisma's generated types
export type PurchaseOrderStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "APPROVED"
  | "PARTIALLY_RECEIVED"
  | "RECEIVED"
  | "CANCELED"
  | "CLOSED";

export type PaymentStatus = "PENDING" | "PARTIAL" | "PAID" | "REFUNDED";

// Type for Location model
export type LocationType = "SHOP" | "WAREHOUSE" | "OFFICE" | "VIRTUAL";

// Import the required types from other files
import { Supplier } from "./types";
import { User } from "next-auth";

// User interface to match what's included in your query
export interface SimpleUser {
  id: string;
  name: string;
}

// Basic interfaces
export interface Location {
  id: string;
  name: string;
  type: LocationType;
  address: string | null;
  phone: string | null;
  email: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  organizationId: string | null;
}

export interface Organization {
  id: string;
  // Other organization properties would go here
}

export interface Item {
  id: string;
  // Other item properties would go here
}

// Define the cleaned up input type for purchase order line items
export interface CreatePurchaseOrderLineInput {
  itemId: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  taxAmount?: number;
  discount?: number;
  totalPrice: number; // Required - never undefined
  notes?: string;
}

// Define the cleaned up input type for the purchase order
export interface CreatePurchaseOrderInput {
  poNumber: string;
  date: Date;
  supplierId: string;
  supplierName?: string;
  supplierEmail?: string;
  supplierPhone?: string;
  locationId: string; // Required based on your form
  deliveryLocationId?: string;
  subtotal: number;
  taxAmount: number;
  shippingCost: number;
  discount: number;
  totalAmount: number;
  notes?: string; // No null, only string or undefined
  paymentTerms?: string; // No null, only string or undefined
  expectedDeliveryDate?: Date; // No null, only Date or undefined
  paymentMethod?: string;
  lines: CreatePurchaseOrderLineInput[];
}

// Response type for purchase order creation
export interface PurchaseOrderResponse {
  success: boolean;
  data?: any;
  error?: string;
}

// Purchase order line item
export interface PurchaseOrderLine {
  id: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  taxAmount: number;
  discount?: number;
  totalPrice: number;
  notes?: string;
  receivedQuantity: number;
  createdAt: Date;
  updatedAt?: Date;

  // Relations
  purchaseOrderId: string;
  purchaseOrder?: PurchaseOrder;
  itemId: string;
  item?: Item;
  goodsReceiptLines?: GoodsReceiptLine[];
}

// Goods receipt line
export interface GoodsReceiptLine {
  id: string;
  purchaseOrderLineId: string;
  purchaseOrderLine?: PurchaseOrderLine;
  // Other properties would go here
}

// Goods receipt
export interface GoodsReceipt {
  id: string;
  purchaseOrderId: string;
  purchaseOrder?: PurchaseOrder;
  // Other properties would go here
}

// Type for purchase order from database query
export interface PurchaseOrder {
  id: string;
  poNumber: string;
  date: Date;
  supplierName: string | null;
  supplierEmail: string | null;
  supplierPhone: string | null;
  status: PurchaseOrderStatus;
  subtotal: number;
  taxAmount: number;
  shippingCost: number;
  discount: number;
  totalAmount: number;
  notes: string | null;
  paymentTerms: string | null;
  expectedDeliveryDate: Date | null;
  orderDate: Date;
  paymentStatus: PaymentStatus;
  paymentMethod: string | null;
  createdAt: Date;
  updatedAt: Date | null;

  // Relations that are actually included in your query
  supplierId: string | null;
  supplier: Supplier | null;
  deliveryLocationId: string | null;
  organizationId: string;
  createdById: string;
  createdBy: SimpleUser;
  approvedById: string | null;
  locationId: string | null;
  Location: Location | null; // Notice the capital L matching your schema
}

// Complete purchase order interface (for when you have all relations loaded)
export interface CompletePurchaseOrder extends PurchaseOrder {
  deliveryLocation: Location | null;
  organization: Organization;
  approvedBy: User | null;
  lines: PurchaseOrderLine[];
  goodsReceipts: GoodsReceipt[];
  items: Item[];
  location: Location | null;
}

// Input type for updating a purchase order
export interface UpdatePurchaseOrderInput {
  id: string;
  poNumber?: string;
  date?: Date;
  supplierName?: string;
  supplierEmail?: string;
  supplierPhone?: string;
  status?: PurchaseOrderStatus;
  subtotal?: number;
  taxAmount?: number;
  shippingCost?: number;
  discount?: number;
  totalAmount?: number;
  notes?: string;
  paymentTerms?: string;
  expectedDeliveryDate?: Date;
  paymentStatus?: PaymentStatus;
  paymentMethod?: string;
  supplierId?: string;
  deliveryLocationId?: string;
  locationId?: string;
  approvedById?: string;
}

// Input type for updating a purchase order line
export interface UpdatePurchaseOrderLineInput {
  quantity?: number;
  unitPrice?: number;
  taxRate?: number;
  taxAmount?: number;
  discount?: number;
  totalPrice: number;
  notes?: string;
  receivedQuantity?: number;
  itemId?: string;
}
