import React, { useState } from "react";
import { IoCloseOutline } from "react-icons/io5";
import Button from "../../../../components/buttons/ButtonStyleOne";
import { useAPI } from "../../../../hooks/useApi";
import apiConfig from "../../../../config/api.json";
import { StockMovementType, StockReferenceType } from "../../../../types/stock-movement";
import toast from "react-hot-toast";

interface QuickAdjustModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: any;
    onSuccess: () => void;
}

const QuickAdjustModal: React.FC<QuickAdjustModalProps> = ({ isOpen, onClose, product, onSuccess }) => {
    const { handleApiMutation, postMutation } = useAPI();

    let sizes: string[] = [];
    if (product?.sizeStock && typeof product.sizeStock === "object") {
        sizes = Object.keys(product.sizeStock);
    } else if (product?.sizesString) {
        sizes = product.sizesString.split(",").map((s: string) => s.trim()).filter(Boolean);
    }

    const [selectedSize, setSelectedSize] = useState<string>(sizes.length > 0 ? sizes[0] : "");
    const [actionType, setActionType] = useState<"DECREASE" | "INCREASE">("DECREASE");
    const [quantity, setQuantity] = useState<number>(1);
    const [movementType, setMovementType] = useState<StockMovementType>(StockMovementType.ADJUSTMENT_DAMAGE);
    const [reason, setReason] = useState<string>("Defective item removed from rack");
    const [notes, setNotes] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen || !product) return null;

    let currentVariantStock = Number(product.quantity) || 0;
    if (selectedSize && product.sizeStock && product.sizeStock[selectedSize] !== undefined) {
        currentVariantStock = Number(product.sizeStock[selectedSize]) || 0;
    }

    const calculatedChange = actionType === "DECREASE" ? -Math.abs(quantity) : Math.abs(quantity);
    const projectedStock = currentVariantStock + calculatedChange;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (quantity <= 0) {
            toast.error("Adjustment quantity must be greater than 0");
            return;
        }

        if (projectedStock < 0) {
            toast.error("Stock adjustment cannot result in negative inventory");
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                productId: product.id,
                size: selectedSize || undefined,
                quantityChange: calculatedChange,
                movementType,
                referenceType: StockReferenceType.MANUAL,
                reason: reason.trim() || undefined,
                note: notes.trim() || undefined,
                allowNegativeStock: false
            };

            const res = await handleApiMutation({
                // @ts-ignore
                mutation: postMutation,
                url: apiConfig.inventory.adjustSingleUrl,
                body: payload,
                invalidateQueryKey: ["products", "stock-movements", "inventory-availability", "stock-adjustments"],
                showSuccessMessage: false,
                showErrorMessage: true,
                requiredFields: []
            });

            if (res?.success) {
                toast.success("Stock adjusted and recorded to ledger!");
                onSuccess();
                onClose();
            }
        } catch (err: any) {
            toast.error(err?.message || "Failed to adjust stock");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-[var(--ui-surface,#ffffff)] border border-[var(--ui-border,#e5e7eb)] rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--ui-border,#e5e7eb)]">
                    <div>
                        <h3 className="text-base font-bold text-[var(--ui-text)]">Quick Stock Adjust</h3>
                        <p className="text-xs text-[var(--ui-text-muted)] truncate max-w-xs">{product.name}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-lg hover:bg-[var(--ui-surface-hover,#f3f4f6)] text-[var(--ui-text-muted)] hover:text-[var(--ui-text)]"
                    >
                        <IoCloseOutline size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-5 space-y-3 text-sm">
                    {/* Size Selector (if variants exist) */}
                    {sizes.length > 0 && (
                        <div>
                            <label className="text-xs font-semibold text-[var(--ui-text-muted)] block mb-1">
                                Size Variant
                            </label>
                            <select
                                value={selectedSize}
                                onChange={(e) => setSelectedSize(e.target.value)}
                                className="w-full px-3 py-2 text-xs bg-[var(--ui-surface-sunken,#f9fafb)] border border-[var(--ui-border,#d1d5db)] rounded-lg text-[var(--ui-text)]"
                            >
                                {sizes.map((s) => (
                                    <option key={s} value={s}>
                                        Size {s} (Current: {product.sizeStock?.[s] ?? "N/A"})
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Action & Quantity */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-semibold text-[var(--ui-text-muted)] block mb-1">
                                Action
                            </label>
                            <div className="flex rounded-lg border border-[var(--ui-border,#d1d5db)] overflow-hidden">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setActionType("DECREASE");
                                        setMovementType(StockMovementType.ADJUSTMENT_DAMAGE);
                                    }}
                                    className={`flex-1 py-1.5 text-xs font-semibold transition-colors ${
                                        actionType === "DECREASE"
                                            ? "bg-rose-600 text-white"
                                            : "bg-[var(--ui-surface-sunken,#f9fafb)] text-[var(--ui-text)]"
                                    }`}
                                >
                                    - Reduce
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setActionType("INCREASE");
                                        setMovementType(StockMovementType.ADJUSTMENT_ADDITION);
                                    }}
                                    className={`flex-1 py-1.5 text-xs font-semibold transition-colors ${
                                        actionType === "INCREASE"
                                            ? "bg-emerald-600 text-white"
                                            : "bg-[var(--ui-surface-sunken,#f9fafb)] text-[var(--ui-text)]"
                                    }`}
                                >
                                    + Add
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-[var(--ui-text-muted)] block mb-1">
                                Units
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={quantity}
                                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                className="w-full px-3 py-1.5 text-sm font-semibold bg-[var(--ui-surface-sunken,#f9fafb)] border border-[var(--ui-border,#d1d5db)] rounded-lg text-[var(--ui-text)] text-center"
                            />
                        </div>
                    </div>

                    {/* Stock Preview Pill */}
                    <div className="p-3 bg-[var(--ui-surface-sunken,#f9fafb)] rounded-lg border border-[var(--ui-border,#e5e7eb)] flex items-center justify-between text-xs">
                        <span className="text-[var(--ui-text-muted)]">Stock Impact:</span>
                        <div className="font-mono">
                            <span className="text-[var(--ui-text-muted)]">{currentVariantStock}</span>
                            {" → "}
                            <span className={projectedStock < 0 ? "text-rose-600 font-bold" : "text-emerald-600 font-bold"}>
                                {projectedStock} units
                            </span>
                        </div>
                    </div>

                    {/* Movement Type / Reason */}
                    <div>
                        <label className="text-xs font-semibold text-[var(--ui-text-muted)] block mb-1">
                            Reason Category
                        </label>
                        <select
                            value={movementType}
                            onChange={(e) => setMovementType(e.target.value as StockMovementType)}
                            className="w-full px-3 py-2 text-xs bg-[var(--ui-surface-sunken,#f9fafb)] border border-[var(--ui-border,#d1d5db)] rounded-lg text-[var(--ui-text)]"
                        >
                            {actionType === "DECREASE" ? (
                                <>
                                    <option value={StockMovementType.ADJUSTMENT_DAMAGE}>Damaged / Defective (-)</option>
                                    <option value={StockMovementType.ADJUSTMENT_LOST}>Lost / Missing (-)</option>
                                    <option value={StockMovementType.ADJUSTMENT_THEFT}>Theft / Stolen (-)</option>
                                    <option value={StockMovementType.ADJUSTMENT_SAMPLE}>Sample / Promo Gift (-)</option>
                                    <option value={StockMovementType.ADJUSTMENT_DEFICIT}>Physical Audit Deficit (-)</option>
                                </>
                            ) : (
                                <>
                                    <option value={StockMovementType.ADJUSTMENT_ADDITION}>Found in Stock (+)</option>
                                    <option value={StockMovementType.ADJUSTMENT_SURPLUS}>Physical Audit Surplus (+)</option>
                                    <option value={StockMovementType.MANUAL_CORRECTION}>Manual Correction (+)</option>
                                </>
                            )}
                        </select>
                    </div>

                    {/* Reason Text */}
                    <div>
                        <label className="text-xs font-semibold text-[var(--ui-text-muted)] block mb-1">
                            Specific Reason / Note
                        </label>
                        <input
                            type="text"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Reason for adjustment..."
                            className="w-full px-3 py-2 text-xs bg-[var(--ui-surface-sunken,#f9fafb)] border border-[var(--ui-border,#d1d5db)] rounded-lg text-[var(--ui-text)] mb-2"
                        />
                        <textarea
                            rows={2}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Additional audit notes (optional)..."
                            className="w-full px-3 py-2 text-xs bg-[var(--ui-surface-sunken,#f9fafb)] border border-[var(--ui-border,#d1d5db)] rounded-lg text-[var(--ui-text)]"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--ui-border,#e5e7eb)]">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-3 py-1.5 text-xs font-medium text-[var(--ui-text)] hover:bg-[var(--ui-surface-hover,#f3f4f6)] rounded-lg border border-[var(--ui-border,#d1d5db)]"
                        >
                            Cancel
                        </button>
                        <Button
                            label={isSubmitting ? "Adjusting..." : "Apply Adjustment"}
                            type="submit"
                            disabled={isSubmitting || projectedStock < 0}
                            color="var(--color-primary)"
                            hoverColor="var(--color-primary-hover)"
                        />
                    </div>
                </form>
            </div>
        </div>
    );
};

export default QuickAdjustModal;
