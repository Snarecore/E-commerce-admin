import { useState } from "react";
import PageHeader from "../../../components/cards/PageHeader";
import Button from "../../../components/buttons/ButtonStyleOne";
import { IoMdAddCircleOutline } from "react-icons/io";
import { FiEye } from "react-icons/fi";
import { useAPI } from "../../../hooks/useApi";
import apiConfig from "../../../config/api.json";
import { IStockAdjustment, AdjustmentStatus, AdjustmentReason } from "../../../types/stock-movement";
import { formatDate } from "../../../utils/date-utils";
import CreateAdjustmentModal from "./components/CreateAdjustmentModal";
import StockAdjustmentDetailsModal from "./components/StockAdjustmentDetailsModal";
import ReactPaginate from "react-paginate";

const StockAdjustmentPage = () => {
    const { usePaginatedQuery } = useAPI();

    const [pageNumber, setPageNumber] = useState(1);
    const dataLimit = 15;
    const [statusFilter, setStatusFilter] = useState<string>("ALL");
    const [reasonFilter, setReasonFilter] = useState<string>("ALL");

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedAdjustment, setSelectedAdjustment] = useState<IStockAdjustment | null>(null);

    const getAdjustmentsUrl = () => {
        const params = new URLSearchParams({
            page: pageNumber.toString(),
            limit: dataLimit.toString(),
            ...(statusFilter !== "ALL" && { status: statusFilter }),
            ...(reasonFilter !== "ALL" && { reason: reasonFilter })
        });
        return `${apiConfig.inventory.adjustmentsUrl}?${params.toString()}`;
    };

    const {
        data: responseData,
        totalItems,
        pageCount,
        isLoading,
        refetch
    } = usePaginatedQuery({
        queryKey: ["stock-adjustments", pageNumber.toString(), dataLimit.toString(), statusFilter, reasonFilter],
        url: getAdjustmentsUrl()
    });

    const adjustmentList: IStockAdjustment[] = Array.isArray(responseData)
        ? responseData
        : (responseData as any)?.data || [];

    const handlePagination = (selectedItem: { selected: number }) => {
        setPageNumber(selectedItem.selected + 1);
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <PageHeader
                    headerTitle="Stock Adjustments"
                    headerDescription="Track inventory reconciliations, damaged goods write-offs, and stock variances"
                />
                <Button
                    label="Create Adjustment"
                    onClick={() => setIsCreateModalOpen(true)}
                    color="var(--color-primary)"
                    hoverColor="var(--color-primary-hover)"
                    icon={<IoMdAddCircleOutline size={18} />}
                />
            </div>

            {/* Filter Bar */}
            <div className="bg-[var(--ui-surface,#ffffff)] border border-[var(--ui-border,#e5e7eb)] rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-wrap">
                    <div>
                        <span className="text-xs font-semibold text-[var(--ui-text-muted)] block mb-1">Status</span>
                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setPageNumber(1);
                            }}
                            className="px-3 py-1.5 text-xs bg-[var(--ui-surface-sunken,#f9fafb)] border border-[var(--ui-border,#d1d5db)] rounded-lg text-[var(--ui-text)]"
                        >
                            <option value="ALL">All Statuses</option>
                            <option value={AdjustmentStatus.COMPLETED}>Completed</option>
                            <option value={AdjustmentStatus.PENDING_APPROVAL}>Pending Approval</option>
                            <option value={AdjustmentStatus.DRAFT}>Draft</option>
                            <option value={AdjustmentStatus.REJECTED}>Rejected</option>
                        </select>
                    </div>

                    <div>
                        <span className="text-xs font-semibold text-[var(--ui-text-muted)] block mb-1">Reason</span>
                        <select
                            value={reasonFilter}
                            onChange={(e) => {
                                setReasonFilter(e.target.value);
                                setPageNumber(1);
                            }}
                            className="px-3 py-1.5 text-xs bg-[var(--ui-surface-sunken,#f9fafb)] border border-[var(--ui-border,#d1d5db)] rounded-lg text-[var(--ui-text)]"
                        >
                            <option value="ALL">All Reasons</option>
                            <option value={AdjustmentReason.DAMAGED}>Damaged</option>
                            <option value={AdjustmentReason.LOST}>Lost</option>
                            <option value={AdjustmentReason.THEFT}>Theft</option>
                            <option value={AdjustmentReason.AUDIT_DEFICIT}>Audit Deficit</option>
                            <option value={AdjustmentReason.AUDIT_SURPLUS}>Audit Surplus</option>
                            <option value={AdjustmentReason.SAMPLE_GIFT}>Sample / Gift</option>
                            <option value={AdjustmentReason.ADDITION}>Addition</option>
                            <option value={AdjustmentReason.OTHER}>Other</option>
                        </select>
                    </div>
                </div>

                <div className="text-xs text-[var(--ui-text-muted)] font-medium">
                    Total Records: <span className="font-bold text-[var(--ui-text)]">{totalItems || adjustmentList.length}</span>
                </div>
            </div>

            {/* Table */}
            <div className="bg-[var(--ui-surface,#ffffff)] border border-[var(--ui-border,#e5e7eb)] rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-[var(--ui-surface-sunken,#f9fafb)] text-[var(--ui-text-muted)] text-[11px] uppercase border-b border-[var(--ui-border,#e5e7eb)]">
                            <tr>
                                <th className="px-3.5 py-2.5">Adjustment #</th>
                                <th className="px-3.5 py-2.5">Date</th>
                                <th className="px-3.5 py-2.5">Reason</th>
                                <th className="px-3.5 py-2.5">Mode</th>
                                <th className="px-3.5 py-2.5 text-center">Items</th>
                                <th className="px-3.5 py-2.5 text-right">Value Impact</th>
                                <th className="px-3.5 py-2.5">Created By</th>
                                <th className="px-3.5 py-2.5 text-center">Status</th>
                                <th className="px-3.5 py-2.5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--ui-border,#e5e7eb)]">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={9} className="text-center py-10 text-[var(--ui-text-muted)]">
                                        Loading stock adjustments...
                                    </td>
                                </tr>
                            ) : adjustmentList.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="text-center py-10 text-[var(--ui-text-muted)]">
                                        No stock adjustments found. Click "Create Adjustment" to record your first entry.
                                    </td>
                                </tr>
                            ) : (
                                adjustmentList.map((adj) => (
                                    <tr key={adj.id} className="hover:bg-[var(--ui-surface-hover,#f9fafb)] transition-colors">
                                        <td className="px-3.5 py-2.5 font-semibold text-[var(--ui-text)]">
                                            {adj.adjustmentNumber}
                                        </td>
                                        <td className="px-3.5 py-2.5 text-xs text-[var(--ui-text-muted)]">
                                            {formatDate(adj.createdAt)}
                                        </td>
                                        <td className="px-3.5 py-2.5">
                                            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700">
                                                {adj.reason}
                                            </span>
                                        </td>
                                        <td className="px-3.5 py-2.5 text-xs text-[var(--ui-text-muted)]">
                                            {adj.mode}
                                        </td>
                                        <td className="px-3.5 py-2.5 text-center font-bold text-[var(--ui-text)]">
                                            {adj.totalItemsAdjusted}
                                        </td>
                                        <td className="px-3.5 py-2.5 text-right text-xs font-medium text-[var(--ui-text)]">
                                            ৳{Number(adj.totalValueImpact ?? 0).toFixed(2)}
                                        </td>
                                        <td className="px-3.5 py-2.5 text-xs text-[var(--ui-text)]">
                                            {adj.createdByName || "Admin"}
                                        </td>
                                        <td className="px-3.5 py-2.5 text-center">
                                            <span
                                                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                                    adj.status === AdjustmentStatus.COMPLETED
                                                        ? "bg-emerald-100 text-emerald-800"
                                                        : adj.status === AdjustmentStatus.PENDING_APPROVAL
                                                        ? "bg-amber-100 text-amber-800"
                                                        : adj.status === AdjustmentStatus.REJECTED
                                                        ? "bg-rose-100 text-rose-800"
                                                        : "bg-slate-100 text-slate-800"
                                                }`}
                                            >
                                                {adj.status}
                                            </span>
                                        </td>
                                        <td className="px-3.5 py-2.5 text-right">
                                            <button
                                                type="button"
                                                onClick={() => setSelectedAdjustment(adj)}
                                                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-[var(--color-primary)] hover:bg-[var(--ui-surface-hover,#f3f4f6)] rounded border border-[var(--ui-border,#d1d5db)]"
                                            >
                                                <FiEye size={13} /> View
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pageCount > 1 && (
                    <div className="p-4 border-t border-[var(--ui-border,#e5e7eb)] flex justify-end">
                        <ReactPaginate
                            breakLabel="..."
                            nextLabel="Next >"
                            onPageChange={handlePagination}
                            pageRangeDisplayed={3}
                            pageCount={pageCount}
                            previousLabel="< Previous"
                            renderOnZeroPageCount={null}
                            containerClassName="flex items-center gap-1 text-xs"
                            pageClassName="px-2.5 py-1 rounded border border-[var(--ui-border,#d1d5db)] hover:bg-[var(--ui-surface-hover,#f3f4f6)]"
                            activeClassName="bg-[var(--color-primary)] text-white font-bold"
                            previousClassName="px-2.5 py-1 rounded border border-[var(--ui-border,#d1d5db)]"
                            nextClassName="px-2.5 py-1 rounded border border-[var(--ui-border,#d1d5db)]"
                        />
                    </div>
                )}
            </div>

            {/* Modals */}
            <CreateAdjustmentModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={() => refetch()}
            />

            <StockAdjustmentDetailsModal
                isOpen={!!selectedAdjustment}
                onClose={() => setSelectedAdjustment(null)}
                adjustment={selectedAdjustment}
                onRefresh={() => refetch()}
            />
        </div>
    );
};

export default StockAdjustmentPage;
