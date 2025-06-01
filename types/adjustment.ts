// types.ts - Shared types for stock adjustments

export interface ItemForAdjustment {
  id: string;
  name: string;
  sku: string;
  costPrice: number;
  categoryName: string;
  brandName: string;
  currentStock: number;
  reservedQuantity: number;
}

export interface Location {
  id: string;
  name: string;
  type: string;
}

export interface AdjustmentLineForm {
  itemId: string;
  beforeQuantity: number;
  afterQuantity: number;
  adjustmentQuantity: number;
  notes?: string;
  serialNumbers?: string[];
  item?: ItemForAdjustment;
}

// types/adjustment.ts
import { AdjustmentStatus, AdjustmentType } from "@prisma/client";

export interface ItemForAdjustment {
  id: string;
  name: string;
  sku: string;
  costPrice: number;
  categoryName: string;
  brandName: string;
  currentStock: number;
  reservedQuantity: number;
}

export interface Location {
  id: string;
  name: string;
  type: string;
}

export interface AdjustmentLineForm {
  itemId: string;
  beforeQuantity: number;
  afterQuantity: number;
  adjustmentQuantity: number;
  notes?: string;
  serialNumbers?: string[];
  item?: ItemForAdjustment;
}

export interface AdjustmentItem {
  id: string;
  beforeQuantity: number;
  afterQuantity: number;
  adjustmentQuantity: number;
  notes?: string;
  item: {
    id: string;
    name: string;
    sku: string;
    costPrice: number;
  };
}

export interface AdjustmentData {
  id: string;
  adjustmentNumber: string;
  date: Date | string; // Accept both Date and string
  adjustmentType: AdjustmentType;
  reason: string;
  notes?: string;
  status: AdjustmentStatus;
  location: {
    id: string;
    name: string;
    type: string;
  };
  createdByUser: {
    name: string;
    email: string;
  };
  approvedBy?: {
    name: string;
    email: string;
  };
  lines: AdjustmentItem[];
  organizationId: string;
  createdAt: Date | string; // Accept both Date and string
  updatedAt: Date | string; // Accept both Date and string
}

export interface ItemForAdjustment {
  id: string;
  name: string;
  sku: string;
  costPrice: number;
  categoryName: string;
  brandName: string;
  currentStock: number;
  reservedQuantity: number;
}

export interface Location {
  id: string;
  name: string;
  type: string;
}

export interface AdjustmentLineForm {
  itemId: string;
  beforeQuantity: number;
  afterQuantity: number;
  adjustmentQuantity: number;
  notes?: string;
  serialNumbers?: string[];
  item?: ItemForAdjustment;
}

export interface AdjustmentItem {
  id: string;
  beforeQuantity: number;
  afterQuantity: number;
  adjustmentQuantity: number;
  notes?: string;
  item: {
    id: string;
    name: string;
    sku: string;
    costPrice: number;
  };
}

// Updated to handle both Date and string types
export interface AdjustmentData {
  id: string;
  adjustmentNumber: string;
  date: Date | string; // Accept both Date and string
  adjustmentType: AdjustmentType;
  reason: string;
  notes?: string;
  status: AdjustmentStatus;
  location: {
    id: string;
    name: string;
    type: string;
  };
  createdByUser: {
    name: string;
    email: string;
  };
  approvedBy?: {
    name: string;
    email: string;
  };
  lines: AdjustmentItem[];
  organizationId: string;
  createdAt: Date | string; // Accept both Date and string
  updatedAt: Date | string; // Accept both Date and string
}
