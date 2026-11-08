import React, { useState } from "react";
import { IoCloseOutline } from "react-icons/io5";
import { FiCheckCircle, FiAlertTriangle, FiRotateCcw } from "react-icons/fi";
import Button from "../../../components/buttons/ButtonStyleOne";
import { useAPI } from "../../../hooks/useApi";
import apiConfig from "../../../config/api.json";
import toast from "react-hot-toast";

interface ProcessReturnModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: any;
    onSuccess: () => void;
}

interface ReturnItemState {
    productId: string;
    productName: string;
    sku: string;
    size: string;
    orderedQuantity: number;
    returnedQuantity: number;
    condition: "GOOD" | "DAMAGED";
    notes: string;
}

const ProcessReturnModal: React.FC<ProcessReturnModalProps> = ({
    isOpen,
    onClose,
    order,
    onSuccess
}) => {
    const { handleApiMutation, postMutation } = useAPI();

    const rawItems = order?.orderSummaries || order?.items || [];
    const [returnItems, setReturnItems] = useState<ReturnItemState[]>(() =>
        rawItems.map((item: any) => ({
            productId: item.productId || item.product?.id || "",
            productName: item.productName || item.product?.name || "Product",
            sku: item.sku || item.product?.sku || "N/A",
            size: item.size || item.selectedSize || "",
            orderedQuantity: Number(item.quantity) || 1,
            returnedQuantity: 1,
            condition: "GOOD",
            notes: ""
        }))
    );

    const [reason, setReason] = useState<string>("Customer requested return / Size mismatch");
    const [overallNotes, setOverallNotes] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen || !order) return null;

    const handleQtyChange = (index: number, val: number) => {
        setReturnItems((prev) => {
            const next = [...prev];
            const max = next[index].orderedQuantity;
            next[index] = {
                ...next[index],
                returnedQuantity: Math.max(0, Math.min(max, val))
            };
            return next;
        });
    };

    const handleConditionChange = (index: number, condition: "GOOD" | "DAMAGED") => {
        setReturnItems((prev) => {
            const next = [...prev];
            next[index] = { ...next[index], condition };
            return next;
        });
    };

    const handleItemNoteChange = (index: number, notes: string) => {
        setReturnItems((prev) => {
            const next = [...prev];
            next[index] = { ...next[index], notes };
            return next;
        });
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        const activeItems = returnItems.filter((i) => i.returnedQuantity > 0);
        if (activeItems.length === 0) {
            toast.error("Please specify at least one returned item quantity > 0");
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                orderId: order.orderId || order.id,
                reason,
                notes: overallNotes.trim() || undefined,
                items: activeItems.map((it) => ({
                    productId: it.productId,
                    productName: it.productName,
                    sku: it.sku,
                    size: it.size || undefined,
                    returnedQuantity: it.returnedQuantity,
                    condition: it.condition,
                    notes: it.notes || undefined
                }))
            };

            const res = await handleApiMutation({
                // @ts-ignore
                mutation: postMutation,
                url: apiConfig.inventory.processReturnUrl,
                body: payload,
                invalidateQueryKey: ["orders", "products", "stock-movements", "inventory-availability", "stock-adjustments"],
                showSuccessMessage: false,
                showErrorMessage: true,
                requiredFields: []
            });

            if (res?.success) {
                const restoredCount = activeItems.filter((i) => i.condition === "GOOD").length;
                const damagedCount = activeItems.filter((i) => i.condition === "DAMAGED").length;

                toast.success(
                    `Return processed! Restocked: ${restoredCount} items. Quarantined as damaged: ${damagedCount} items.`,
                    { duration: 5000 }
                );

                onSuccess();
                onClose();
            }
        } catch (err: any) {
            toast.error(err?.message || "Failed to process return");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-[var(--ui-surface,#ffffff)] border border-[var(--ui-border,#e5e7eb)] rounded-xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--ui-border,#e5e7eb)]">
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                            <FiRotateCcw size={20} />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-[var(--ui-text)]">
                                Process Customer Return (RMA)
                            </h3>
                            <p className="text-xs text-[var(--ui-text-muted)]">
                                Order #{order.orderId || order.id} • Quality Inspection & Stock Quarantine
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-lg hover:bg-[var(--ui-surface-hover,#f3f4f6)] text-[var(--ui-text-muted)] hover:text-[var(--ui-text)]"
                    >
                        <IoCloseOutline size={22} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-5">
                    {/* Return Reason */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-[var(--ui-text-muted)] uppercase tracking-wider block mb-1">
                                Return Reason
                            </label>
                            <select
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className="w-full px-3 py-2 text-xs bg-[var(--ui-surface-sunken,#f9fafb)] border border-[var(--ui-border,#d1d5db)] rounded-lg text-[var(--ui-text)]"
                            >
                                <option value="Size mismatch / Incorrect fit">Size mismatch / Incorrect fit</option>
                                <option value="Defective stitching / Fabric defect">Defective stitching / Fabric defect</option>
                                <option value="Damaged in courier transit">Damaged in courier transit</option>
                                <option value="Customer changed mind">Customer changed mind</option>
                                <option value="Wrong product delivered">Wrong product delivered</option>
                                <option value="Other return reason">Other return reason</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-[var(--ui-text-muted)] uppercase tracking-wider block mb-1">
                                General Inspection Note
                            </label>
                            <input
                                type="text"
                                value={overallNotes}
                                onChange={(e) => setOverallNotes(e.target.value)}
                                placeholder="Inspection comments, courier parcel tracking ID..."
                                className="w-full px-3 py-2 text-xs bg-[var(--ui-surface-sunken,#f9fafb)] border border-[var(--ui-border,#d1d5db)] rounded-lg text-[var(--ui-text)]"
                            />
                        </div>
                    </div>

                    {/* Inspection Guide Alert */}
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900 flex items-start gap-2">
                        <FiCheckCircle className="mt-0.5 text-blue-600 shrink-0" size={15} />
                        <div>
                            <span className="font-bold">Inspection Policy: </span>
                            Items marked <span className="font-semibold text-emerald-700">"Good Condition"</span> will be restocked to sellable inventory. Items marked <span className="font-semibold text-rose-700">"Damaged"</span> will NOT be restocked; an automatic loss voucher will be posted to Stock Adjustments.
                        </div>
                    </div>

                    {/* Items List */}
                    <div>
                        <h4 className="text-xs font-semibold text-[var(--ui-text-muted)] uppercase tracking-wider mb-2">
                            Inspect Return Items ({returnItems.length})
                        </h4>
                        <div className="border border-[var(--ui-border,#e5e7eb)] rounded-lg overflow-hidden divide-y divide-[var(--ui-border,#e5e7eb)]">
                            {returnItems.map((item, idx) => (
                                <div key={`${item.productId}-${idx}`} className="p-4 bg-[var(--ui-surface,#ffffff)] space-y-3">
                                    <div className="flex items-center justify-between flex-wrap gap-2">
                                        <div>
                                            <p className="font-semibold text-sm text-[var(--ui-text)]">{item.productName}</p>
                                            <p className="text-xs text-[var(--ui-text-muted)]">
                                                SKU: {item.sku} {item.size ? `• Size: ${item.size}` : ""} • Ordered: {item.orderedQuantity}
                                            </p>
                                        </div>

                                        {/* Returned Qty */}
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-[var(--ui-text-muted)]">Returned Qty:</span>
                                            <input
                                                type="number"
                                                min="0"
                                                max={item.orderedQuantity}
                                                value={item.returnedQuantity}
                                                onChange={(e) => handleQtyChange(idx, parseInt(e.target.value) || 0)}
                                                className="w-16 px-2 py-1 text-center bg-[var(--ui-surface-sunken,#f9fafb)] border border-[var(--ui-border,#d1d5db)] rounded font-semibold text-sm text-[var(--ui-text)]"
                                            />
                                        </div>
                                    </div>

                                    {/* Condition Toggles & Notes */}
                                    {item.returnedQuantity > 0 && (
                                        <div className="flex items-center justify-between flex-wrap gap-3 pt-2 border-t border-[var(--ui-border,#f3f4f6)] text-xs">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[var(--ui-text-muted)] font-medium">Physical Condition:</span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleConditionChange(idx, "GOOD")}
                                                    className={`px-3 py-1 rounded-md font-semibold flex items-center gap-1.5 transition-colors ${
                                                        item.condition === "GOOD"
                                                            ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                                            : "bg-[var(--ui-surface-sunken,#f9fafb)] text-[var(--ui-text-muted)] border border-[var(--ui-border,#d1d5db)]"
                                                    }`}
                                                >
                                                    <FiCheckCircle size={13} /> Good (Restock +{item.returnedQuantity})
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleConditionChange(idx, "DAMAGED")}
                                                    className={`px-3 py-1 rounded-md font-semibold flex items-center gap-1.5 transition-colors ${
                                                        item.condition === "DAMAGED"
                                                            ? "bg-rose-100 text-rose-800 border border-rose-300"
                                                            : "bg-[var(--ui-surface-sunken,#f9fafb)] text-[var(--ui-text-muted)] border border-[var(--ui-border,#d1d5db)]"
                                                    }`}
                                                >
                                                    <FiAlertTriangle size={13} /> Damaged (Quarantine Loss)
                                                </button>
                                            </div>

                                            <input
                                                type="text"
                                                value={item.notes}
                                                onChange={(e) => handleItemNoteChange(idx, e.target.value)}
                                                placeholder="Item inspection remarks..."
                                                className="flex-1 min-w-[200px] px-2.5 py-1 text-xs bg-[var(--ui-surface-sunken,#f9fafb)] border border-[var(--ui-border,#d1d5db)] rounded text-[var(--ui-text)]"
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[var(--ui-border,#e5e7eb)] bg-[var(--ui-surface-sunken,#f9fafb)]">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-[var(--ui-text)] hover:bg-[var(--ui-surface-hover,#f3f4f6)] rounded-lg border border-[var(--ui-border,#d1d5db)]"
                    >
                        Cancel
                    </button>
                    <Button
                        label={isSubmitting ? "Processing..." : "Confirm & Apply Return"}
                        onClick={() => handleSubmit()}
                        disabled={isSubmitting}
                        color="var(--color-primary)"
                        hoverColor="var(--color-primary-hover)"
                    />
                </div>
            </div>
        </div>
    );
};

export default ProcessReturnModal;
