// types/transfer.ts
export enum StockMovementType {
  TRANSFER = "TRANSFER",
  ADJUSTMENT = "ADJUSTMENT",
  PURCHASE = "PURCHASE",
  SALE = "SALE",
  RETURN = "RETURN",
  DAMAGE = "DAMAGE",
  LOSS = "LOSS",
  PRODUCTION = "PRODUCTION",
  RESTOCK = "RESTOCK",
  CYCLE_COUNT = "CYCLE_COUNT",
}

export interface StockMovement {
  id: string;
  quantity: number;
  type: StockMovementType;
  reason?: string | null;
  referenceId?: string | null;
  referenceType?: string | null;
  notes?: string | null;
  unitCost?: number | null;
  totalValue?: number | null;
  createdAt: Date;
  updatedAt: Date;
  itemId: string;
  fromLocationId?: string | null;
  toLocationId?: string | null;
  userId: string;
  organizationId: string;

  // Relations
  items: [];
  fromLocation?: {
    name: string;
  } | null;
  toLocation?: {
    name: string;
  } | null;
  user: {
    name: string;
  };
}

// Status mapping based on movement type and other factors
export type MovementStatus = "COMPLETED" | "PENDING" | "IN_TRANSIT" | "FAILED";

export const getMovementStatus = (movement: StockMovement): MovementStatus => {
  // For transfers, check if it's recent (within last hour = in transit)
  if (movement.type === StockMovementType.TRANSFER) {
    const hoursSinceCreated = Math.floor(
      (new Date().getTime() - new Date(movement.createdAt).getTime()) /
        (1000 * 60 * 60)
    );
    if (hoursSinceCreated < 1) {
      return "IN_TRANSIT";
    }
    return "COMPLETED";
  }

  // Most other movements are immediate
  return "COMPLETED";
};

// Helper to get movement type display name
export const getMovementTypeDisplay = (type: StockMovementType): string => {
  const typeMap = {
    [StockMovementType.TRANSFER]: "Transfer",
    [StockMovementType.ADJUSTMENT]: "Adjustment",
    [StockMovementType.PURCHASE]: "Purchase",
    [StockMovementType.SALE]: "Sale",
    [StockMovementType.RETURN]: "Return",
    [StockMovementType.DAMAGE]: "Damage",
    [StockMovementType.LOSS]: "Loss",
    [StockMovementType.PRODUCTION]: "Production",
    [StockMovementType.RESTOCK]: "Restock",
    [StockMovementType.CYCLE_COUNT]: "Cycle Count",
  };
  return typeMap[type] || type;
};

// Helper to determine if movement is incoming or outgoing
export const getMovementDirection = (
  movement: StockMovement
): "IN" | "OUT" | "TRANSFER" => {
  if (movement.fromLocationId && movement.toLocationId) {
    return "TRANSFER";
  } else if (!movement.fromLocationId && movement.toLocationId) {
    return "IN"; // Incoming (like purchases)
  } else if (movement.fromLocationId && !movement.toLocationId) {
    return "OUT"; // Outgoing (like sales)
  }
  return "IN"; // Default
};
