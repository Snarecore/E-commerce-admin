import { useState } from "react";
import PageHeader from "../../../components/cards/PageHeader";
import { useAPI } from "../../../hooks/useApi";
import apiConfig from "../../../config/api.json";
import { IStockMovement, StockMovementType } from "../../../types/stock-movement";
import { formatDate } from "../../../utils/date-utils";
import ReactPaginate from "react-paginate";

const StockMovementsPage = () => {
    const { usePaginatedQuery } = useAPI();

    const [pageNumber, setPageNumber] = useState(1);
    const dataLimit = 20;
    const [movementTypeFilter, setMovementTypeFilter] = useState<string>("ALL");
    const [searchRef, setSearchRef] = useState<string>("");

    const getMovementsUrl = () => {
        const params = new URLSearchParams({
            page: pageNumber.toString(),
            limit: dataLimit.toString(),
            ...(movementTypeFilter !== "ALL" && { movementType: movementTypeFilter }),
            ...(searchRef && { referenceId: searchRef })
        });
        return `${apiConfig.inventory.movementsUrl}?${params.toString()}`;
    };

    const {
        data: responseData,
        totalItems,
        pageCount,
        isLoading
    } = usePaginatedQuery({
        queryKey: ["stock-movements", pageNumber.toString(), dataLimit.toString(), movementTypeFilter, searchRef],
        url: getMovementsUrl()
    });

    const movements: IStockMovement[] = Array.isArray(responseData)
        ? responseData
        : (responseData as any)?.data || [];

    const handlePagination = (selectedItem: { selected: number }) => {
        setPageNumber(selectedItem.selected + 1);
    };

    const getBadgeStyle = (type: StockMovementType) => {
        switch (type) {
            case StockMovementType.OPENING:
            case StockMovementType.ADJUSTMENT_ADDITION:
            case StockMovementType.ADJUSTMENT_SURPLUS:
            case StockMovementType.RETURN_RESTOCK:
                return "bg-emerald-100 text-emerald-800 border-emerald-200";
            case StockMovementType.SALE_DISPATCH:
            case StockMovementType.ADJUSTMENT_DAMAGE:
            case StockMovementType.ADJUSTMENT_LOST:
            case StockMovementType.ADJUSTMENT_THEFT:
            case StockMovementType.ADJUSTMENT_DEFICIT:
                return "bg-rose-100 text-rose-800 border-rose-200";
            case StockMovementType.SALE_RESERVED:
                return "bg-amber-100 text-amber-800 border-amber-200";
            case StockMovementType.SALE_CANCEL_RELEASE:
                return "bg-blue-100 text-blue-800 border-blue-200";
            default:
                return "bg-slate-100 text-slate-800 border-slate-200";
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <PageHeader
                headerTitle="Stock Movement Ledger"
                headerDescription="Immutable audit trail of all physical and reserved inventory changes"
            />

            {/* Filter Bar */}
            <div className="bg-[var(--ui-surface,#ffffff)] border border-[var(--ui-border,#e5e7eb)] rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-wrap">
                    <div>
                        <span className="text-xs font-semibold text-[var(--ui-text-muted)] block mb-1">Movement Type</span>
                        <select
                            value={movementTypeFilter}
                            onChange={(e) => {
                                setMovementTypeFilter(e.target.value);
                                setPageNumber(1);
                            }}
                            className="px-3 py-1.5 text-xs bg-[var(--ui-surface-sunken,#f9fafb)] border border-[var(--ui-border,#d1d5db)] rounded-lg text-[var(--ui-text)]"
                        >
                            <option value="ALL">All Movements</option>
                            <option value={StockMovementType.SALE_DISPATCH}>Order Dispatch (-)</option>
                            <option value={StockMovementType.SALE_CANCEL_RELEASE}>Order Cancel Release (+)</option>
                            <option value={StockMovementType.ADJUSTMENT_DAMAGE}>Damage Write-Off (-)</option>
                            <option value={StockMovementType.ADJUSTMENT_LOST}>Lost / Theft (-)</option>
                            <option value={StockMovementType.ADJUSTMENT_SURPLUS}>Audit Surplus (+)</option>
                            <option value={StockMovementType.ADJUSTMENT_DEFICIT}>Audit Deficit (-)</option>
                            <option value={StockMovementType.RETURN_RESTOCK}>Return Restock (+)</option>
                            <option value={StockMovementType.OPENING}>Opening Stock</option>
                        </select>
                    </div>

                    <div>
                        <span className="text-xs font-semibold text-[var(--ui-text-muted)] block mb-1">Search Reference</span>
                        <input
                            type="text"
                            placeholder="e.g. ORD-1001 or ADJ-2026..."
                            value={searchRef}
                            onChange={(e) => {
                                setSearchRef(e.target.value);
                                setPageNumber(1);
                            }}
                            className="px-3 py-1.5 text-xs bg-[var(--ui-surface-sunken,#f9fafb)] border border-[var(--ui-border,#d1d5db)] rounded-lg text-[var(--ui-text)] placeholder-[var(--ui-text-muted)]"
                        />
                    </div>
                </div>

                <div className="text-xs text-[var(--ui-text-muted)] font-medium">
                    Total Movements: <span className="font-bold text-[var(--ui-text)]">{totalItems || movements.length}</span>
                </div>
            </div>

            {/* Table */}
            <div className="bg-[var(--ui-surface,#ffffff)] border border-[var(--ui-border,#e5e7eb)] rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-[var(--ui-surface-sunken,#f9fafb)] text-[var(--ui-text-muted)] text-[11px] uppercase border-b border-[var(--ui-border,#e5e7eb)]">
                            <tr>
                                <th className="px-3.5 py-2.5">Timestamp</th>
                                <th className="px-3.5 py-2.5">SKU / Product ID</th>
                                <th className="px-3.5 py-2.5">Variant</th>
                                <th className="px-3.5 py-2.5">Movement Type</th>
                                <th className="px-3.5 py-2.5 text-center">Change</th>
                                <th className="px-3.5 py-2.5 text-center">On-Hand (Before → After)</th>
                                <th className="px-3.5 py-2.5">Reference</th>
                                <th className="px-3.5 py-2.5">Performed By</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--ui-border,#e5e7eb)]">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={8} className="text-center py-10 text-[var(--ui-text-muted)]">
                                        Loading ledger movements...
                                    </td>
                                </tr>
                            ) : movements.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="text-center py-10 text-[var(--ui-text-muted)]">
                                        No stock movements recorded yet.
                                    </td>
                                </tr>
                            ) : (
                                movements.map((m) => (
                                    <tr key={m.id} className="hover:bg-[var(--ui-surface-hover,#f9fafb)] transition-colors">
                                        <td className="px-3.5 py-2.5 text-xs text-[var(--ui-text-muted)]">
                                            {formatDate(m.createdAt)}
                                        </td>
                                        <td className="px-3.5 py-2.5">
                                            <p className="font-medium text-xs text-[var(--ui-text)]">{m.sku || m.productId}</p>
                                        </td>
                                        <td className="px-3.5 py-2.5 text-xs font-medium text-[var(--ui-text)]">
                                            {m.size || "Standard"}
                                        </td>
                                        <td className="px-3.5 py-2.5">
                                            <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${getBadgeStyle(m.movementType)}`}>
                                                {m.movementType}
                                            </span>
                                        </td>
                                        <td className="px-3.5 py-2.5 text-center font-bold">
                                            <span
                                                className={
                                                    m.quantityChange > 0
                                                        ? "text-emerald-600"
                                                        : m.quantityChange < 0
                                                        ? "text-rose-600"
                                                        : "text-slate-600"
                                                }
                                            >
                                                {m.quantityChange > 0 ? `+${m.quantityChange}` : m.quantityChange}
                                            </span>
                                        </td>
                                        <td className="px-3.5 py-2.5 text-center text-xs font-mono">
                                            <span className="text-[var(--ui-text-muted)]">{m.onHandBefore}</span>
                                            {" → "}
                                            <span className="font-bold text-[var(--ui-text)]">{m.onHandAfter}</span>
                                        </td>
                                        <td className="px-3.5 py-2.5 text-xs text-[var(--ui-text)] font-semibold">
                                            {m.referenceId || m.referenceType}
                                        </td>
                                        <td className="px-3.5 py-2.5 text-xs text-[var(--ui-text-muted)]">
                                            {m.performedByName || m.performedBy || "System"}
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
        </div>
    );
};

export default StockMovementsPage;
