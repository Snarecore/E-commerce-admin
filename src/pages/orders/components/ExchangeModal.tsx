import React, { useState, useEffect } from "react";
import { IoCloseOutline } from "react-icons/io5";
import { FiRepeat, FiAlertCircle, FiCheckCircle } from "react-icons/fi";
import Button from "../../../components/buttons/ButtonStyleOne";
import { useAPI } from "../../../hooks/useApi";
import apiConfig from "../../../config/api.json";
import toast from "react-hot-toast";

interface ExchangeModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: any;
    item: any; // OrderSummary
    onSuccess: () => void;
}

const EXCHANGE_REASONS = [
    "Customer requested size change",
    "Size too small / tight",
    "Size too large / loose",
    "Wrong size delivered",
    "Customer fitting preference",
    "Other"
];

const ExchangeModal: React.FC<ExchangeModalProps> = ({
    isOpen,
    onClose,
    order,
    item,
    onSuccess
}) => {
    const { handleApiMutation, postMutation, fetchData } = useAPI();

    const currentSize = item?.selectedSize || item?.size || "";
    const [availableSizes, setAvailableSizes] = useState<Record<string, number>>({});
    const [isLoadingStock, setIsLoadingStock] = useState(false);
    const [newSize, setNewSize] = useState<string>("");
    const [quantity, setQuantity] = useState<number>(1);
    const [reason, setReason] = useState<string>(EXCHANGE_REASONS[0]);
    const [notes, setNotes] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!isOpen || !item?.productId) return;

        setQuantity(1);
        setReason(EXCHANGE_REASONS[0]);
        setNotes("");
        setNewSize("");

        const loadAvailability = async () => {
            setIsLoadingStock(true);
            try {
                const res = await fetchData({
                    apiUrl: `${apiConfig.inventory.availabilityUrl}/${item.productId}`
                });
                if (res && res.sizeStock && typeof res.sizeStock === "object") {
                    setAvailableSizes(res.sizeStock);
                } else {
                    setAvailableSizes({});
                }
            } catch (err) {
                console.error("Failed to fetch product sizes:", err);
            } finally {
                setIsLoadingStock(false);
            }
        };

        loadAvailability();
    }, [isOpen, item]);

    if (!isOpen || !item) return null;

    const availableEntries = Object.entries(availableSizes);
    const selectedNewStock = newSize ? (availableSizes[newSize] ?? 0) : 0;
    const isTargetOutOfStock = newSize !== "" && selectedNewStock < quantity;

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        if (!newSize) {
            toast.error("Please select a target size for exchange.");
            return;
        }

        if (newSize.trim().toLowerCase() === currentSize.trim().toLowerCase()) {
            toast.error("Target size cannot be the same as current size.");
            return;
        }

        if (selectedNewStock < quantity) {
            toast.error(`Target size "${newSize}" does not have enough stock (Available: ${selectedNewStock}).`);
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                orderId: order.orderId || order.id,
                productId: item.productId,
                orderSummaryId: item.id,
                oldSize: currentSize,
                newSize,
                quantity: Number(quantity),
                reason,
                note: notes.trim() || undefined
            };

            const result = await handleApiMutation({
                mutation: postMutation,
                url: apiConfig.inventory.executeExchangeUrl,
                body: payload,
                invalidateQueryKey: ["orders", "inventory-availability", "stock-movements"],
                showSuccessMessage: true,
                showErrorMessage: true,
                requiredFields: []
            });

            if (result?.success) {
                toast.success(`Exchanged ${quantity}x to size "${newSize}" successfully!`);
                onSuccess();
                onClose();
            }
        } catch (err: any) {
            console.error("Exchange submission failed:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full flex flex-col overflow-hidden border border-gray-100 max-h-[90vh]">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-amber-50/60">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                            <FiRepeat className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-800">Size / Variant Exchange</h2>
                            <p className="text-xs text-gray-500">
                                Order #{order.orderId} • Atomic inventory swap & ledger tracking
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-700 p-1.5 rounded-lg hover:bg-white transition"
                    >
                        <IoCloseOutline className="w-6 h-6" />
                    </button>
                </div>

                {/* 1-Time Order Policy Alert */}
                <div className="p-3 bg-amber-50 border-b border-amber-200 flex items-start gap-2.5 text-xs text-amber-900">
                    <FiAlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <p className="leading-relaxed">
                        <strong>Store Policy (1-Time Exchange):</strong> An order is strictly limited to <strong>1 exchange in total</strong> regardless of how many items the order contains. Once confirmed, further exchanges on this order will be permanently locked.
                    </p>
                </div>

                {/* Body */}
                <div className="p-6 space-y-5 overflow-y-auto">
                    {/* Item Card */}
                    <div className="flex items-center gap-3.5 p-3.5 bg-gray-50 rounded-xl border border-gray-200">
                        {item.productImage ? (
                            <img
                                src={item.productImage}
                                alt={item.productName}
                                className="w-14 h-14 object-cover rounded-lg border border-gray-200 shrink-0"
                            />
                        ) : (
                            <div className="w-14 h-14 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-xs shrink-0">
                                No Img
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-800 text-sm truncate">{item.productName}</h4>
                            <div className="flex items-center gap-2 text-xs text-gray-600 mt-1 flex-wrap">
                                <span className="bg-white px-2 py-0.5 rounded border border-gray-200">
                                    Current Size: <strong className="text-amber-700 font-bold">{currentSize || "N/A"}</strong>
                                </span>
                                <span className="bg-white px-2 py-0.5 rounded border border-gray-200">
                                    Ordered Qty: <strong>{item.quantity}</strong>
                                </span>
                                <span className="bg-white px-2 py-0.5 rounded border border-gray-200 font-medium">
                                    ৳{Number(item.price).toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Store 1-Time Exchange Policy Alert */}
                    <div className="bg-amber-50/90 border border-amber-200 text-amber-900 text-xs rounded-xl p-3 flex items-start gap-2.5">
                        <FiAlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                        <div>
                            <span className="font-bold">Store 1-Time Exchange Policy:</span> Items can only be exchanged <strong>once</strong>. After confirming, this item will be permanently marked as exchanged to prevent shipping loss and policy abuse.
                        </div>
                    </div>

                    {/* Target Size Selector */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1.5">
                            Select New Size to Exchange For <span className="text-red-500">*</span>
                        </label>
                        {isLoadingStock ? (
                            <div className="py-4 text-center text-xs text-gray-400 animate-pulse">
                                Loading size stock...
                            </div>
                        ) : availableEntries.length > 0 ? (
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                {availableEntries.map(([sizeKey, stockCount]) => {
                                    const isCurrent = sizeKey.trim().toLowerCase() === currentSize.trim().toLowerCase();
                                    const isSelected = newSize === sizeKey;
                                    const isOOS = Number(stockCount) <= 0;

                                    return (
                                        <button
                                            key={sizeKey}
                                            type="button"
                                            disabled={isCurrent || isOOS}
                                            onClick={() => setNewSize(sizeKey)}
                                            className={`p-2.5 rounded-xl border text-left transition relative flex flex-col justify-between cursor-pointer ${
                                                isCurrent
                                                    ? "bg-gray-100 border-gray-200 opacity-60 cursor-not-allowed"
                                                    : isOOS
                                                    ? "bg-gray-50 border-gray-200 opacity-50 cursor-not-allowed"
                                                    : isSelected
                                                    ? "bg-amber-50 border-amber-500 ring-2 ring-amber-400"
                                                    : "bg-white border-gray-200 hover:border-amber-300 hover:bg-amber-50/30"
                                            }`}
                                        >
                                            <span className="font-bold text-sm text-gray-800">{sizeKey}</span>
                                            <span
                                                className={`text-[11px] font-medium mt-1 ${
                                                    isCurrent
                                                        ? "text-gray-500"
                                                        : isOOS
                                                        ? "text-red-500"
                                                        : "text-emerald-600"
                                                }`}
                                            >
                                                {isCurrent ? "Current" : isOOS ? "0 in stock" : `${stockCount} left`}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 text-xs rounded-lg">
                                No alternative sizes found for this product.
                            </div>
                        )}

                        {isTargetOutOfStock && (
                            <div className="mt-2 flex items-center gap-1.5 text-xs text-red-600">
                                <FiAlertCircle className="w-4 h-4 shrink-0" />
                                <span>Insufficient stock for size {newSize} (only {selectedNewStock} available).</span>
                            </div>
                        )}
                    </div>

                    {/* Quantity to Exchange */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">
                                Exchange Quantity <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                min={1}
                                max={item.quantity || 1}
                                value={quantity}
                                onChange={(e) => {
                                    const val = Math.max(1, Math.min(item.quantity || 1, Number(e.target.value) || 1));
                                    setQuantity(val);
                                }}
                                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm bg-white focus:ring-2 focus:ring-amber-400 outline-none"
                            />
                            <p className="text-[11px] text-gray-400 mt-0.5">Max: {item.quantity}</p>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">
                                Exchange Reason <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm bg-white focus:ring-2 focus:ring-amber-400 outline-none"
                            >
                                {EXCHANGE_REASONS.map((r) => (
                                    <option key={r} value={r}>
                                        {r}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Note */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                            Internal Note / Customer Remarks
                        </label>
                        <textarea
                            rows={2}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="e.g., Customer called requesting larger size before courier dispatch"
                            className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-amber-400 outline-none resize-none"
                        />
                    </div>

                    {/* Swap Preview summary */}
                    {newSize && !isTargetOutOfStock && (
                        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex flex-col gap-1.5 text-xs text-amber-900">
                            <div className="flex items-center gap-2">
                                <FiCheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                                <span>
                                    Will return <strong>{quantity}x [{currentSize}]</strong> to stock and dispatch{" "}
                                    <strong>{quantity}x [{newSize}]</strong>.
                                </span>
                            </div>
                            {item.quantity > quantity && (
                                <p className="text-[11px] text-amber-800 ml-6 bg-amber-100/60 p-1.5 rounded border border-amber-200">
                                    💡 <strong>Partial Exchange:</strong> {quantity} of {item.quantity} pieces will be swapped to [{newSize}]. The remaining {item.quantity - quantity} piece(s) will remain in [{currentSize}] in this order.
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-100 font-medium transition cursor-pointer"
                    >
                        Cancel
                    </button>
                    <Button
                        label={isSubmitting ? "Executing..." : "Confirm Exchange"}
                        onClick={() => handleSubmit()}
                        disabled={isSubmitting || !newSize || isTargetOutOfStock}
                        buttonClass="bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm px-5 py-2 rounded-lg cursor-pointer transition disabled:opacity-50"
                    />
                </div>
            </div>
        </div>
    );
};

export default ExchangeModal;
