import React, { useEffect, useState } from "react";
import { FiX } from "react-icons/fi";

interface CouponModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (formData: any) => Promise<void>;
    initialData?: any;
    isSubmitting: boolean;
}

const CouponModal: React.FC<CouponModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    initialData,
    isSubmitting,
}) => {
    const [code, setCode] = useState("");
    const [description, setDescription] = useState("");
    const [discountType, setDiscountType] = useState("PERCENTAGE");
    const [discountValue, setDiscountValue] = useState<number | string>(0);
    const [minOrderAmount, setMinOrderAmount] = useState<number | string>(0);
    const [maxDiscountAmount, setMaxDiscountAmount] = useState<number | string>("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [usageLimit, setUsageLimit] = useState<number | string>("");
    const [userUsageLimit, setUserUsageLimit] = useState<number | string>("");
    const [isActive, setIsActive] = useState(true);

    useEffect(() => {
        if (initialData) {
            setCode(initialData.code || "");
            setDescription(initialData.description || "");
            setDiscountType(initialData.discountType || "PERCENTAGE");
            setDiscountValue(initialData.discountValue ?? 0);
            setMinOrderAmount(initialData.minOrderAmount ?? 0);
            setMaxDiscountAmount(initialData.maxDiscountAmount ?? "");
            setStartDate(initialData.startDate ? new Date(initialData.startDate).toISOString().slice(0, 16) : "");
            setEndDate(initialData.endDate ? new Date(initialData.endDate).toISOString().slice(0, 16) : "");
            setUsageLimit(initialData.usageLimit ?? "");
            setUserUsageLimit(initialData.userUsageLimit ?? "");
            setIsActive(initialData.isActive !== undefined ? initialData.isActive : true);
        } else {
            setCode("");
            setDescription("");
            setDiscountType("PERCENTAGE");
            setDiscountValue(0);
            setMinOrderAmount(0);
            setMaxDiscountAmount("");
            setStartDate("");
            setEndDate("");
            setUsageLimit("");
            setUserUsageLimit("");
            setIsActive(true);
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!code.trim()) {
            alert("Coupon Code is required.");
            return;
        }

        const payload: any = {
            code: code.trim().toUpperCase(),
            description: description.trim() || undefined,
            discountType,
            discountValue: Number(discountValue) || 0,
            minOrderAmount: Number(minOrderAmount) || 0,
            maxDiscountAmount: maxDiscountAmount !== "" ? Number(maxDiscountAmount) : undefined,
            startDate: startDate ? new Date(startDate).toISOString() : undefined,
            endDate: endDate ? new Date(endDate).toISOString() : undefined,
            usageLimit: usageLimit !== "" && usageLimit !== null ? Number(usageLimit) : undefined,
            userUsageLimit: userUsageLimit !== "" && userUsageLimit !== null ? Number(userUsageLimit) : undefined,
            isActive,
        };

        await onSubmit(payload);
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                    <h3 className="text-lg font-bold text-gray-800">
                        {initialData ? `Edit Coupon #${initialData.code}` : "Create New Coupon"}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
                    >
                        <FiX className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 text-sm text-left">
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                            Coupon Code <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value.toUpperCase())}
                            placeholder="e.g. EID2026, SAVE20"
                            required
                            className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-orange-400 outline-none font-mono font-bold"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">
                                Discount Type <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={discountType}
                                onChange={(e) => setDiscountType(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-orange-400 outline-none"
                            >
                                <option value="PERCENTAGE">Percentage (%)</option>
                                <option value="FIXED_AMOUNT">Fixed Amount (৳)</option>
                                <option value="FREE_SHIPPING">Free Shipping</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">
                                Discount Value {discountType === "PERCENTAGE" ? "(%)" : "(৳)"}
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                value={discountValue}
                                disabled={discountType === "FREE_SHIPPING"}
                                onChange={(e) => setDiscountValue(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-orange-400 outline-none disabled:opacity-50"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">
                                Min Order Subtotal (৳)
                            </label>
                            <input
                                type="number"
                                value={minOrderAmount}
                                onChange={(e) => setMinOrderAmount(e.target.value)}
                                placeholder="0"
                                className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-orange-400 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">
                                Max Discount Cap (৳)
                            </label>
                            <input
                                type="number"
                                value={maxDiscountAmount}
                                disabled={discountType !== "PERCENTAGE"}
                                onChange={(e) => setMaxDiscountAmount(e.target.value)}
                                placeholder="Optional cap for %"
                                className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-orange-400 outline-none disabled:opacity-50"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">
                                Start Date & Time
                            </label>
                            <input
                                type="datetime-local"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-orange-400 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">
                                Expiration Date & Time
                            </label>
                            <input
                                type="datetime-local"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-orange-400 outline-none"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">
                                Total Global Usage Limit
                            </label>
                            <input
                                type="number"
                                value={usageLimit}
                                onChange={(e) => setUsageLimit(e.target.value)}
                                placeholder="Unlimited if empty"
                                className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-orange-400 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">
                                Per-User Usage Limit
                            </label>
                            <input
                                type="number"
                                value={userUsageLimit}
                                onChange={(e) => setUserUsageLimit(e.target.value)}
                                placeholder="Unlimited if empty"
                                className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-orange-400 outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                            Description / Note
                        </label>
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="e.g. Eid Festival Special 20% Discount"
                            className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-orange-400 outline-none"
                        />
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                        <input
                            type="checkbox"
                            id="isActive"
                            checked={isActive}
                            onChange={(e) => setIsActive(e.target.checked)}
                            className="w-4 h-4 text-orange-500 rounded border-gray-300 focus:ring-orange-400"
                        />
                        <label htmlFor="isActive" className="text-xs font-semibold text-gray-700 cursor-pointer">
                            Active (Available for redemption)
                        </label>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-lg transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-5 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold text-xs rounded-lg transition shadow-md"
                        >
                            {isSubmitting ? "Saving..." : initialData ? "Update Coupon" : "Create Coupon"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CouponModal;
