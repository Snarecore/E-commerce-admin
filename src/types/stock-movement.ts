export enum StockMovementType {
    OPENING = 'OPENING',
    SALE_RESERVED = 'SALE_RESERVED',
    SALE_DISPATCH = 'SALE_DISPATCH',
    SALE_CANCEL_RELEASE = 'SALE_CANCEL_RELEASE',
    ADJUSTMENT_ADDITION = 'ADJUSTMENT_ADDITION',
    ADJUSTMENT_DAMAGE = 'ADJUSTMENT_DAMAGE',
    ADJUSTMENT_LOST = 'ADJUSTMENT_LOST',
    ADJUSTMENT_THEFT = 'ADJUSTMENT_THEFT',
    ADJUSTMENT_SURPLUS = 'ADJUSTMENT_SURPLUS',
    ADJUSTMENT_DEFICIT = 'ADJUSTMENT_DEFICIT',
    ADJUSTMENT_SAMPLE = 'ADJUSTMENT_SAMPLE',
    RETURN_RESTOCK = 'RETURN_RESTOCK',
    EXCHANGE_SWAP = 'EXCHANGE_SWAP',
    MANUAL_CORRECTION = 'MANUAL_CORRECTION'
}

export enum StockReferenceType {
    ORDER = 'ORDER',
    STOCK_ADJUSTMENT = 'STOCK_ADJUSTMENT',
    RETURN = 'RETURN',
    EXCHANGE = 'EXCHANGE',
    OPENING = 'OPENING',
    MANUAL = 'MANUAL'
}

export enum AdjustmentStatus {
    DRAFT = 'DRAFT',
    PENDING_APPROVAL = 'PENDING_APPROVAL',
    COMPLETED = 'COMPLETED',
    REJECTED = 'REJECTED',
    CANCELLED = 'CANCELLED'
}

export enum AdjustmentReason {
    ADDITION = 'ADDITION',
    DAMAGED = 'DAMAGED',
    LOST = 'LOST',
    THEFT = 'THEFT',
    AUDIT_SURPLUS = 'AUDIT_SURPLUS',
    AUDIT_DEFICIT = 'AUDIT_DEFICIT',
    SAMPLE_GIFT = 'SAMPLE_GIFT',
    OTHER = 'OTHER'
}

export enum AdjustmentMode {
    ADDITION = 'ADDITION',
    SUBTRACTION = 'SUBTRACTION',
    EXACT_COUNT = 'EXACT_COUNT'
}

export interface IStockMovement {
    id: string;
    productId: string;
    variantId?: string | null;
    size?: string | null;
    sku?: string | null;
    movementType: StockMovementType;
    quantityChange: number;
    onHandBefore: number;
    onHandAfter: number;
    reservedBefore: number;
    reservedAfter: number;
    availableBefore: number;
    availableAfter: number;
    referenceType: StockReferenceType;
    referenceId?: string | null;
    idempotencyKey?: string | null;
    reason?: string | null;
    note?: string | null;
    performedBy?: string | null;
    performedByName?: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface IAdjustStockPayload {
    productId: string;
    size?: string | null;
    quantityChange: number;
    movementType: StockMovementType;
    referenceType: StockReferenceType;
    referenceId?: string | null;
    reason?: string | null;
    note?: string | null;
    allowNegativeStock?: boolean;
}

export interface IStockAdjustmentItem {
    id: string;
    adjustmentId: string;
    productId: string;
    productName: string;
    sku?: string | null;
    size?: string | null;
    previousStock: number;
    adjustedQuantity: number;
    newStock: number;
    unitCost: number;
    subtotalImpact: number;
}

export interface IStockAdjustment {
    id: string;
    adjustmentNumber: string;
    status: AdjustmentStatus;
    reason: AdjustmentReason;
    mode: AdjustmentMode;
    notes?: string | null;
    attachmentUrl?: string | null;
    totalItemsAdjusted: number;
    totalValueImpact: number;
    createdByUserId?: string | null;
    createdByName?: string | null;
    approvedByUserId?: string | null;
    approvedByName?: string | null;
    approvedAt?: string | null;
    createdAt: string;
    updatedAt: string;
    items?: IStockAdjustmentItem[];
}
