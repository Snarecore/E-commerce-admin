import React, { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
    CheckoutStatus,
    IncompleteCheckoutFilter,
    IncompleteCheckoutItem,
    IncompleteCheckoutStats,
    RecoveryAction,
} from '../../../models/incomplete-checkout';
import { incompleteCheckoutService } from '../../../services/incomplete-checkout.service';
import PageHeader from '../../../components/cards/PageHeader';
import RefreshButton from '../../../components/table-components/RefreshButton';
import Pagination from '../../../components/pagination';
import { CheckoutKpiCards } from './components/CheckoutKpiCards';
import { CheckoutFilterBar } from './components/CheckoutFilterBar';
import { CheckoutTable } from './components/CheckoutTable';
import { CheckoutDetailsModal } from './components/CheckoutDetailsModal';

const STATUS_TABS: Array<{ key: CheckoutStatus | 'all'; label: string }> = [
    { key: 'abandoned', label: 'Not ordered yet' },
    { key: 'active', label: 'Active in checkout' },
    { key: 'converted', label: 'Converted' },
    { key: 'cancelled', label: 'Cancelled' },
    { key: 'expired', label: 'Expired' },
    { key: 'all', label: 'All Checkouts' },
];

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
    const fetchData = useCallback(async () => {
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
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : 'Failed to load checkouts';
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    }, [filter]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleTabChange = (key: CheckoutStatus | 'all') => {
        setFilter((prev) => ({
            ...prev,
            status: key === 'all' ? undefined : key,
            page: 1,
        }));
    };

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
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : 'Failed to convert order';
            toast.error(msg);
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
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : 'Failed to cancel checkout';
            toast.error(msg);
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
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : 'Failed to record activity';
            toast.error(msg);
        }
    };

    const currentTab = filter.status || 'all';

    return (
        <div className="flex flex-col gap-3.5">
            {/* Page Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <PageHeader
                    headerTitle="Incomplete Checkouts"
                    headerDescription="Monitor drop-offs, recover lost orders, and follow up with potential customers."
                />
                <RefreshButton onClick={fetchData} loading={isLoading} />
            </div>

            {/* KPI Metric Cards */}
            <CheckoutKpiCards stats={stats} isLoading={isLoading && !stats} />

            {/* Tab Bar */}
            <div className="flex flex-wrap gap-1 bg-white border border-gray-200 rounded-xl p-1.5 shadow-2xs">
                {STATUS_TABS.map((tab) => {
                    const isActive = currentTab === tab.key;
                    return (
                        <button
                            key={tab.key}
                            onClick={() => handleTabChange(tab.key)}
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                isActive
                                    ? tab.key === 'converted'
                                        ? 'bg-emerald-600 text-white shadow-xs'
                                        : tab.key === 'cancelled'
                                        ? 'bg-rose-600 text-white shadow-xs'
                                        : 'bg-orange-500 text-white shadow-xs'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                            }`}
                        >
                            {tab.label}
                        </button>
                    );
                })}
            </div>

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

            {/* Pagination & Count */}
            {total > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white px-4 py-2.5 rounded-xl border border-gray-200 shadow-2xs text-xs text-gray-500">
                    <span>
                        Showing <strong className="text-gray-800">{items.length}</strong> of{' '}
                        <strong className="text-gray-800">{total}</strong> checkouts
                    </span>
                    {totalPages > 1 && (
                        <Pagination
                            pageCount={totalPages}
                            currentPageNumber={filter.page || 1}
                            handlePagination={(data) => {
                                setFilter((prev) => ({
                                    ...prev,
                                    page: data.selected + 1,
                                }));
                            }}
                        />
                    )}
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
