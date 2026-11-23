import { getData, postData, patchData } from './api-service';
import {
    IncompleteCheckoutFilter,
    IncompleteCheckoutItem,
    IncompleteCheckoutStats,
    RecoveryAction,
    CheckoutStatus,
} from '../models/incomplete-checkout';

export interface CheckoutListResponse {
    items: IncompleteCheckoutItem[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

interface ApiResponseWrapper<T = unknown> {
    status?: string;
    statusCode?: number;
    message?: string;
    data?: T;
    error?: boolean;
}

function isApiError(res: unknown): res is { error: boolean; message: string } {
    return Boolean(res && typeof res === 'object' && 'error' in res && (res as { error: boolean }).error);
}

export const incompleteCheckoutService = {
    async getStats(fromDate?: string, toDate?: string): Promise<IncompleteCheckoutStats> {
        let url = 'incomplete-checkouts/stats';
        const params = new URLSearchParams();
        if (fromDate) params.append('fromDate', fromDate);
        if (toDate) params.append('toDate', toDate);
        if (params.toString()) url += `?${params.toString()}`;

        const res = await getData<ApiResponseWrapper<IncompleteCheckoutStats>>({ url });
        if (isApiError(res)) {
            throw new Error(res.message || 'Failed to fetch stats');
        }
        return (res?.data || res) as IncompleteCheckoutStats;
    },

    async getList(filter: IncompleteCheckoutFilter): Promise<CheckoutListResponse> {
        let url = 'incomplete-checkouts';
        const params = new URLSearchParams();
        if (filter.search && filter.search.trim()) params.append('search', filter.search.trim());
        if (filter.status && filter.status !== 'all') params.append('status', filter.status);
        if (filter.fromDate) params.append('fromDate', filter.fromDate);
        if (filter.toDate) params.append('toDate', filter.toDate);
        if (filter.page) params.append('page', String(filter.page));
        if (filter.limit) params.append('limit', String(filter.limit));

        if (params.toString()) url += `?${params.toString()}`;

        const res = await getData<ApiResponseWrapper<CheckoutListResponse>>({ url });
        if (isApiError(res)) {
            throw new Error(res.message || 'Failed to fetch incomplete checkouts');
        }
        return (res?.data || res) as CheckoutListResponse;
    },

    async getDetails(id: string): Promise<IncompleteCheckoutItem> {
        const res = await getData<ApiResponseWrapper<IncompleteCheckoutItem>>({
            url: `incomplete-checkouts/${id}`,
        });
        if (isApiError(res)) {
            throw new Error(res.message || 'Failed to fetch checkout details');
        }
        return (res?.data || res) as IncompleteCheckoutItem;
    },

    async logActivity(checkoutId: string, action: RecoveryAction, note?: string): Promise<unknown> {
        const res = await postData<ApiResponseWrapper>({
            url: `incomplete-checkouts/${checkoutId}/activity`,
            body: { action, note },
        });
        if (isApiError(res)) {
            throw new Error(res.message || 'Failed to record recovery activity');
        }
        return res?.data ?? res;
    },

    async updateStatus(checkoutId: string, status: CheckoutStatus, note?: string): Promise<unknown> {
        const res = await patchData<ApiResponseWrapper>({
            url: `incomplete-checkouts/${checkoutId}/status`,
            body: { status, note },
        });
        if (isApiError(res)) {
            throw new Error(res.message || 'Failed to update checkout status');
        }
        return res?.data ?? res;
    },

    async convertToOrder(checkoutId: string): Promise<unknown> {
        const res = await postData<ApiResponseWrapper>({
            url: `incomplete-checkouts/${checkoutId}/convert-to-order`,
            body: {},
        });
        if (isApiError(res)) {
            throw new Error(res.message || 'Failed to convert checkout to order');
        }
        return res?.data ?? res;
    },
};
