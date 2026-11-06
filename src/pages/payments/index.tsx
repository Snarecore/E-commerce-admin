import { useState } from "react";
import { Link } from "react-router-dom";
import {
    FiCreditCard,
    FiCheckCircle,
    FiClock,
    FiAlertTriangle,
    FiXCircle,
    FiSearch,
    FiRefreshCw,
    FiCopy,
    FiCheck,
    FiEye,
    FiShield,
    FiTrendingUp,
    FiExternalLink,
    FiRotateCcw
} from "react-icons/fi";
import { useAPI } from "../../hooks/useApi";
import { paymentQueryKey } from "../../config/query-key";
import { format } from "date-fns";

export default function PaymentsPage() {
    const { usePaginatedQuery, postMutation, handleApiMutation } = useAPI();

    const [activeTab, setActiveTab] = useState<string>("ALL");
    const [page, setPage] = useState<number>(1);
    const [search, setSearch] = useState<string>("");
    const [selectedGateway, setSelectedGateway] = useState<string>("ALL");
    const [selectedMethod, setSelectedMethod] = useState<string>("ALL");

    // Copy feedback state
    const [copiedId, setCopiedId] = useState<string | null>(null);

    // Modal details state
    const [activePayment, setActivePayment] = useState<any | null>(null);
    const [reviewModalPayment, setReviewModalPayment] = useState<any | null>(null);
    const [reviewReason, setReviewReason] = useState<string>("");

    // Build URL query string
    const isRefundTab = activeTab === "REFUNDS";
    const params = new URLSearchParams();
    params.append("page", String(page));
    params.append("limit", "15");
    if (search.trim()) params.append("search", search.trim());

    if (!isRefundTab) {
        if (selectedGateway !== "ALL") params.append("gateway", selectedGateway);
        if (selectedMethod !== "ALL") params.append("paymentMethod", selectedMethod);
        if (activeTab === "PAID") params.append("status", "PAID");
        if (activeTab === "PENDING") params.append("status", "PENDING");
        if (activeTab === "FAILED") params.append("status", "FAILED");
        if (activeTab === "REVIEW") params.append("needsAdminReview", "true");
    }

    const apiUrl = isRefundTab
        ? `payments/admin/refunds?${params.toString()}`
        : `payments/admin/all?${params.toString()}`;

    const {
        data: itemsList,
        totalItems,
        pageCount,
        response,
        isLoading,
        refetch,
    } = usePaginatedQuery<any>({
        url: apiUrl,
        queryKey: [paymentQueryKey, activeTab, String(page), search, selectedGateway, selectedMethod],
        enabled: true,
    });

    const metrics = (response as any)?.metrics || {
        totalCollected: 0,
        totalCount: 0,
        paidCount: 0,
        pendingCount: 0,
        failedCount: 0,
        reviewCount: 0,
        totalRefundedAmount: 0,
        pendingCountRefund: 0
    };

    const handleCopy = (text: string, id: string) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleAdminReview = async (action: "APPROVE" | "REJECT" | "HOLD") => {
        if (!reviewModalPayment) return;
        try {
            await handleApiMutation({
                mutation: postMutation,
                url: `payments/admin/${reviewModalPayment.id}/review`,
                body: { action, reason: reviewReason || `Admin manual ${action.toLowerCase()}` },
                requiredFields: [],
                showSuccessMessage: true,
            });
            setReviewModalPayment(null);
            setReviewReason("");
            refetch();
        } catch {
            // Error handled by useAPI
        }
    };

    const handleRefundAction = async (refundId: string, action: "MARK_SUCCEEDED" | "MARK_FAILED") => {
        try {
            await handleApiMutation({
                mutation: postMutation,
                url: `payments/admin/refunds/${refundId}/action`,
                body: { action, reason: `Refund updated to ${action} by Admin` },
                requiredFields: [],
                showSuccessMessage: true,
            });
            refetch();
        } catch {
            // Error handled by useAPI
        }
    };

    const getMethodBadge = (method?: string, cardType?: string) => {
        const m = (method || "").toUpperCase();
        if (m === "BKASH") {
            return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-[#E2136E]/10 text-[#E2136E] border border-[#E2136E]/20">bKash</span>;
        }
        if (m === "NAGAD") {
            return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-[#F7941D]/10 text-[#F7941D] border border-[#F7941D]/20">Nagad</span>;
        }
        if (m === "ROCKET") {
            return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-[#8C3494]/10 text-[#8C3494] border border-[#8C3494]/20">Rocket</span>;
        }
        if (m === "UPAY") {
            return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-500/10 text-amber-700 border border-amber-300">Upay</span>;
        }
        if (m === "VISA" || m === "MASTERCARD" || m === "BANK") {
            return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">{cardType || m}</span>;
        }
        if (m === "COD") {
            return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">COD</span>;
        }
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">{m || "Online"}</span>;
    };

    const getStatusBadge = (status: string, needsAdminReview?: boolean) => {
        if (needsAdminReview) {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
                    <FiAlertTriangle className="text-amber-600" /> Review Required
                </span>
            );
        }
        if (status === "PAID" || status === "SUCCEEDED") {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <FiCheckCircle className="text-emerald-500" /> {status}
                </span>
            );
        }
        if (status === "PENDING" || status === "PROCESSING") {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                    <FiClock className="text-amber-500" /> {status}
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                <FiXCircle className="text-rose-500" /> {status}
            </span>
        );
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                        <FiCreditCard className="text-emerald-600" /> Payments & Transactions
                    </h1>
                    <p className="text-sm text-gray-500 mt-0.5">
                        Centralized payment audit ledger, MFS transaction IDs, risk alerts, settlement verification, and refund management.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => refetch()}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 text-gray-700 transition"
                    >
                        <FiRefreshCw className={`text-gray-500 ${isLoading ? "animate-spin" : ""}`} /> Refresh
                    </button>
                </div>
            </div>

            {/* Metric Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl shrink-0">
                        <FiTrendingUp />
                    </div>
                    <div>
                        <span className="text-xs text-gray-400 font-medium block">Total Collected</span>
                        <span className="text-lg font-black text-gray-900">৳{Number(metrics.totalCollected || 0).toLocaleString()}</span>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-xl shrink-0">
                        <FiCreditCard />
                    </div>
                    <div>
                        <span className="text-xs text-gray-400 font-medium block">Total Payments</span>
                        <span className="text-lg font-black text-gray-900">{metrics.totalCount}</span>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl shrink-0">
                        <FiCheckCircle />
                    </div>
                    <div>
                        <span className="text-xs text-gray-400 font-medium block">Successful</span>
                        <span className="text-lg font-black text-emerald-700">{metrics.paidCount}</span>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center text-xl shrink-0">
                        <FiClock />
                    </div>
                    <div>
                        <span className="text-xs text-gray-400 font-medium block">Pending / In-Flight</span>
                        <span className="text-lg font-black text-amber-700">{metrics.pendingCount}</span>
                    </div>
                </div>

                <div className={`bg-white rounded-xl p-4 border shadow-sm flex items-center gap-3 ${
                    metrics.reviewCount > 0 ? "border-amber-400 bg-amber-50/30" : "border-gray-100"
                }`}>
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl shrink-0 ${
                        metrics.reviewCount > 0 ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-500"
                    }`}>
                        <FiShield />
                    </div>
                    <div>
                        <span className="text-xs text-gray-400 font-medium block">Needs Review</span>
                        <span className={`text-lg font-black ${metrics.reviewCount > 0 ? "text-amber-800" : "text-gray-900"}`}>
                            {metrics.reviewCount}
                        </span>
                    </div>
                </div>
            </div>

            {/* Filter Bar & Tabs */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
                    <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
                        {[
                            { key: "ALL", label: "All Payments" },
                            { key: "PAID", label: "Paid" },
                            { key: "PENDING", label: "Pending" },
                            { key: "REVIEW", label: `Review Required (${metrics.reviewCount || 0})` },
                            { key: "FAILED", label: "Failed" },
                            { key: "REFUNDS", label: "Refunds Ledger" },
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => {
                                    setActiveTab(tab.key);
                                    setPage(1);
                                }}
                                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition whitespace-nowrap ${
                                    activeTab === tab.key
                                        ? "bg-gray-900 text-white shadow-sm"
                                        : "text-gray-600 hover:bg-gray-100"
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {!isRefundTab && (
                        <div className="flex items-center gap-2">
                            <select
                                value={selectedGateway}
                                onChange={(e) => {
                                    setSelectedGateway(e.target.value);
                                    setPage(1);
                                }}
                                className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-gray-50 text-gray-700 font-medium focus:outline-none focus:ring-1 focus:ring-gray-900"
                            >
                                <option value="ALL">All Gateways</option>
                                <option value="SSLCOMMERZ">SSLCommerz</option>
                                <option value="STRIPE">Stripe</option>
                                <option value="COD">Cash on Delivery</option>
                            </select>

                            <select
                                value={selectedMethod}
                                onChange={(e) => {
                                    setSelectedMethod(e.target.value);
                                    setPage(1);
                                }}
                                className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-gray-50 text-gray-700 font-medium focus:outline-none focus:ring-1 focus:ring-gray-900"
                            >
                                <option value="ALL">All Methods</option>
                                <option value="BKASH">bKash</option>
                                <option value="NAGAD">Nagad</option>
                                <option value="ROCKET">Rocket</option>
                                <option value="UPAY">Upay</option>
                                <option value="VISA">Visa</option>
                                <option value="MASTERCARD">Mastercard</option>
                                <option value="BANK">Bank Transfer</option>
                                <option value="COD">Cash on Delivery</option>
                            </select>
                        </div>
                    )}
                </div>

                <div className="relative">
                    <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                        placeholder={
                            isRefundTab
                                ? "Search by Refund ID, Tran ID, or Order ID..."
                                : "Search by MFS TrxID, SSL Tran ID, Val ID, Order ID, or Customer Phone..."
                        }
                        className="w-full pl-10 pr-4 py-2 text-xs border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-gray-900 transition"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    {isRefundTab ? (
                        /* REFUNDS LEDGER TABLE */
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="bg-gray-50 text-gray-500 font-semibold uppercase tracking-wider border-b border-gray-100 text-[11px]">
                                    <th className="py-3 px-4">Date</th>
                                    <th className="py-3 px-4">Refund ID</th>
                                    <th className="py-3 px-4">Order ID</th>
                                    <th className="py-3 px-4">Original Tran ID</th>
                                    <th className="py-3 px-4">Reason</th>
                                    <th className="py-3 px-4">Amount</th>
                                    <th className="py-3 px-4">Status</th>
                                    <th className="py-3 px-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={8} className="py-12 text-center text-gray-400">
                                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-2" />
                                            <p>Loading refunds ledger...</p>
                                        </td>
                                    </tr>
                                ) : (!itemsList || itemsList.length === 0) ? (
                                    <tr>
                                        <td colSpan={8} className="py-12 text-center text-gray-400">
                                            <FiRotateCcw className="mx-auto text-4xl mb-2 text-gray-300" />
                                            <p className="font-semibold text-gray-600">No refunds recorded.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    itemsList.map((r: any) => (
                                        <tr key={r.id} className="hover:bg-gray-50/80 transition">
                                            <td className="py-3 px-4 text-gray-600 whitespace-nowrap">
                                                {r.createdAt ? format(new Date(r.createdAt), "dd MMM yyyy, hh:mm a") : "-"}
                                            </td>
                                            <td className="py-3 px-4 font-mono font-bold text-gray-900 whitespace-nowrap">
                                                {r.refundId}
                                            </td>
                                            <td className="py-3 px-4 whitespace-nowrap">
                                                <Link
                                                    to={`/orders?orderId=${r.payment?.order?.orderId || r.payment?.orderId}`}
                                                    className="font-bold text-blue-600 hover:underline flex items-center gap-1"
                                                >
                                                    {r.payment?.order?.orderId || "Order"} <FiExternalLink className="text-[10px]" />
                                                </Link>
                                            </td>
                                            <td className="py-3 px-4 font-mono text-gray-600 whitespace-nowrap">
                                                {r.payment?.tranId || "-"}
                                            </td>
                                            <td className="py-3 px-4 text-gray-700 whitespace-nowrap max-w-xs truncate">
                                                <span className="font-semibold">{r.reason}</span>
                                            </td>
                                            <td className="py-3 px-4 font-bold text-gray-900 whitespace-nowrap">
                                                ৳{Number(r.amount || 0).toLocaleString()}
                                            </td>
                                            <td className="py-3 px-4 whitespace-nowrap">
                                                {getStatusBadge(r.status)}
                                            </td>
                                            <td className="py-3 px-4 text-right whitespace-nowrap">
                                                {r.status === "PENDING" && (
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <button
                                                            onClick={() => handleRefundAction(r.id, "MARK_SUCCEEDED")}
                                                            className="px-2.5 py-1 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded transition"
                                                        >
                                                            Mark Settled
                                                        </button>
                                                        <button
                                                            onClick={() => handleRefundAction(r.id, "MARK_FAILED")}
                                                            className="px-2.5 py-1 text-[11px] font-bold bg-rose-600 hover:bg-rose-700 text-white rounded transition"
                                                        >
                                                            Decline
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    ) : (
                        /* PAYMENTS TABLE */
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="bg-gray-50 text-gray-500 font-semibold uppercase tracking-wider border-b border-gray-100 text-[11px]">
                                    <th className="py-3 px-4">Date / Time</th>
                                    <th className="py-3 px-4">Order ID</th>
                                    <th className="py-3 px-4">Customer</th>
                                    <th className="py-3 px-4">Method / Gateway</th>
                                    <th className="py-3 px-4">MFS / Bank TrxID</th>
                                    <th className="py-3 px-4">SSL Tran ID</th>
                                    <th className="py-3 px-4">Amount</th>
                                    <th className="py-3 px-4">Status</th>
                                    <th className="py-3 px-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={9} className="py-12 text-center text-gray-400">
                                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-2" />
                                            <p>Loading transactions ledger...</p>
                                        </td>
                                    </tr>
                                ) : (!itemsList || itemsList.length === 0) ? (
                                    <tr>
                                        <td colSpan={9} className="py-12 text-center text-gray-400">
                                            <FiCreditCard className="mx-auto text-4xl mb-2 text-gray-300" />
                                            <p className="font-semibold text-gray-600">No transactions found.</p>
                                            <p className="text-xs text-gray-400">Try adjusting your search or filters.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    itemsList.map((p: any) => {
                                        const customerName = p.order?.shippingAddress?.name || p.order?.user?.name || "Guest";
                                        const customerPhone = p.order?.shippingAddress?.phone || p.order?.user?.phone || "-";
                                        const orderDisplayId = p.order?.orderId || p.orderId?.slice(0, 8);

                                        return (
                                            <tr key={p.id} className="hover:bg-gray-50/80 transition">
                                                <td className="py-3 px-4 text-gray-600 whitespace-nowrap">
                                                    <div className="font-medium text-gray-900">
                                                        {p.createdAt ? format(new Date(p.createdAt), "dd MMM yyyy") : "-"}
                                                    </div>
                                                    <div className="text-[10px] text-gray-400">
                                                        {p.createdAt ? format(new Date(p.createdAt), "hh:mm:ss a") : ""}
                                                    </div>
                                                </td>

                                                <td className="py-3 px-4 whitespace-nowrap">
                                                    <Link
                                                        to={`/orders?orderId=${p.order?.orderId || p.orderId}`}
                                                        className="font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                                                    >
                                                        {orderDisplayId} <FiExternalLink className="text-[10px]" />
                                                    </Link>
                                                </td>

                                                <td className="py-3 px-4 whitespace-nowrap">
                                                    <div className="font-semibold text-gray-900">{customerName}</div>
                                                    <div className="text-[11px] text-gray-500">{customerPhone}</div>
                                                </td>

                                                <td className="py-3 px-4 whitespace-nowrap">
                                                    <div className="flex flex-col items-start gap-1">
                                                        {getMethodBadge(p.paymentMethod, p.cardType)}
                                                        <span className="text-[10px] font-semibold text-gray-400">
                                                            {p.gateway || "SSLCOMMERZ"}
                                                        </span>
                                                    </div>
                                                </td>

                                                <td className="py-3 px-4 whitespace-nowrap">
                                                    {p.bankTranId ? (
                                                        <div className="inline-flex items-center gap-1 font-mono text-[11px] bg-gray-50 border border-gray-200 px-2 py-0.5 rounded text-gray-800">
                                                            <span>{p.bankTranId}</span>
                                                            <button
                                                                onClick={() => handleCopy(p.bankTranId, `bank-${p.id}`)}
                                                                className="text-gray-400 hover:text-gray-700 ml-0.5"
                                                                title="Copy TrxID"
                                                            >
                                                                {copiedId === `bank-${p.id}` ? <FiCheck className="text-emerald-500" /> : <FiCopy />}
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-300">-</span>
                                                    )}
                                                </td>

                                                <td className="py-3 px-4 whitespace-nowrap">
                                                    <div className="inline-flex items-center gap-1 font-mono text-[11px] text-gray-600">
                                                        <span>{p.tranId}</span>
                                                        <button
                                                            onClick={() => handleCopy(p.tranId, `tran-${p.id}`)}
                                                            className="text-gray-400 hover:text-gray-700"
                                                            title="Copy Tran ID"
                                                        >
                                                            {copiedId === `tran-${p.id}` ? <FiCheck className="text-emerald-500" /> : <FiCopy />}
                                                        </button>
                                                    </div>
                                                </td>

                                                <td className="py-3 px-4 whitespace-nowrap font-bold text-gray-900">
                                                    ৳{Number(p.amount || 0).toLocaleString()}
                                                </td>

                                                <td className="py-3 px-4 whitespace-nowrap">
                                                    {getStatusBadge(p.status, p.needsAdminReview)}
                                                </td>

                                                <td className="py-3 px-4 text-right whitespace-nowrap">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <button
                                                            onClick={() => setActivePayment(p)}
                                                            className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
                                                            title="View Full Payment Metadata"
                                                        >
                                                            <FiEye className="text-sm" />
                                                        </button>

                                                        {p.needsAdminReview && (
                                                            <button
                                                                onClick={() => setReviewModalPayment(p)}
                                                                className="px-2.5 py-1 text-[11px] font-bold bg-amber-500 hover:bg-amber-600 text-white rounded-md transition shadow-xs"
                                                            >
                                                                Review
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Pagination */}
                {pageCount > 1 && (
                    <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                        <span>Showing page {page} of {pageCount} ({totalItems} records)</span>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                                disabled={page <= 1}
                                className="px-3 py-1.5 border border-gray-200 rounded-md bg-white disabled:opacity-40 hover:bg-gray-50 transition"
                            >
                                Previous
                            </button>
                            <span className="px-2 font-bold text-gray-800">{page}</span>
                            <button
                                onClick={() => setPage((prev) => Math.min(pageCount, prev + 1))}
                                disabled={page >= pageCount}
                                className="px-3 py-1.5 border border-gray-200 rounded-md bg-white disabled:opacity-40 hover:bg-gray-50 transition"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Payment Details Drawer / Modal */}
            {activePayment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-xl border border-gray-100">
                        <div className="flex items-center justify-between border-b pb-3">
                            <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
                                <FiCreditCard className="text-emerald-600" /> Transaction Audit & Events
                            </h3>
                            <button
                                onClick={() => setActivePayment(null)}
                                className="text-gray-400 hover:text-gray-700 text-lg"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs bg-gray-50 p-3 rounded-xl border border-gray-100">
                            <div>
                                <span className="text-gray-400 block text-[10px]">Merchant Tran ID</span>
                                <span className="font-mono font-bold text-gray-800">{activePayment.tranId}</span>
                            </div>
                            <div>
                                <span className="text-gray-400 block text-[10px]">SSL Val ID</span>
                                <span className="font-mono font-bold text-gray-800">{activePayment.valId || "N/A"}</span>
                            </div>
                            <div>
                                <span className="text-gray-400 block text-[10px]">Bank / MFS TrxID</span>
                                <span className="font-mono font-bold text-emerald-700">{activePayment.bankTranId || "N/A"}</span>
                            </div>
                            <div>
                                <span className="text-gray-400 block text-[10px]">Card / Provider</span>
                                <span className="font-bold text-gray-800">{activePayment.cardType || activePayment.paymentMethod || "N/A"}</span>
                            </div>
                            <div>
                                <span className="text-gray-400 block text-[10px]">Amount & Currency</span>
                                <span className="font-bold text-gray-800">৳{activePayment.amount} {activePayment.currency}</span>
                            </div>
                            <div>
                                <span className="text-gray-400 block text-[10px]">Settled / Paid At</span>
                                <span className="font-bold text-gray-800">{activePayment.paidAt ? format(new Date(activePayment.paidAt), "dd MMM yyyy, hh:mm a") : "Not Settled"}</span>
                            </div>
                        </div>

                        {activePayment.failureReason && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800">
                                <span className="font-bold block">Gateway Error / Decline:</span>
                                <span>{activePayment.failureReason}</span>
                            </div>
                        )}

                        {activePayment.needsAdminReview && (
                            <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900">
                                <span className="font-bold block">Flagged for Review:</span>
                                <span>Reason: {activePayment.adminReviewReason || "Suspected anomaly"}</span>
                            </div>
                        )}

                        {/* Events audit timeline */}
                        <div className="space-y-2 pt-2 border-t">
                            <h4 className="text-xs font-bold text-gray-700">Audit Events:</h4>
                            {activePayment.events && activePayment.events.length > 0 ? (
                                <div className="space-y-2 max-h-40 overflow-y-auto">
                                    {activePayment.events.map((ev: any, idx: number) => (
                                        <div key={idx} className="text-[11px] bg-white p-2 rounded border border-gray-100 flex items-start justify-between">
                                            <div>
                                                <span className="font-bold text-gray-800">{ev.eventType}</span>
                                                <span className="text-gray-400 block text-[10px]">Source: {ev.source}</span>
                                            </div>
                                            <span className="text-[10px] text-gray-400">
                                                {ev.createdAt ? format(new Date(ev.createdAt), "hh:mm:ss a") : ""}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-gray-400 italic">No event history recorded.</p>
                            )}
                        </div>

                        <div className="flex justify-end pt-2">
                            <button
                                onClick={() => setActivePayment(null)}
                                className="px-4 py-2 bg-gray-900 text-white text-xs font-bold rounded-lg hover:bg-gray-800 transition"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Admin Review Action Modal */}
            {reviewModalPayment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-gray-100">
                        <div className="flex items-center justify-between border-b pb-3">
                            <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
                                <FiShield className="text-amber-500" /> Payment Risk Review
                            </h3>
                            <button
                                onClick={() => setReviewModalPayment(null)}
                                className="text-gray-400 hover:text-gray-700 text-lg"
                            >
                                ✕
                            </button>
                        </div>

                        <p className="text-xs text-gray-600">
                            Transaction <strong className="font-mono">{reviewModalPayment.tranId}</strong> was flagged for:
                            <br />
                            <span className="text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded mt-1 inline-block">
                                {reviewModalPayment.adminReviewReason || "Risk Level 1 / Suspected"}
                            </span>
                        </p>

                        <div>
                            <label className="text-xs font-semibold text-gray-700 block mb-1">
                                Action Reason / Resolution Note:
                            </label>
                            <textarea
                                value={reviewReason}
                                onChange={(e) => setReviewReason(e.target.value)}
                                placeholder="Enter reason for approval or rejection..."
                                rows={3}
                                className="w-full text-xs p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-900"
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-2 pt-2">
                            <button
                                onClick={() => handleAdminReview("APPROVE")}
                                className="py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-xs"
                            >
                                Approve (Verify)
                            </button>
                            <button
                                onClick={() => handleAdminReview("HOLD")}
                                className="py-2 px-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold transition shadow-xs"
                            >
                                Keep on Hold
                            </button>
                            <button
                                onClick={() => handleAdminReview("REJECT")}
                                className="py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition shadow-xs"
                            >
                                Reject & Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
