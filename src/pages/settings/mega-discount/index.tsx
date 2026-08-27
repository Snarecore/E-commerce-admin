import { useEffect, useState } from "react";
import { FiZap, FiAlertTriangle, FiSave, FiTag } from "react-icons/fi";
import { useAPI } from "../../../hooks/useApi";
import apiConfig from "../../../config/api.json";
import PageHeader from "../../../components/cards/PageHeader";
import ToggleButton from "../../../components/Inputs/ToggleButton";
import Loading from "../../../components/loading/Loading";
import { megaDiscountQueryKey } from "../../../config/query-key";

interface MegaDiscountData {
    id?: string;
    isActive: boolean;
    discountPercentage: number;
    menuText: string;
}

const MegaDiscountPage = () => {
    const { fetchData, handleApiMutation, putMutation } = useAPI();
    const apiUrl = apiConfig.setting.megaDiscountUrl;

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState<MegaDiscountData>({
        isActive: false,
        discountPercentage: 20,
        menuText: "Mega Sale"
    });

    const loadMegaDiscount = async () => {
        setIsLoading(true);
        try {
            const res: any = await fetchData({ apiUrl });
            const data = res?.data || res;
            if (data) {
                setFormData({
                    isActive: Boolean(data.isActive),
                    discountPercentage: Number(data.discountPercentage || 0),
                    menuText: data.menuText || "Mega Sale"
                });
            }
        } catch (err) {
            console.error("Failed to fetch Mega Discount settings:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadMegaDiscount();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Client-side UX Validation
        const pct = Number(formData.discountPercentage);
        if (isNaN(pct) || pct < 0 || pct > 100) {
            alert("Discount percentage must be a number between 0 and 100.");
            return;
        }

        if (formData.isActive) {
            if (pct <= 0) {
                alert("Discount percentage must be greater than 0 when Mega Discount is active.");
                return;
            }
            if (!formData.menuText || !formData.menuText.trim()) {
                alert("Navbar Menu Text cannot be empty when Mega Discount is active.");
                return;
            }
        }

        setIsSubmitting(true);
        try {
            const payload = {
                isActive: formData.isActive,
                discountPercentage: pct,
                menuText: formData.menuText.trim()
            };

            const res = await handleApiMutation({
                // @ts-ignore
                mutation: putMutation,
                url: apiUrl,
                body: payload,
                invalidateQueryKey: [megaDiscountQueryKey],
                showSuccessMessage: true,
                showErrorMessage: true,
                requiredFields: []
            });

            if (res?.success || res?.data) {
                loadMegaDiscount();
            }
        } catch (err) {
            console.error("Failed to update Mega Discount settings:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const previewPct = Number(formData.discountPercentage) || 0;
    const samplePrice = 1000;
    const sampleEffectivePrice = formData.isActive && previewPct > 0
        ? Math.round((samplePrice * (1 - previewPct / 100) + Number.EPSILON) * 100) / 100
        : 1000;

    return (
        <div className="flex flex-col gap-6 p-6">
            <PageHeader
                headerTitle="Global Mega Discount"
                headerDescription="Configure storewide promotional percentage discount and custom navbar text for all products."
            />

            {isLoading ? (
                <Loading />
            ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    {/* Status Toggle Card */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className={`p-3.5 rounded-2xl ${formData.isActive ? "bg-orange-50 text-orange-600 border border-orange-200" : "bg-gray-100 text-gray-500"}`}>
                                <FiZap className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="text-base font-bold text-gray-900">Enable Global Mega Discount</h3>
                                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${formData.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                                        {formData.isActive ? "ACTIVE" : "INACTIVE"}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    When turned ON, all products automatically receive the percentage discount storewide.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <span className="text-xs font-semibold text-gray-600">
                                {formData.isActive ? "ON" : "OFF"}
                            </span>
                            <ToggleButton
                                label=""
                                name="mega-discount-active-toggle"
                                checked={formData.isActive}
                                onChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                            />
                        </div>
                    </div>

                    {/* Warning Alert Banner */}
                    {formData.isActive && (
                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 text-amber-800">
                            <FiAlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                            <div className="text-xs leading-relaxed">
                                <p className="font-bold">Warning: Mega Discount is currently Active Storewide</p>
                                <p className="mt-0.5 text-amber-700">
                                    This discount percentage will take precedence over individual product discounts across the entire store. Original base prices in the product database remain unchanged.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Configuration Form Inputs */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col gap-6">
                        <h4 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
                            <FiTag className="w-4 h-4 text-orange-500" />
                            Discount Configuration Parameters
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Input 1: Discount Percentage */}
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-gray-700 flex items-center justify-between">
                                    <span>Discount Percentage (%)</span>
                                    {formData.isActive && (
                                        <span className="text-[11px] font-semibold text-orange-600">
                                            {previewPct > 0 ? `${previewPct}% OFF` : "Required > 0"}
                                        </span>
                                    )}
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="0.01"
                                        disabled={!formData.isActive}
                                        value={formData.discountPercentage}
                                        onChange={(e) => setFormData(prev => ({ ...prev, discountPercentage: parseFloat(e.target.value) || 0 }))}
                                        placeholder="e.g. 20"
                                        className={`w-full text-sm font-semibold px-4 py-3 rounded-xl border transition outline-none ${
                                            !formData.isActive
                                                ? "bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed"
                                                : "bg-white border-gray-300 text-gray-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                                        }`}
                                    />
                                    <span className="absolute right-4 top-3 text-sm font-bold text-gray-400">%</span>
                                </div>
                                <p className="text-[11px] text-gray-400">
                                    Percentage discount automatically applied to all products when active.
                                </p>
                            </div>

                            {/* Input 2: Navbar Menu Text */}
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-gray-700 flex items-center justify-between">
                                    <span>Navbar Menu Bar Text</span>
                                    <span className="text-[11px] font-normal text-gray-400">
                                        {formData.menuText.length}/50 chars
                                    </span>
                                </label>
                                <input
                                    type="text"
                                    maxLength={50}
                                    disabled={!formData.isActive}
                                    value={formData.menuText}
                                    onChange={(e) => setFormData(prev => ({ ...prev, menuText: e.target.value }))}
                                    placeholder="e.g. Mega Sale 20% Off"
                                    className={`w-full text-sm font-semibold px-4 py-3 rounded-xl border transition outline-none ${
                                        !formData.isActive
                                            ? "bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed"
                                            : "bg-white border-gray-300 text-gray-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                                    }`}
                                />
                                <p className="text-[11px] text-gray-400">
                                    Custom menu title displayed in the customer website Navbar when active.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Visual Live Previews */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Preview 1: Navbar Link Preview */}
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col gap-3">
                            <h5 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                                Navbar Menu Preview
                            </h5>
                            <div className="bg-gray-900 text-white rounded-xl p-3.5 flex items-center justify-between text-xs">
                                <div className="flex items-center gap-4 text-gray-300">
                                    <span className="font-semibold text-white">Home</span>
                                    <span>Shop</span>
                                    <span>Categories</span>
                                </div>
                                {formData.isActive ? (
                                    <span className="bg-orange-500 text-white font-bold px-3 py-1 rounded-lg text-xs animate-pulse">
                                        {formData.menuText || "Mega Sale"}
                                    </span>
                                ) : (
                                    <span className="text-gray-500 italic text-[11px]">
                                        (Mega Menu Hidden)
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Preview 2: Pricing Engine Behavior */}
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col gap-3">
                            <h5 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                                Effective Pricing Preview
                            </h5>
                            <div className="bg-gray-50 rounded-xl p-3.5 flex items-center justify-between text-xs">
                                <div>
                                    <p className="text-gray-500 text-[11px]">Sample Base Price</p>
                                    <p className="font-bold text-gray-800">৳{samplePrice.toLocaleString()}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-gray-500 text-[11px]">Mega Discount</p>
                                    <p className={`font-bold ${formData.isActive ? "text-orange-600" : "text-gray-400"}`}>
                                        {formData.isActive ? `${previewPct}%` : "OFF"}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-gray-500 text-[11px]">Calculated Price</p>
                                    <p className="font-bold text-green-600 text-sm">৳{sampleEffectivePrice.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Actions */}
                    <div className="flex items-center justify-end gap-4 pt-2">
                        <button
                            type="button"
                            onClick={loadMegaDiscount}
                            disabled={isSubmitting}
                            className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-semibold text-xs hover:bg-gray-50 transition cursor-pointer disabled:opacity-50"
                        >
                            Reset
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-md transition cursor-pointer disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <span className="flex items-center gap-2">
                                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                    Saving...
                                </span>
                            ) : (
                                <>
                                    <FiSave className="w-4 h-4" />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default MegaDiscountPage;
