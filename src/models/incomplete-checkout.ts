export type CheckoutStatus = 'active' | 'abandoned' | 'converted' | 'cancelled' | 'expired';
export type RecoveryAction = 'call_initiated' | 'whatsapp_opened' | 'note_added' | 'converted' | 'cancelled';

export interface CartItemSnapshot {
    productId: string;
    variantId?: string | null;
    sku?: string | null;
    title: string;
    image?: string | null;
    unitPriceMinor: number;
    quantity: number;
    subtotalMinor: number;
}

export interface IncompleteCheckoutItem {
    id: string;
    publicCheckoutId: string;
    customer: {
        name: string;
        phone: string | null;
        email: string | null;
        address: string | null;
        city: string | null;
    };
    cartItems: CartItemSnapshot[];
    total: number;
    totalMinor: string;
    currency: string;
    source: string;
    utmParams?: {
        utm_source?: string;
        utm_medium?: string;
        utm_campaign?: string;
    } | null;
    status: CheckoutStatus;
    startedAt: string;
    lastActivityAt: string;
    abandonedAt?: string | null;
    convertedAt?: string | null;
    convertedOrderId?: string | null;
    convertedOrderNumber?: string | null;
    recoveryAttemptCount: number;
    subtotal?: number;
    deliveryFee?: number;
    discount?: number;
    recovery?: {
        phone: string | null;
        callUrl: string | null;
        whatsappUrl: string | null;
        actions: {
            canConvert: boolean;
            canCancel: boolean;
            canCall: boolean;
            canWhatsApp: boolean;
        };
    };
    activities?: Array<{
        id: string;
        action: RecoveryAction;
        note?: string | null;
        adminName: string;
        createdAt: string;
    }>;
}

export interface IncompleteCheckoutStats {
    activeCount: number;
    abandonedCount: number;
    recoverableValue: number;
    recoverableValueMinor: string;
    convertedCount: number;
    cancelledCount: number;
    expiredCount: number;
}

export interface IncompleteCheckoutFilter {
    search?: string;
    status?: CheckoutStatus | 'all';
    fromDate?: string;
    toDate?: string;
    page?: number;
    limit?: number;
}
