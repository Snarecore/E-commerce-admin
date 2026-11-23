import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
    IncompleteCheckoutFilter,
    IncompleteCheckoutItem,
    IncompleteCheckoutStats,
    RecoveryAction,
} from '../../../models/incomplete-checkout';
import { incompleteCheckoutService } from '../../../services/incomplete-checkout.service';
import { CheckoutKpiCards } from './components/CheckoutKpiCards';
import { CheckoutFilterBar } from './components/CheckoutFilterBar';
import { CheckoutTable } from './components/CheckoutTable';
import { CheckoutDetailsModal } from './components/CheckoutDetailsModal';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const IncompleteCheckoutsPage: React.FC = () => {
    const [stats, setStats] = useState<IncompleteCheckoutStats | undefined>(undefined);
    const [items, setItems] = useState<IncompleteCheckoutItem[]>([]);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [isConverting, setIsConverting] = useState(false);

    // Active filter state
    const [filter, setFilter] = useState<IncompleteCheckoutFilter>({
        search: '',
        status: 'abandoned',
        fromDate: '',
        toDate: '',
        page: 1,
        limit: 20,
    });

    // Details modal state
    const [selectedCheckout, setSelectedCheckout] = useState<IncompleteCheckoutItem | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    // Fetch Stats & List
    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [statsRes, listRes] = await Promise.all([
                incompleteCheckoutService.getStats(filter.fromDate, filter.toDate).catch(() => undefined),
                incompleteCheckoutService.getList(filter),
            ]);

            if (statsRes) {
                setStats(statsRes);
            }

            if (listRes) {
                setItems(listRes.items || []);
                setTotal(listRes.total || 0);
                setTotalPages(listRes.totalPages || 1);
            }
        } catch (error: any) {
            toast.error(error?.message || 'Failed to load checkouts');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [filter]);

    // Handle Quick Recovery Call
    const handleCall = async (item: IncompleteCheckoutItem) => {
        const targetUrl = item.recovery?.callUrl || (item.customer.phone ? `tel:${item.customer.phone}` : null);
        if (!targetUrl) {
            toast.error('No phone number available for this checkout');
            return;
        }
        try {
            await incompleteCheckoutService.logActivity(item.id, 'call_initiated', 'Direct call initiated from table');
            window.location.href = targetUrl;
            toast.success('Call activity recorded');
        } catch {
            window.location.href = targetUrl;
        }
    };

    // Handle Quick Recovery WhatsApp
    const handleWhatsApp = async (item: IncompleteCheckoutItem) => {
        const targetUrl = item.recovery?.whatsappUrl;
        if (!targetUrl) {
            toast.error('No WhatsApp link available for this checkout');
            return;
        }
        try {
            await incompleteCheckoutService.logActivity(item.id, 'whatsapp_opened', 'WhatsApp chat opened from table');
            window.open(targetUrl, '_blank');
            toast.success('WhatsApp activity recorded');
        } catch {
            window.open(targetUrl, '_blank');
        }
    };

    // View Details Modal
    const handleViewDetails = async (item: IncompleteCheckoutItem) => {
        try {
            const fullDetails = await incompleteCheckoutService.getDetails(item.id);
            setSelectedCheckout(fullDetails);
            setIsDetailsOpen(true);
        } catch {
            setSelectedCheckout(item);
            setIsDetailsOpen(true);
        }
    };

    // Convert Checkout to Official Order
    const handleConvertToOrder = async () => {
        if (!selectedCheckout) return;
        setIsConverting(true);
        try {
            await incompleteCheckoutService.convertToOrder(selectedCheckout.id);
            toast.success('Successfully converted to official order!');
            setIsDetailsOpen(false);
            fetchData();
        } catch (error: any) {
            toast.error(error?.message || 'Failed to convert order');
        } finally {
            setIsConverting(false);
        }
    };

    // Cancel Checkout
    const handleCancel = async (item: IncompleteCheckoutItem, note = 'Cancelled by admin') => {
        try {
            await incompleteCheckoutService.updateStatus(item.id, 'cancelled', note);
            toast.success('Checkout marked as cancelled');
            if (isDetailsOpen) setIsDetailsOpen(false);
            fetchData();
        } catch (error: any) {
            toast.error(error?.message || 'Failed to cancel checkout');
        }
    };

    // Delete / Archive
    const handleDelete = async (item: IncompleteCheckoutItem) => {
        if (!window.confirm(`Are you sure you want to cancel and remove checkout ${item.publicCheckoutId}?`)) {
            return;
        }
        await handleCancel(item, 'Archived by admin');
    };

    // Log Activity from Modal
    const handleModalLogActivity = async (action: RecoveryAction, note?: string) => {
        if (!selectedCheckout) return;
        try {
            await incompleteCheckoutService.logActivity(selectedCheckout.id, action, note);
            const updated = await incompleteCheckoutService.getDetails(selectedCheckout.id);
            setSelectedCheckout(updated);
            toast.success('Activity recorded');
        } catch (error: any) {
            toast.error(error?.message || 'Failed to record activity');
        }
    };

    return (
        <div className="space-y-6">
            {/* Page Title */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Incomplete Checkouts</h1>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">
                        Monitor drop-offs, recover lost orders, and follow up with potential customers.
                    </p>
                </div>
            </div>

            {/* KPI Metric Cards */}
            <CheckoutKpiCards stats={stats} isLoading={isLoading && !stats} />

            {/* Filter Bar */}
            <CheckoutFilterBar
                filter={filter}
                onFilterChange={(newFilter) => setFilter((prev) => ({ ...prev, ...newFilter }))}
                onReset={() =>
                    setFilter({
                        search: '',
                        status: 'abandoned',
                        fromDate: '',
                        toDate: '',
                        page: 1,
                        limit: 20,
                    })
                }
                isLoading={isLoading}
            />

            {/* Incomplete Checkouts Data Table */}
            <CheckoutTable
                items={items}
                isLoading={isLoading}
                onViewDetails={handleViewDetails}
                onCancel={(item) => handleCancel(item)}
                onDelete={handleDelete}
                onCall={handleCall}
                onWhatsApp={handleWhatsApp}
            />

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between bg-white px-4 py-3 rounded-xl border border-gray-100 shadow-sm text-xs text-gray-600">
                    <span>
                        Showing {items.length} of {total} checkouts
                    </span>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setFilter((prev) => ({ ...prev, page: Math.max(1, (prev.page || 1) - 1) }))}
                            disabled={filter.page === 1}
                            className="p-2 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
                        >
                            <FiChevronLeft />
                        </button>
                        <span className="font-semibold text-gray-800">
                            Page {filter.page} of {totalPages}
                        </span>
                        <button
                            onClick={() =>
                                setFilter((prev) => ({
                                    ...prev,
                                    page: Math.min(totalPages, (prev.page || 1) + 1),
                                }))
                            }
                            disabled={filter.page === totalPages}
                            className="p-2 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
                        >
                            <FiChevronRight />
                        </button>
                    </div>
                </div>
            )}

            {/* Details & Recovery Modal */}
            <CheckoutDetailsModal
                checkout={selectedCheckout}
                isOpen={isDetailsOpen}
                onClose={() => setIsDetailsOpen(false)}
                onLogActivity={handleModalLogActivity}
                onConvertToOrder={handleConvertToOrder}
                onCancelCheckout={(note) => (selectedCheckout ? handleCancel(selectedCheckout, note) : Promise.resolve())}
                isConverting={isConverting}
            />
        </div>
    );
};

export default IncompleteCheckoutsPage;
