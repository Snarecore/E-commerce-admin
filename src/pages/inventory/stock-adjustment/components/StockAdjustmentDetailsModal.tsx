import React, { useState } from "react";
import { IoCloseOutline } from "react-icons/io5";
import { FiCheck, FiX, FiPrinter } from "react-icons/fi";
import Button from "../../../../components/buttons/ButtonStyleOne";
import { useAPI } from "../../../../hooks/useApi";
import apiConfig from "../../../../config/api.json";
import { IStockAdjustment, AdjustmentStatus } from "../../../../types/stock-movement";
import { formatDate } from "../../../../utils/date-utils";
import toast from "react-hot-toast";

interface StockAdjustmentDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    adjustment: IStockAdjustment | null;
    onRefresh: () => void;
}

const StockAdjustmentDetailsModal: React.FC<StockAdjustmentDetailsModalProps> = ({
    isOpen,
    onClose,
    adjustment,
    onRefresh
}) => {
    const { handleApiMutation, postMutation } = useAPI();
    const [isProcessing, setIsProcessing] = useState(false);

    if (!isOpen || !adjustment) return null;

    const handleApprove = async () => {
        setIsProcessing(true);
        try {
            const res = await handleApiMutation({
                // @ts-ignore
                mutation: postMutation,
                url: `${apiConfig.inventory.adjustmentsUrl}/${adjustment.id}/approve`,
                body: {},
                invalidateQueryKey: ["stock-adjustments", "products", "stock-movements", "inventory-availability"],
                showSuccessMessage: false,
                showErrorMessage: true,
                requiredFields: []
            });
            if (res?.success) {
                toast.success("Adjustment approved & inventory updated successfully!");
                onRefresh();
                onClose();
            }
        } catch (err: any) {
            toast.error(err?.message || "Failed to approve adjustment");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleReject = async () => {
        const reason = window.prompt("Please enter a reason for rejecting this adjustment:");
        if (!reason) return;

        setIsProcessing(true);
        try {
            const res = await handleApiMutation({
                // @ts-ignore
                mutation: postMutation,
                url: `${apiConfig.inventory.adjustmentsUrl}/${adjustment.id}/reject`,
                body: { reason },
                invalidateQueryKey: ["stock-adjustments", "products", "stock-movements", "inventory-availability"],
                showSuccessMessage: false,
                showErrorMessage: true,
                requiredFields: []
            });
            if (res?.success) {
                toast.success("Adjustment rejected");
                onRefresh();
                onClose();
            }
        } catch (err: any) {
            toast.error(err?.message || "Failed to reject adjustment");
        } finally {
            setIsProcessing(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const isPending = adjustment.status === AdjustmentStatus.PENDING_APPROVAL || adjustment.status === AdjustmentStatus.DRAFT;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-[var(--ui-surface,#ffffff)] border border-[var(--ui-border,#e5e7eb)] rounded-xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--ui-border,#e5e7eb)]">
                    <div className="flex items-center gap-3">
                        <div>
                            <h3 className="text-lg font-bold text-[var(--ui-text)]">
                                {adjustment.adjustmentNumber}
                            </h3>
                            <p className="text-xs text-[var(--ui-text-muted)]">
                                Created on {formatDate(adjustment.createdAt)}
                            </p>
                        </div>
                        <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                adjustment.status === AdjustmentStatus.COMPLETED
                                    ? "bg-emerald-100 text-emerald-800"
                                    : adjustment.status === AdjustmentStatus.PENDING_APPROVAL
                                    ? "bg-amber-100 text-amber-800"
                                    : adjustment.status === AdjustmentStatus.REJECTED
                                    ? "bg-rose-100 text-rose-800"
                                    : "bg-slate-100 text-slate-800"
                            }`}
                        >
                            {adjustment.status}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handlePrint}
                            className="p-1.5 rounded-lg border border-[var(--ui-border,#e5e7eb)] hover:bg-[var(--ui-surface-hover,#f3f4f6)] text-[var(--ui-text)]"
                            title="Print Voucher"
                        >
                            <FiPrinter size={18} />
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-1.5 rounded-lg hover:bg-[var(--ui-surface-hover,#f3f4f6)] text-[var(--ui-text-muted)] hover:text-[var(--ui-text)]"
                        >
                            <IoCloseOutline size={22} />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Meta Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-[var(--ui-surface-sunken,#f9fafb)] rounded-lg border border-[var(--ui-border,#e5e7eb)] text-xs">
                        <div>
                            <span className="text-[var(--ui-text-muted)] block">Reason</span>
                            <span className="font-semibold text-[var(--ui-text)] text-sm">{adjustment.reason}</span>
                        </div>
                        <div>
                            <span className="text-[var(--ui-text-muted)] block">Mode</span>
                            <span className="font-semibold text-[var(--ui-text)] text-sm">{adjustment.mode}</span>
                        </div>
                        <div>
                            <span className="text-[var(--ui-text-muted)] block">Created By</span>
                            <span className="font-medium text-[var(--ui-text)]">{adjustment.createdByName || "Admin"}</span>
                        </div>
                        <div>
                            <span className="text-[var(--ui-text-muted)] block">Approved By</span>
                            <span className="font-medium text-[var(--ui-text)]">
                                {adjustment.approvedByName || "Pending"}
                            </span>
                        </div>
                    </div>

                    {/* Notes */}
                    {adjustment.notes && (
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900">
                            <span className="font-bold">Notes: </span>
                            {adjustment.notes}
                        </div>
                    )}

                    {/* Items Table */}
                    <div>
                        <h4 className="text-xs font-semibold text-[var(--ui-text-muted)] uppercase tracking-wider mb-2">
                            Adjusted Items ({adjustment.items?.length || 0})
                        </h4>
                        <div className="border border-[var(--ui-border,#e5e7eb)] rounded-lg overflow-hidden">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-[var(--ui-surface-sunken,#f9fafb)] text-[var(--ui-text-muted)] text-xs uppercase border-b border-[var(--ui-border,#e5e7eb)]">
                                    <tr>
                                        <th className="px-3 py-2">Product</th>
                                        <th className="px-3 py-2">Variant</th>
                                        <th className="px-3 py-2 text-center">Previous</th>
                                        <th className="px-3 py-2 text-center">Adjustment</th>
                                        <th className="px-3 py-2 text-center">New Stock</th>
                                        <th className="px-3 py-2 text-right">Value Impact</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--ui-border,#e5e7eb)]">
                                    {(adjustment.items || []).map((item) => (
                                        <tr key={item.id} className="hover:bg-[var(--ui-surface-hover,#f9fafb)]">
                                            <td className="px-3 py-2">
                                                <p className="font-medium text-[var(--ui-text)]">{item.productName}</p>
                                                <p className="text-xs text-[var(--ui-text-muted)]">{item.sku || "N/A"}</p>
                                            </td>
                                            <td className="px-3 py-2 text-xs font-medium text-[var(--ui-text)]">
                                                {item.size || "Standard"}
                                            </td>
                                            <td className="px-3 py-2 text-center text-xs text-[var(--ui-text-muted)]">
                                                {item.previousStock}
                                            </td>
                                            <td className="px-3 py-2 text-center font-bold">
                                                <span
                                                    className={
                                                        item.adjustedQuantity > 0
                                                            ? "text-emerald-600"
                                                            : item.adjustedQuantity < 0
                                                            ? "text-rose-600"
                                                            : "text-slate-600"
                                                    }
                                                >
                                                    {item.adjustedQuantity > 0 ? `+${item.adjustedQuantity}` : item.adjustedQuantity}
                                                </span>
                                            </td>
                                            <td className="px-3 py-2 text-center font-bold text-[var(--ui-text)]">
                                                {item.newStock}
                                            </td>
                                            <td className="px-3 py-2 text-right font-medium text-xs text-[var(--ui-text)]">
                                                ৳{Number(item.subtotalImpact ?? 0).toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Footer with Maker-Checker buttons */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--ui-border,#e5e7eb)] bg-[var(--ui-surface-sunken,#f9fafb)]">
                    <div className="text-xs text-[var(--ui-text-muted)]">
                        Total Value Impact:{" "}
                        <span className="font-bold text-[var(--ui-text)] text-sm">
                            ৳{Number(adjustment.totalValueImpact ?? 0).toFixed(2)}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        {isPending && (
                            <>
                                <button
                                    type="button"
                                    onClick={handleReject}
                                    disabled={isProcessing}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-300 rounded-lg transition-colors"
                                >
                                    <FiX size={14} /> Reject
                                </button>
                                <Button
                                    label="Approve & Apply Stock"
                                    onClick={handleApprove}
                                    disabled={isProcessing}
                                    color="var(--color-primary)"
                                    hoverColor="var(--color-primary-hover)"
                                    icon={<FiCheck size={14} />}
                                />
                            </>
                        )}
                        {!isPending && (
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-medium text-[var(--ui-text)] hover:bg-[var(--ui-surface-hover,#f3f4f6)] rounded-lg border border-[var(--ui-border,#d1d5db)]"
                            >
                                Close
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StockAdjustmentDetailsModal;
