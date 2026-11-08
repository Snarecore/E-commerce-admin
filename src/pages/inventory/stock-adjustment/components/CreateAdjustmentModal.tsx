import React, { useState, useEffect } from "react";
import { IoCloseOutline } from "react-icons/io5";
import { FiSearch, FiCalendar, FiPlus, FiMinus, FiRefreshCw } from "react-icons/fi";
import Button from "../../../../components/buttons/ButtonStyleOne";
import { useAPI } from "../../../../hooks/useApi";
import apiConfig from "../../../../config/api.json";
import { AdjustmentMode, AdjustmentReason } from "../../../../types/stock-movement";
import toast from "react-hot-toast";

interface CreateAdjustmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

interface ProductAdjustmentRow {
    product: any;
    productId: string;
    productName: string;
    sku: string;
    selectedSize: string;
    currentStock: number;
    unitCost: number;
    type: "IN" | "OUT";
    qty: number;
}

const CreateAdjustmentModal: React.FC<CreateAdjustmentModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const { fetchData, handleApiMutation, postMutation } = useAPI();

    const [products, setProducts] = useState<any[]>([]);
    const [isLoadingProducts, setIsLoadingProducts] = useState(false);
    const [searchFilter, setSearchFilter] = useState("");
    const [reason, setReason] = useState<AdjustmentReason>(AdjustmentReason.AUDIT_DEFICIT);
    const [notes, setNotes] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Map of productId (or productId_size) to adjustment details
    const [adjustments, setAdjustments] = useState<Record<string, ProductAdjustmentRow>>({});
    const [selectedProductSizes, setSelectedProductSizes] = useState<Record<string, string>>({});

    const todayDate = new Date().toISOString().split("T")[0];

    // Auto-fetch all current inventory products immediately on drawer open
    useEffect(() => {
        if (!isOpen) return;

        const loadCurrentProducts = async () => {
            setIsLoadingProducts(true);
            try {
                // Fetch up to 100 products initially
                const res = await fetchData({
                    apiUrl: `${apiConfig.inventory.productListUrl}?limit=100&sortBy=createdAt&sortOrder=DESC`
                });
                const list = res?.data?.data || res?.data || res?.orderList || (Array.isArray(res) ? res : []);
                setProducts(Array.isArray(list) ? list : []);
            } catch (err) {
                console.error("Failed to load products for adjustment:", err);
                toast.error("Failed to load current inventory products.");
            } finally {
                setIsLoadingProducts(false);
            }
        };

        setAdjustments({});
        setSelectedProductSizes({});
        setNotes("");
        setSearchFilter("");
        loadCurrentProducts();
    }, [isOpen]);

    if (!isOpen) return null;

    // Filter products locally by searchFilter (matches name or sku)
    const filteredProducts = products.filter((p) => {
        if (!searchFilter.trim()) return true;
        const q = searchFilter.toLowerCase().trim();
        const nameMatch = p.name?.toLowerCase().includes(q);
        const skuMatch = p.sku?.toLowerCase().includes(q);
        return nameMatch || skuMatch;
    });

    const getAdjustmentKey = (productId: string, size?: string) => {
        return size ? `${productId}_${size}` : productId;
    };

    const handleToggleType = (product: any, size: string, newType: "IN" | "OUT") => {
        const key = getAdjustmentKey(product.id, size);
        setAdjustments((prev) => {
            const existing = prev[key] || {
                product,
                productId: product.id,
                productName: product.name,
                sku: product.sku || "",
                selectedSize: size,
                currentStock: Number(product.quantity) || 0,
                unitCost: Number(product.cost) || Number(product.price) || 0,
                type: "IN",
                qty: 0
            };
            return {
                ...prev,
                [key]: {
                    ...existing,
                    type: newType
                }
            };
        });
    };

    const handleQtyChange = (product: any, size: string, newQty: number) => {
        const key = getAdjustmentKey(product.id, size);
        const safeQty = Math.max(0, newQty);

        setAdjustments((prev) => {
            const existing = prev[key] || {
                product,
                productId: product.id,
                productName: product.name,
                sku: product.sku || "",
                selectedSize: size,
                currentStock: Number(product.quantity) || 0,
                unitCost: Number(product.cost) || Number(product.price) || 0,
                type: "OUT",
                qty: 0
            };

            if (safeQty === 0) {
                const next = { ...prev };
                delete next[key];
                return next;
            }

            return {
                ...prev,
                [key]: {
                    ...existing,
                    qty: safeQty
                }
            };
        });
    };

    const adjustedItemsList = Object.values(adjustments).filter((a) => a.qty > 0);
    const adjustedCount = adjustedItemsList.length;

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        if (adjustedCount === 0) {
            toast.error("Please adjust quantity for at least one product.");
            return;
        }

        setIsSubmitting(true);
        try {
            // Determine primary mode
            const allIn = adjustedItemsList.every((it) => it.type === "IN");
            const allOut = adjustedItemsList.every((it) => it.type === "OUT");
            const mode = allIn ? AdjustmentMode.ADDITION : allOut ? AdjustmentMode.SUBTRACTION : AdjustmentMode.ADDITION;

            const payload = {
                reason,
                mode,
                notes: notes.trim() || undefined,
                instantExecution: true,
                items: adjustedItemsList.map((it) => ({
                    productId: it.productId || it.product.id,
                    productName: it.productName || it.product.name,
                    sku: it.sku || it.product.sku || "",
                    size: it.selectedSize || undefined,
                    quantity: it.qty,
                    type: it.type,
                    unitCost: it.unitCost || Number(it.product.cost) || Number(it.product.price) || 0
                }))
            };

            const res = await handleApiMutation({
                mutation: postMutation,
                url: apiConfig.inventory.adjustmentsUrl,
                body: payload,
                invalidateQueryKey: ["stock-adjustments", "products", "stock-movements", "inventory-availability"],
                showSuccessMessage: true,
                showErrorMessage: true,
                requiredFields: []
            });

            if (res?.success) {
                toast.success(`Successfully saved adjustment for ${adjustedCount} products!`);
                onSuccess();
                onClose();
            }
        } catch (err: any) {
            console.error("Adjustment submission error:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
                onClick={onClose}
            />

            {/* Sliding Drawer Container */}
            <div className="fixed inset-y-0 right-0 max-w-lg w-full bg-white shadow-2xl flex flex-col z-50">
                {/* Header */}
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
                    <div>
                        <h2 className="text-base font-bold text-gray-800">Stock Adjustment</h2>
                        <p className="text-xs text-gray-400">
                            Pre-fetched current inventory • Quick batch stock audit
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-7 h-7 rounded-full bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center transition cursor-pointer"
                        title="Close"
                    >
                        <IoCloseOutline className="w-5 h-5" />
                    </button>
                </div>

                {/* Top Controls: Search & Date */}
                <div className="p-4 border-b border-gray-100 bg-gray-50/70 space-y-2.5 shrink-0">
                    <div className="flex items-center gap-2">
                        {/* Search Input */}
                        <div className="relative flex-1">
                            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchFilter}
                                onChange={(e) => setSearchFilter(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-400 outline-none"
                            />
                        </div>

                        {/* Date badge */}
                        <div className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs text-gray-600 font-medium shrink-0">
                            <FiCalendar className="w-3.5 h-3.5 text-gray-400" />
                            <span>{todayDate}</span>
                        </div>
                    </div>

                    {/* Reason selector */}
                    <div className="flex items-center gap-2">
                        <label className="text-xs font-semibold text-gray-600 shrink-0">Reason:</label>
                        <select
                            value={reason}
                            onChange={(e) => setReason(e.target.value as AdjustmentReason)}
                            className="flex-1 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-700 outline-none focus:ring-2 focus:ring-orange-400"
                        >
                            <option value={AdjustmentReason.AUDIT_DEFICIT}>Physical Count Variance (Deficit / ঘাটতি)</option>
                            <option value={AdjustmentReason.AUDIT_SURPLUS}>Physical Count Variance (Surplus / বাড়তি)</option>
                            <option value={AdjustmentReason.ADDITION}>New Physical Stock Arrival (নতুন আগমন)</option>
                            <option value={AdjustmentReason.DAMAGED}>Damaged / Defective Write-off (নষ্ট কাপড়)</option>
                            <option value={AdjustmentReason.LOST}>Lost Inventory (হারিয়ে যাওয়া)</option>
                            <option value={AdjustmentReason.THEFT}>Theft / Shrinkage (চুরি/ঘাটতি)</option>
                            <option value={AdjustmentReason.SAMPLE_GIFT}>Showroom Sample / Gift (স্যাম্পল)</option>
                            <option value={AdjustmentReason.OTHER}>Other Manual Adjustment</option>
                        </select>
                    </div>
                </div>

                {/* Body: Auto-Fetched Product List */}
                <div className="flex-1 overflow-y-auto divide-y divide-gray-100 p-2">
                    {isLoadingProducts ? (
                        <div className="py-20 flex flex-col items-center justify-center text-gray-400 gap-2">
                            <FiRefreshCw className="w-6 h-6 animate-spin text-orange-500" />
                            <p className="text-xs">Fetching current inventory products...</p>
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="py-20 text-center text-gray-400 text-xs italic">
                            No matching products found.
                        </div>
                    ) : (
                        filteredProducts.map((p, idx) => {
                            const curStock = Number(p.quantity) || 0;
                            const sizeEntries =
                                p.sizeStock && typeof p.sizeStock === "object"
                                    ? Object.keys(p.sizeStock)
                                    : p.sizesString
                                    ? p.sizesString.split(",").map((s: string) => s.trim()).filter(Boolean)
                                    : [];

                            const defaultSize = sizeEntries.length > 0 ? sizeEntries[0] : "";
                            const activeSize = selectedProductSizes[p.id] !== undefined ? selectedProductSizes[p.id] : defaultSize;
                            const key = getAdjustmentKey(p.id, activeSize);
                            const adj = adjustments[key] || {
                                product: p,
                                productId: p.id,
                                productName: p.name,
                                sku: p.sku || "",
                                selectedSize: activeSize,
                                currentStock: p.sizeStock?.[activeSize] ?? curStock,
                                unitCost: Number(p.cost) || Number(p.price) || 0,
                                type: "IN",
                                qty: 0
                            };

                            const isSelected = adj.qty > 0;
                            const productAdjustments = Object.values(adjustments).filter(
                                (a) => (a.productId === p.id || a.product?.id === p.id) && a.qty > 0
                            );

                            return (
                                <div
                                    key={p.id}
                                    className={`p-3 rounded-xl transition flex items-center justify-between gap-3 ${
                                        isSelected ? "bg-orange-50/40 border border-orange-200" : "hover:bg-gray-50"
                                    }`}
                                >
                                    {/* Product details */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                            <span className="text-xs font-bold text-gray-400">{idx + 1}.</span>
                                            {p.sku && (
                                                <span className="font-mono text-[10px] font-bold text-orange-700 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200">
                                                    {p.sku}
                                                </span>
                                            )}
                                            <span className="text-xs font-bold text-gray-800 truncate max-w-[220px]" title={p.name}>
                                                {p.name}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-500 flex-wrap">
                                            <span className="font-semibold text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded">
                                                Stock: {curStock} PCS
                                            </span>

                                            {/* Size picker if multiple variants exist */}
                                            {sizeEntries.length > 1 && (
                                                <select
                                                    value={activeSize}
                                                    onChange={(e) => {
                                                        const newSz = e.target.value;
                                                        setSelectedProductSizes((prev) => ({
                                                            ...prev,
                                                            [p.id]: newSz
                                                        }));
                                                    }}
                                                    className="bg-white border border-gray-200 rounded px-1.5 py-0.5 text-[10px] font-bold text-gray-700"
                                                >
                                                    {sizeEntries.map((sz: string) => (
                                                        <option key={sz} value={sz}>
                                                            Size {sz} ({p.sizeStock?.[sz] ?? 0} pcs)
                                                        </option>
                                                    ))}
                                                </select>
                                            )}
                                        </div>

                                        {/* Multi-variant active adjustments badges */}
                                        {productAdjustments.length > 0 && (
                                            <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                                                <span className="text-[10px] text-gray-500 font-semibold">Active:</span>
                                                {productAdjustments.map((pa) => (
                                                    <span
                                                        key={pa.selectedSize || "std"}
                                                        className={`text-[10px] px-1.5 py-0.5 rounded font-bold border ${
                                                            pa.type === "IN"
                                                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                                : "bg-rose-50 text-rose-700 border-rose-200"
                                                        }`}
                                                    >
                                                        {pa.selectedSize ? `Size ${pa.selectedSize}` : "Std"}: {pa.type === "IN" ? "+" : "-"}{pa.qty}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Action buttons: IN / OUT and Stepper */}
                                    <div className="flex items-center gap-2 shrink-0">
                                        {/* IN / OUT Toggle */}
                                        <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden text-[11px] font-bold">
                                            <button
                                                type="button"
                                                onClick={() => handleToggleType(p, adj.selectedSize, "IN")}
                                                className={`px-2.5 py-1 transition cursor-pointer ${
                                                    adj.type === "IN"
                                                        ? "bg-emerald-600 text-white"
                                                        : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                                                }`}
                                            >
                                                IN
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleToggleType(p, adj.selectedSize, "OUT")}
                                                className={`px-2.5 py-1 transition cursor-pointer ${
                                                    adj.type === "OUT"
                                                        ? "bg-red-600 text-white"
                                                        : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                                                }`}
                                            >
                                                OUT
                                            </button>
                                        </div>

                                        {/* Stepper [-] [ 0 ] [+] */}
                                        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white">
                                            <button
                                                type="button"
                                                onClick={() => handleQtyChange(p, adj.selectedSize, adj.qty - 1)}
                                                className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition cursor-pointer"
                                            >
                                                <FiMinus className="w-3 h-3" />
                                            </button>
                                            <input
                                                type="number"
                                                min={0}
                                                value={adj.qty}
                                                onChange={(e) =>
                                                    handleQtyChange(p, adj.selectedSize, Number(e.target.value) || 0)
                                                }
                                                className="w-10 text-center text-xs font-bold text-gray-800 outline-none p-0 border-x border-gray-100 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleQtyChange(p, adj.selectedSize, adj.qty + 1)}
                                                className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition cursor-pointer"
                                            >
                                                <FiPlus className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Footer: Remarks, Counter & Save Action */}
                <div className="p-4 border-t border-gray-200 bg-white space-y-3 shrink-0 shadow-lg">
                    {/* Remarks Input */}
                    <div>
                        <label className="block text-[11px] font-bold text-gray-600 mb-1">Remarks / Note</label>
                        <input
                            type="text"
                            placeholder="Remarks / Note (মন্তব্য লিখুন)..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-orange-400 outline-none"
                        />
                    </div>

                    {/* Bottom Status & Buttons */}
                    <div className="flex items-center justify-between pt-1">
                        <span
                            className={`text-xs ${
                                adjustedCount === 0 ? "text-gray-400 italic" : "text-emerald-700 font-bold"
                            }`}
                        >
                            {adjustedCount === 0 ? "No products adjusted yet" : `${adjustedCount} product(s) marked for adjustment`}
                        </span>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isSubmitting}
                                className="px-3.5 py-1.5 border border-gray-300 text-gray-700 hover:bg-gray-100 rounded-lg text-xs font-semibold transition cursor-pointer"
                            >
                                Cancel
                            </button>
                            <Button
                                label={isSubmitting ? "Saving..." : "Save Adjustment"}
                                onClick={() => handleSubmit()}
                                disabled={adjustedCount === 0 || isSubmitting}
                                buttonClass="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-lg cursor-pointer transition disabled:opacity-50"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateAdjustmentModal;
