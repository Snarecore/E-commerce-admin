import React, { useState, useEffect } from "react";
import { FiAlertTriangle, FiAlertOctagon, FiPackage, FiDollarSign, FiSearch, FiRefreshCw, FiPlusCircle } from "react-icons/fi";
import PageHeader from "../../../components/cards/PageHeader";
import { useAPI } from "../../../hooks/useApi";
import apiConfig from "../../../config/api.json";
import QuickAdjustModal from "../products/components/QuickAdjustModal";

interface AnalyticsSummary {
    totalProducts: number;
    totalStockOnHand: number;
    totalCostValue: number;
    totalRetailValue: number;
    potentialGrossProfit: number;
    lowStockCount: number;
    outOfStockCount: number;
    totalMovementsLast30Days: number;
}

const LowStockAlertsPage: React.FC = () => {
    const { fetchData } = useAPI();

    const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
    const [isLoadingSummary, setIsLoadingSummary] = useState(false);

    const [products, setProducts] = useState<any[]>([]);
    const [isLoadingProducts, setIsLoadingProducts] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    const [searchTerm, setSearchTerm] = useState("");
    const [filterMode, setFilterMode] = useState<"ALL" | "OUT_OF_STOCK" | "LOW_STOCK">("ALL");

    // Modal state for quick restock
    const [adjustingProduct, setAdjustingProduct] = useState<any | null>(null);

    const loadSummary = async () => {
        setIsLoadingSummary(true);
        try {
            const res = await fetchData({ apiUrl: apiConfig.inventory.inventoryAnalyticsUrl });
            if (res) setSummary(res);
        } catch (err) {
            console.error("Failed to load inventory summary:", err);
        } finally {
            setIsLoadingSummary(false);
        }
    };

    const loadAlerts = async () => {
        setIsLoadingProducts(true);
        try {
            let url = `${apiConfig.inventory.lowStockAlertsUrl}?page=${page}&limit=15`;
            if (searchTerm.trim()) url += `&search=${encodeURIComponent(searchTerm.trim())}`;
            if (filterMode === "OUT_OF_STOCK") url += `&outOfStockOnly=true`;

            const res = await fetchData({ apiUrl: url });
            if (res) {
                setProducts(res.data || []);
                setTotalItems(res.total || 0);
                setTotalPages(res.pageCount || 1);
            }
        } catch (err) {
            console.error("Failed to load low stock alerts:", err);
        } finally {
            setIsLoadingProducts(false);
        }
    };

    useEffect(() => {
        loadSummary();
    }, []);

    useEffect(() => {
        loadAlerts();
    }, [page, filterMode]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        loadAlerts();
    };

    const handleRefresh = () => {
        loadSummary();
        loadAlerts();
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <PageHeader
                    headerTitle="Low Stock Alerts & Inventory Health"
                    headerDescription="Monitor depleted inventory, threshold breaches, and quickly restock safety stocks"
                />
                <button
                    onClick={handleRefresh}
                    className="flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-xs font-semibold rounded-lg shadow-2xs transition cursor-pointer"
                >
                    <FiRefreshCw className={`w-3.5 h-3.5 ${isLoadingSummary || isLoadingProducts ? "animate-spin" : ""}`} />
                    Refresh Stats
                </button>
            </div>

            {/* KPI Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Total On Hand Stock */}
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl shrink-0">
                        <FiPackage />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-gray-500">Total Units On-Hand</p>
                        <h3 className="text-2xl font-bold text-gray-800 mt-0.5">
                            {isLoadingSummary ? "..." : (summary?.totalStockOnHand ?? 0).toLocaleString()}
                        </h3>
                        <p className="text-[11px] text-gray-400 mt-0.5">Across {summary?.totalProducts ?? 0} SKUs</p>
                    </div>
                </div>

                {/* 2. Total Cost Valuation */}
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl shrink-0">
                        <FiDollarSign />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-gray-500">Inventory Asset (Cost)</p>
                        <h3 className="text-2xl font-bold text-gray-800 mt-0.5">
                            ৳{isLoadingSummary ? "..." : (summary?.totalCostValue ?? 0).toLocaleString()}
                        </h3>
                        <p className="text-[11px] text-emerald-600 font-medium mt-0.5">
                            Retail: ৳{(summary?.totalRetailValue ?? 0).toLocaleString()}
                        </p>
                    </div>
                </div>

                {/* 3. Low Stock Items */}
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl shrink-0">
                        <FiAlertTriangle />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-gray-500">Low Stock Warnings</p>
                        <h3 className="text-2xl font-bold text-amber-600 mt-0.5">
                            {isLoadingSummary ? "..." : summary?.lowStockCount ?? 0}
                        </h3>
                        <p className="text-[11px] text-amber-700 mt-0.5">≤ Safety threshold</p>
                    </div>
                </div>

                {/* 4. Out of Stock Items */}
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center text-xl shrink-0">
                        <FiAlertOctagon />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-gray-500">Out of Stock (Zero Units)</p>
                        <h3 className="text-2xl font-bold text-red-600 mt-0.5">
                            {isLoadingSummary ? "..." : summary?.outOfStockCount ?? 0}
                        </h3>
                        <p className="text-[11px] text-red-700 mt-0.5">Immediate Restock Required</p>
                    </div>
                </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 flex flex-wrap items-center justify-between gap-4">
                {/* Tabs */}
                <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-lg">
                    <button
                        type="button"
                        onClick={() => { setFilterMode("ALL"); setPage(1); }}
                        className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition cursor-pointer ${
                            filterMode === "ALL"
                                ? "bg-white text-gray-800 shadow-xs"
                                : "text-gray-500 hover:text-gray-800"
                        }`}
                    >
                        All Alerts ({totalItems})
                    </button>
                    <button
                        type="button"
                        onClick={() => { setFilterMode("OUT_OF_STOCK"); setPage(1); }}
                        className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                            filterMode === "OUT_OF_STOCK"
                                ? "bg-red-50 text-red-700 shadow-xs border border-red-200"
                                : "text-gray-500 hover:text-red-600"
                        }`}
                    >
                        <span className="w-2 h-2 rounded-full bg-red-500"></span>
                        Out of Stock
                    </button>
                </div>

                {/* Search */}
                <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
                    <div className="relative">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search by product name or SKU..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg w-64 focus:bg-white focus:ring-2 focus:ring-orange-400 outline-none"
                        />
                    </div>
                    <button
                        type="submit"
                        className="px-3 py-1.5 bg-gray-800 hover:bg-gray-900 text-white text-xs font-semibold rounded-lg transition cursor-pointer"
                    >
                        Filter
                    </button>
                </form>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold uppercase tracking-wider">
                                <th className="px-3.5 py-2.5">Product</th>
                                <th className="px-3 py-2.5">Category</th>
                                <th className="px-3 py-2.5 text-center">Alert Limit</th>
                                <th className="px-3 py-2.5 text-center">Current Stock</th>
                                <th className="px-3 py-2.5">Size Stock Breakdown</th>
                                <th className="px-3 py-2.5 text-right">Unit Cost / Price</th>
                                <th className="px-3.5 py-2.5 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoadingProducts ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                                        <div className="flex items-center justify-center gap-2">
                                            <FiRefreshCw className="w-4 h-4 animate-spin text-orange-500" />
                                            <span>Loading low stock alerts...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : products.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-8 text-center text-gray-400 italic">
                                        🎉 No low stock or depleted items found. Inventory is healthy!
                                    </td>
                                </tr>
                            ) : (
                                products.map((item) => {
                                    const onHand = Number(item.quantity) || 0;
                                    const threshold = Number(item.quantityAlert) || 5;
                                    const isOOS = onHand === 0;

                                    const sizeEntries =
                                        item.sizeStock && typeof item.sizeStock === "object"
                                            ? Object.entries(item.sizeStock)
                                            : [];

                                    return (
                                        <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                                            {/* Product Info */}
                                            <td className="px-3.5 py-2.5">
                                                <div className="flex items-center gap-2.5">
                                                    {item.featuredImage ? (
                                                        <img
                                                            src={item.featuredImage}
                                                            alt={item.name}
                                                            className="w-9 h-9 object-cover rounded-lg border border-gray-200 shrink-0"
                                                        />
                                                    ) : (
                                                        <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 shrink-0 text-[10px]">
                                                            No Img
                                                        </div>
                                                    )}
                                                    <div className="min-w-0">
                                                        <span className="font-bold text-gray-800 block truncate max-w-xs text-xs">
                                                            {item.name}
                                                        </span>
                                                        <span className="text-[11px] text-gray-400 font-mono">
                                                            SKU: {item.sku || "N/A"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Category */}
                                            <td className="px-3 py-2.5 text-gray-600">
                                                <span>{item.mainCategoryName || "General"}</span>
                                            </td>

                                            {/* Alert Limit */}
                                            <td className="px-3 py-2.5 text-center text-gray-500 font-medium">
                                                ≤ {threshold} pcs
                                            </td>

                                            {/* Current Stock */}
                                            <td className="px-3 py-2.5 text-center">
                                                <span
                                                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                                                        isOOS
                                                            ? "bg-red-100 text-red-700 border border-red-200 animate-pulse"
                                                            : "bg-amber-100 text-amber-800 border border-amber-200"
                                                    }`}
                                                >
                                                    {isOOS ? "0 OUT OF STOCK" : `${onHand} left`}
                                                </span>
                                            </td>

                                            {/* Size Stock Breakdown */}
                                            <td className="px-3 py-2.5">
                                                {sizeEntries.length > 0 ? (
                                                    <div className="flex flex-wrap gap-1 max-w-xs">
                                                        {sizeEntries.map(([size, count]) => {
                                                            const numCount = Number(count) || 0;
                                                            return (
                                                                <span
                                                                    key={size}
                                                                    className={`px-1.5 py-0.5 rounded text-[11px] font-mono border ${
                                                                        numCount === 0
                                                                            ? "bg-red-50 text-red-600 border-red-200 font-bold"
                                                                            : numCount <= 2
                                                                            ? "bg-amber-50 text-amber-700 border-amber-200"
                                                                            : "bg-gray-100 text-gray-700 border-gray-200"
                                                                    }`}
                                                                >
                                                                    {size}: {numCount}
                                                                </span>
                                                            );
                                                        })}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 italic text-[11px]">No variants</span>
                                                )}
                                            </td>

                                            {/* Valuation */}
                                            <td className="px-3 py-2.5 text-right">
                                                <div className="font-semibold text-gray-800">
                                                    ৳{Number(item.price || 0).toFixed(2)}
                                                </div>
                                                <div className="text-[11px] text-gray-400">
                                                    Cost: ৳{Number(item.cost || 0).toFixed(2)}
                                                </div>
                                            </td>

                                            {/* Action: Quick Adjust */}
                                            <td className="px-3.5 py-2.5 text-center">
                                                <button
                                                    onClick={() => setAdjustingProduct(item)}
                                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 rounded-lg text-xs font-bold transition cursor-pointer"
                                                    title="Quickly restock or adjust stock"
                                                >
                                                    <FiPlusCircle className="w-3.5 h-3.5 text-orange-600" />
                                                    Quick Restock
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-5 py-3.5 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs text-gray-600">
                        <span>Page {page} of {totalPages} ({totalItems} alerts)</span>
                        <div className="flex gap-2">
                            <button
                                disabled={page <= 1}
                                onClick={() => setPage(p => p - 1)}
                                className="px-3 py-1 bg-white border border-gray-200 rounded hover:bg-gray-100 disabled:opacity-40 cursor-pointer"
                            >
                                Previous
                            </button>
                            <button
                                disabled={page >= totalPages}
                                onClick={() => setPage(p => p + 1)}
                                className="px-3 py-1 bg-white border border-gray-200 rounded hover:bg-gray-100 disabled:opacity-40 cursor-pointer"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Quick Adjust Modal */}
            {adjustingProduct && (
                <QuickAdjustModal
                    isOpen={!!adjustingProduct}
                    onClose={() => setAdjustingProduct(null)}
                    product={adjustingProduct}
                    onSuccess={() => {
                        setAdjustingProduct(null);
                        loadAlerts();
                        loadSummary();
                    }}
                />
            )}
        </div>
    );
};

export default LowStockAlertsPage;
