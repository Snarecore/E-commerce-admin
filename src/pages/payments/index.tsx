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
    FiRotateCcw,
    FiFileText,
    FiActivity
} from "react-icons/fi";
import { useAPI } from "../../hooks/useApi";
import { paymentQueryKey } from "../../config/query-key";
import { format } from "date-fns";
import { showErrorToast, showSuccessToast } from "../../utils/toast-utils";
import PageHeader from "../../components/cards/PageHeader";

export default function PaymentsPage() {
    const { usePaginatedQuery, postMutation, handleApiMutation } = useAPI();

    const [activeTab, setActiveTab] = useState<string>("ALL");
    const [page, setPage] = useState<number>(1);
    const [search, setSearch] = useState<string>("");
    const [selectedGateway, setSelectedGateway] = useState<string>("ALL");
    const [selectedMethod, setSelectedMethod] = useState<string>("ALL");
    const [selectedAuditAction, setSelectedAuditAction] = useState<string>("ALL");

    // Copy feedback state
    const [copiedId, setCopiedId] = useState<string | null>(null);

    // Modal details states
    const [activePayment, setActivePayment] = useState<any | null>(null);
    const [reviewModalPayment, setReviewModalPayment] = useState<any | null>(null);
    const [reviewReason, setReviewReason] = useState<string>("");

    // Initiate Refund Modal states
    const [refundModalPayment, setRefundModalPayment] = useState<any | null>(null);
    const [refundType, setRefundType] = useState<"FULL" | "PARTIAL">("FULL");
    const [refundAmount, setRefundAmount] = useState<string>("");
    const [refundReasonCategory, setRefundReasonCategory] = useState<string>("Customer Return");
    const [customRefundReason, setCustomRefundReason] = useState<string>("");
    const [refundIdempotencyKey, setRefundIdempotencyKey] = useState<string>("");
    const [isSubmittingRefund, setIsSubmittingRefund] = useState<boolean>(false);

    // Payment-Specific Audit History Drawer state
    const [auditDrawerPayment, setAuditDrawerPayment] = useState<any | null>(null);

    // Metadata details preview modal state
    const [metadataModalItem, setMetadataModalItem] = useState<any | null>(null);

    // Build URL query string
    const isRefundTab = activeTab === "REFUNDS";
    const isAuditTab = activeTab === "AUDIT";
    const isDeadLetterTab = activeTab === "DEAD_LETTER";

    const [reconcilingId, setReconcilingId] = useState<string | null>(null);
    const [replayingEventId, setReplayingEventId] = useState<string | null>(null);

    const handleReconcilePayment = async (paymentId: string) => {
        setReconcilingId(paymentId);
        try {
            const res: any = await handleApiMutation({
                mutation: postMutation,
                url: `payments/admin/${paymentId}/reconcile`,
                body: {},
                requiredFields: [],
                showSuccessMessage: false,
            });
            const msg = res?.message || res?.data?.message || "Reconciliation completed.";
            if (res?.success || res?.statusCode === 200) {
                showSuccessToast(msg);
            } else {
                showErrorToast(msg);
            }
            refetch();
        } catch (err: any) {
            showErrorToast(err?.message || "Reconciliation failed.");
        } finally {
            setReconcilingId(null);
        }
    };

    const handleReplayOutboxEvent = async (eventId: string) => {
        setReplayingEventId(eventId);
        try {
            const res: any = await handleApiMutation({
                mutation: postMutation,
                url: `payments/admin/outbox/${eventId}/replay`,
                body: {},
                requiredFields: [],
                showSuccessMessage: false,
            });
            const msg = res?.message || res?.data?.message || "Outbox event re-queued.";
            showSuccessToast(msg);
            refetch();
        } catch (err: any) {
            showErrorToast(err?.message || "Failed to replay outbox event.");
        } finally {
            setReplayingEventId(null);
        }
    };

    const params = new URLSearchParams();
    params.append("page", String(page));
    params.append("limit", "15");
    if (search.trim()) params.append("search", search.trim());

    if (!isRefundTab && !isAuditTab && !isDeadLetterTab) {
        if (selectedGateway !== "ALL") params.append("gateway", selectedGateway);
        if (selectedMethod !== "ALL") params.append("paymentMethod", selectedMethod);
        if (activeTab === "PAID") params.append("status", "PAID");
        if (activeTab === "PENDING") params.append("status", "PENDING");
        if (activeTab === "FAILED") params.append("status", "FAILED");
        if (activeTab === "REVIEW") params.append("needsAdminReview", "true");
    }

    if (isAuditTab && selectedAuditAction !== "ALL") {
        params.append("action", selectedAuditAction);
    }

    let apiUrl = `payments/admin/all?${params.toString()}`;
    if (isRefundTab) {
        apiUrl = `payments/admin/refunds?${params.toString()}`;
    } else if (isAuditTab) {
        apiUrl = `payments/admin/audit-logs?${params.toString()}`;
    } else if (isDeadLetterTab) {
        apiUrl = `payments/admin/outbox/dead-letter?${params.toString()}`;
    }

    const {
        data: itemsList,
        totalItems,
        pageCount,
        response,
        isLoading,
        refetch,
    } = usePaginatedQuery<any>({
        url: apiUrl,
        queryKey: [paymentQueryKey, activeTab, String(page), search, selectedGateway, selectedMethod, selectedAuditAction],
        enabled: true,
    });

    // Query for payment-specific audit drawer
    const {
        data: drawerAuditLogs,
        isLoading: isDrawerLoading
    } = usePaginatedQuery<any>({
        url: auditDrawerPayment ? `payments/admin/audit-logs?paymentId=${auditDrawerPayment.id}&limit=50` : "",
        queryKey: ["payment-audit-drawer", auditDrawerPayment?.id],
        enabled: !!auditDrawerPayment,
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
            // Handled by useAPI
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
            // Handled by useAPI
        }
    };

    // Calculate refundable balance helper
    const calculateRefundableBalance = (payment: any) => {
        if (!payment) return { alreadyRefunded: 0, remaining: 0 };
        const originalAmount = Number(payment.amount || 0);
        const alreadyRefunded = (payment.refunds || [])
            .filter((r: any) => r.status === "SUCCEEDED")
            .reduce((sum: number, r: any) => sum + Number(r.amount || 0), 0);
        const remaining = Math.max(0, originalAmount - alreadyRefunded);
        return { alreadyRefunded, remaining };
    };

    // Open Initiate Refund Modal
    const handleOpenRefundModal = (payment: any) => {
        setRefundModalPayment(payment);
        setRefundType("FULL");
        const { remaining } = calculateRefundableBalance(payment);
        setRefundAmount(remaining.toFixed(2));
        setRefundReasonCategory("Customer Return");
        setCustomRefundReason("");
        // Generate stable idempotency key for this modal session
        setRefundIdempotencyKey(`ref_init_${payment.id}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`);
    };

    // Handle Submit Refund
    const handleSubmitRefund = async () => {
        if (!refundModalPayment || isSubmittingRefund) return;

        const { remaining } = calculateRefundableBalance(refundModalPayment);
        const requested = Number(refundAmount);

        if (isNaN(requested) || requested <= 0) {
            showErrorToast("Please enter a valid positive refund amount.");
            return;
        }

        if (requested > remaining) {
            showErrorToast(`Refund amount (৳${requested.toFixed(2)}) exceeds remaining refundable balance (৳${remaining.toFixed(2)}).`);
            return;
        }

        const finalReason = refundReasonCategory === "Other" ? customRefundReason.trim() : refundReasonCategory;
        if (!finalReason) {
            showErrorToast("Please specify a reason for the refund.");
            return;
        }

        setIsSubmittingRefund(true);
        try {
            const res: any = await handleApiMutation({
                mutation: postMutation,
                url: "payments/admin/refunds/initiate",
                body: {
                    paymentId: refundModalPayment.id,
                    amount: requested,
                    reason: finalReason,
                    idempotencyKey: refundIdempotencyKey
                },
                requiredFields: [],
                showSuccessMessage: false,
            });

            const refundStatus = res?.refund?.status || "PENDING";
            showSuccessToast(`Refund request submitted successfully. Status: ${refundStatus}.`);
            setRefundModalPayment(null);
            refetch();
        } catch {
            // Handled by useAPI
        } finally {
            setIsSubmittingRefund(false);
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
                    <FiCheckCircle className="text-emerald-500" /> {status === "SUCCEEDED" ? "Refund Completed" : "PAID"}
                </span>
            );
        }
        if (status === "PROCESSING" || status === "PENDING") {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                    <FiClock className="text-amber-500" /> {status === "PENDING" ? "Pending Settlement" : "Processing"}
                </span>
            );
        }
        if (status === "UNKNOWN") {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    <FiClock className="text-indigo-500" /> Awaiting Reconciliation
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                <FiXCircle className="text-rose-500" /> {status}
            </span>
        );
    };

    const getAuditActionBadge = (action: string) => {
        if (action === "ADMIN_INITIATE_REFUND") {
            return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">Refund Initiated</span>;
        }
        if (action === "ADMIN_REFUND_MARK_SUCCEEDED") {
            return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Refund Settled</span>;
        }
        if (action === "ADMIN_REFUND_MARK_FAILED") {
            return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">Refund Declined</span>;
        }
        if (action === "ADMIN_PAYMENT_APPROVE") {
            return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Payment Approved</span>;
        }
        if (action === "ADMIN_PAYMENT_REJECT") {
            return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">Payment Rejected</span>;
        }
        if (action === "ADMIN_PAYMENT_HOLD") {
            return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">Payment On Hold</span>;
        }
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-gray-100 text-gray-700 border border-gray-200">{action}</span>;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <PageHeader
                    headerTitle="Payments & Transactions"
                    headerDescription="Centralized payment audit ledger, MFS transaction IDs, risk alerts, settlement verification, and refund management."
                />
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => refetch()}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-[var(--ui-surface)] border border-[var(--ui-border)] rounded-lg shadow-sm hover:bg-[var(--ui-surface-muted)] text-[var(--ui-text)] transition cursor-pointer"
                    >
                        <FiRefreshCw className={`text-[var(--ui-text-muted)] ${isLoading ? "animate-spin" : ""}`} /> Refresh
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
                            { key: "AUDIT", label: "Audit Logs" },
                            { key: "DEAD_LETTER", label: "Dead-Letter Outbox" },
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

                    {!isRefundTab && !isAuditTab && (
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

                    {isAuditTab && (
                        <div className="flex items-center gap-2">
                            <select
                                value={selectedAuditAction}
                                onChange={(e) => {
                                    setSelectedAuditAction(e.target.value);
                                    setPage(1);
                                }}
                                className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-gray-50 text-gray-700 font-medium focus:outline-none focus:ring-1 focus:ring-gray-900"
                            >
                                <option value="ALL">All Actions</option>
                                <option value="ADMIN_INITIATE_REFUND">Refund Initiated</option>
                                <option value="ADMIN_REFUND_MARK_SUCCEEDED">Refund Settled</option>
                                <option value="ADMIN_REFUND_MARK_FAILED">Refund Declined</option>
                                <option value="ADMIN_PAYMENT_APPROVE">Payment Approved</option>
                                <option value="ADMIN_PAYMENT_REJECT">Payment Rejected</option>
                                <option value="ADMIN_PAYMENT_HOLD">Payment On Hold</option>
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
                                : isAuditTab
                                ? "Search by Actor ID, Payment ID, Refund ID, or Reason..."
                                : "Search by MFS TrxID, SSL Tran ID, Val ID, Order ID, or Customer Phone..."
                        }
                        className="w-full pl-10 pr-4 py-2 text-xs border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-gray-900 transition"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    {isAuditTab ? (
                        /* AUDIT TRAIL TABLE */
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="bg-gray-50 text-gray-500 font-semibold uppercase tracking-wider border-b border-gray-100 text-[11px]">
                                    <th className="py-3 px-4">Date / Time</th>
                                    <th className="py-3 px-4">Action</th>
                                    <th className="py-3 px-4">Actor</th>
                                    <th className="py-3 px-4">Target Payment / Refund</th>
                                    <th className="py-3 px-4">State Transition</th>
                                    <th className="py-3 px-4">Reason / Notes</th>
                                    <th className="py-3 px-4 text-right">Details</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={7} className="py-12 text-center text-gray-400">
                                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-2" />
                                            <p>Loading immutable audit trail...</p>
                                        </td>
                                    </tr>
                                ) : (!itemsList || itemsList.length === 0) ? (
                                    <tr>
                                        <td colSpan={7} className="py-12 text-center text-gray-400">
                                            <FiFileText className="mx-auto text-4xl mb-2 text-gray-300" />
                                            <p className="font-semibold text-gray-600">No audit logs found.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    itemsList.map((log: any) => (
                                        <tr key={log.id} className="hover:bg-gray-50/80 transition">
                                            <td className="py-3 px-4 text-gray-600 whitespace-nowrap">
                                                <div className="font-medium text-gray-900">
                                                    {log.createdAt ? format(new Date(log.createdAt), "dd MMM yyyy") : "-"}
                                                </div>
                                                <div className="text-[10px] text-gray-400">
                                                    {log.createdAt ? format(new Date(log.createdAt), "hh:mm:ss a") : ""}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 whitespace-nowrap">
                                                {getAuditActionBadge(log.action)}
                                            </td>
                                            <td className="py-3 px-4 whitespace-nowrap">
                                                <div className="font-semibold text-gray-800">{log.actorId}</div>
                                                <div className="text-[10px] text-gray-400 capitalize">{log.actorRole || "admin"}</div>
                                            </td>
                                            <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px] text-gray-600">
                                                {log.refundId ? (
                                                    <span className="text-purple-700 font-bold">{log.refundId}</span>
                                                ) : log.paymentId ? (
                                                    <span>{log.paymentId}</span>
                                                ) : (
                                                    "-"
                                                )}
                                            </td>
                                            <td className="py-3 px-4 whitespace-nowrap">
                                                {log.previousState || log.newState ? (
                                                    <span className="text-gray-700 font-medium">
                                                        <span className="text-gray-400">{log.previousState || "INITIAL"}</span> → <strong className="text-gray-900">{log.newState}</strong>
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-gray-700 max-w-xs truncate">
                                                {log.reason || "-"}
                                            </td>
                                            <td className="py-3 px-4 text-right whitespace-nowrap">
                                                {log.metadata && (
                                                    <button
                                                        onClick={() => setMetadataModalItem(log)}
                                                        className="px-2 py-1 text-[11px] font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition"
                                                        title="View Metadata"
                                                    >
                                                        Metadata
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    ) : isRefundTab ? (
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
                    ) : isDeadLetterTab ? (
                        /* DEAD-LETTER OUTBOX TABLE */
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="bg-gray-50 text-gray-500 font-semibold uppercase tracking-wider border-b border-gray-100 text-[11px]">
                                    <th className="py-3 px-4">Event ID / Type</th>
                                    <th className="py-3 px-4">Aggregate</th>
                                    <th className="py-3 px-4">Attempts / Replays</th>
                                    <th className="py-3 px-4">Failure Reason</th>
                                    <th className="py-3 px-4">Last Updated</th>
                                    <th className="py-3 px-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={6} className="py-12 text-center text-gray-400">
                                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-2" />
                                            <p>Loading dead-letter outbox queue...</p>
                                        </td>
                                    </tr>
                                ) : (!itemsList || itemsList.length === 0) ? (
                                    <tr>
                                        <td colSpan={6} className="py-12 text-center text-gray-400">
                                            <FiShield className="mx-auto text-4xl mb-2 text-emerald-400" />
                                            <p className="font-semibold text-gray-600">No dead-letter events found.</p>
                                            <p className="text-xs text-gray-400">Transactional outbox is operating cleanly.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    itemsList.map((e: any) => (
                                        <tr key={e.id} className="hover:bg-gray-50/80 transition">
                                            <td className="py-3 px-4 whitespace-nowrap">
                                                <div className="font-bold text-gray-900 font-mono text-[11px]">{e.id?.slice(0, 8)}...</div>
                                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                                    {e.eventType}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 whitespace-nowrap">
                                                <span className="font-semibold text-gray-700">{e.aggregateType}: </span>
                                                <span className="font-mono text-gray-600 text-[11px]">{e.aggregateId}</span>
                                            </td>
                                            <td className="py-3 px-4 whitespace-nowrap">
                                                <span className="text-rose-600 font-bold">{e.retryCount} retries</span>
                                                {Number(e.replayCount) > 0 && (
                                                    <span className="text-purple-600 font-semibold text-[11px] block">
                                                        ({e.replayCount} manual replay{e.replayCount > 1 ? "s" : ""})
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-gray-700 max-w-xs truncate" title={e.failureReason}>
                                                <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-100 text-[11px]">
                                                    {e.failureReason || "Maximum dispatch attempts reached"}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-gray-600 whitespace-nowrap text-[11px]">
                                                {e.updatedAt ? format(new Date(e.updatedAt), "dd MMM yyyy, hh:mm a") : "-"}
                                            </td>
                                            <td className="py-3 px-4 text-right whitespace-nowrap">
                                                <button
                                                    onClick={() => handleReplayOutboxEvent(e.id)}
                                                    disabled={replayingEventId === e.id}
                                                    className="px-3 py-1 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition shadow-xs flex items-center gap-1.5 ml-auto disabled:opacity-50"
                                                >
                                                    <FiRotateCcw className={replayingEventId === e.id ? "animate-spin" : ""} />
                                                    Replay Event
                                                </button>
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
                                        const { remaining } = calculateRefundableBalance(p);
                                        const isRefundable = p.status === "PAID" && remaining > 0;

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

                                                        <button
                                                            onClick={() => setAuditDrawerPayment(p)}
                                                            className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                                                            title="View Payment Audit History"
                                                        >
                                                            <FiActivity className="text-sm" />
                                                        </button>

                                                        {isRefundable && (
                                                            <button
                                                                onClick={() => handleOpenRefundModal(p)}
                                                                className="px-2 py-1 text-[11px] font-bold bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 rounded-md transition flex items-center gap-1 shadow-xs"
                                                                title="Initiate Partial or Full Refund"
                                                            >
                                                                <FiRotateCcw className="text-[10px]" /> Refund
                                                            </button>
                                                        )}

                                                        {(p.status === "PENDING" || p.needsAdminReview || p.status === "UNKNOWN") && (
                                                            <button
                                                                onClick={() => handleReconcilePayment(p.id)}
                                                                disabled={reconcilingId === p.id}
                                                                className="px-2 py-1 text-[11px] font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-md transition flex items-center gap-1 shadow-xs disabled:opacity-50"
                                                                title="Verify & Reconcile with Gateway"
                                                            >
                                                                <FiRefreshCw className={`text-[10px] ${reconcilingId === p.id ? "animate-spin" : ""}`} /> Reconcile
                                                            </button>
                                                        )}

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

            {/* Initiate Refund Modal */}
            {refundModalPayment && (() => {
                const { alreadyRefunded, remaining } = calculateRefundableBalance(refundModalPayment);

                return (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                        <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-gray-100">
                            <div className="flex items-center justify-between border-b pb-3">
                                <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
                                    <FiRotateCcw className="text-purple-600" /> Initiate Payment Refund
                                </h3>
                                <button
                                    onClick={() => setRefundModalPayment(null)}
                                    className="text-gray-400 hover:text-gray-700 text-lg"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-100 text-xs space-y-1.5">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Transaction ID:</span>
                                    <span className="font-mono font-bold text-gray-800">{refundModalPayment.tranId}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Original Amount:</span>
                                    <span className="font-bold text-gray-900">৳{Number(refundModalPayment.amount || 0).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Already Refunded:</span>
                                    <span className="font-bold text-purple-700">৳{alreadyRefunded.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between border-t pt-1 border-purple-200/50">
                                    <span className="font-semibold text-gray-700">Max Refundable:</span>
                                    <span className="font-extrabold text-emerald-700">৳{remaining.toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Refund Type Toggle */}
                            <div className="grid grid-cols-2 gap-2 bg-gray-100 p-1 rounded-xl text-xs font-bold text-center">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setRefundType("FULL");
                                        setRefundAmount(remaining.toFixed(2));
                                    }}
                                    className={`py-1.5 rounded-lg transition ${
                                        refundType === "FULL" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                                    }`}
                                >
                                    Full Refund (৳{remaining.toFixed(2)})
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setRefundType("PARTIAL");
                                    }}
                                    className={`py-1.5 rounded-lg transition ${
                                        refundType === "PARTIAL" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                                    }`}
                                >
                                    Partial Refund
                                </button>
                            </div>

                            {/* Amount Input */}
                            <div>
                                <label className="text-xs font-semibold text-gray-700 block mb-1">
                                    Refund Amount (৳ BDT):
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="1"
                                    max={remaining}
                                    disabled={refundType === "FULL"}
                                    value={refundAmount}
                                    onChange={(e) => setRefundAmount(e.target.value)}
                                    className="w-full text-xs p-2.5 border border-gray-200 rounded-lg disabled:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-gray-900 font-bold"
                                />
                            </div>

                            {/* Reason Select */}
                            <div>
                                <label className="text-xs font-semibold text-gray-700 block mb-1">
                                    Refund Reason:
                                </label>
                                <select
                                    value={refundReasonCategory}
                                    onChange={(e) => setRefundReasonCategory(e.target.value)}
                                    className="w-full text-xs p-2.5 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-1 focus:ring-gray-900"
                                >
                                    <option value="Customer Return">Customer Return</option>
                                    <option value="Out of Stock / Inventory Issue">Out of Stock / Inventory Issue</option>
                                    <option value="Defective / Damaged Item">Defective / Damaged Item</option>
                                    <option value="Duplicate Payment">Duplicate Payment</option>
                                    <option value="Order Cancelled by Customer">Order Cancelled by Customer</option>
                                    <option value="Other">Other (Custom Reason)</option>
                                </select>
                            </div>

                            {refundReasonCategory === "Other" && (
                                <div>
                                    <label className="text-xs font-semibold text-gray-700 block mb-1">
                                        Specify Reason:
                                    </label>
                                    <textarea
                                        value={customRefundReason}
                                        onChange={(e) => setCustomRefundReason(e.target.value)}
                                        placeholder="Enter detailed reason for refund..."
                                        rows={2}
                                        className="w-full text-xs p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-900"
                                    />
                                </div>
                            )}

                            <div className="pt-2 flex items-center justify-between border-t border-gray-100">
                                <span className="text-[10px] text-gray-400 font-mono">
                                    Idempotency Key: {refundIdempotencyKey.slice(0, 18)}...
                                </span>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setRefundModalPayment(null)}
                                        disabled={isSubmittingRefund}
                                        className="px-4 py-2 border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleSubmitRefund}
                                        disabled={isSubmittingRefund || remaining <= 0}
                                        className="px-5 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition shadow-sm flex items-center gap-1.5"
                                    >
                                        {isSubmittingRefund ? (
                                            <>
                                                <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                Submitting...
                                            </>
                                        ) : (
                                            <>
                                                <FiRotateCcw /> Submit Refund
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })()}

            {/* Payment-Specific Audit History Drawer / Modal */}
            {auditDrawerPayment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-xl border border-gray-100 max-h-[85vh] flex flex-col">
                        <div className="flex items-center justify-between border-b pb-3">
                            <div>
                                <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
                                    <FiActivity className="text-indigo-600" /> Payment Audit History
                                </h3>
                                <p className="text-xs text-gray-500 font-mono mt-0.5">
                                    Tran ID: {auditDrawerPayment.tranId} | Amount: ৳{auditDrawerPayment.amount}
                                </p>
                            </div>
                            <button
                                onClick={() => setAuditDrawerPayment(null)}
                                className="text-gray-400 hover:text-gray-700 text-lg"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                            {isDrawerLoading ? (
                                <div className="py-12 text-center text-gray-400">
                                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-2" />
                                    <p className="text-xs">Loading audit trail...</p>
                                </div>
                            ) : (!drawerAuditLogs || drawerAuditLogs.length === 0) ? (
                                <div className="py-12 text-center text-gray-400">
                                    <FiFileText className="mx-auto text-4xl mb-2 text-gray-300" />
                                    <p className="text-xs font-semibold text-gray-600">No audit records for this transaction yet.</p>
                                </div>
                            ) : (
                                drawerAuditLogs.map((log: any) => (
                                    <div key={log.id} className="p-3 rounded-xl border border-gray-100 bg-gray-50/50 space-y-1.5 text-xs">
                                        <div className="flex items-center justify-between">
                                            {getAuditActionBadge(log.action)}
                                            <span className="text-[11px] text-gray-400 font-mono">
                                                {log.createdAt ? format(new Date(log.createdAt), "dd MMM yyyy, hh:mm:ss a") : "-"}
                                            </span>
                                        </div>
                                        <div className="text-gray-600 flex items-center justify-between">
                                            <span>Actor: <strong className="text-gray-800">{log.actorId}</strong> ({log.actorRole})</span>
                                            {log.newState && (
                                                <span className="font-mono text-[11px] text-gray-700">
                                                    State: {log.previousState || "INITIAL"} → <strong className="text-gray-900">{log.newState}</strong>
                                                </span>
                                            )}
                                        </div>
                                        {log.reason && (
                                            <p className="text-gray-700 bg-white p-2 rounded border border-gray-100 italic">
                                                &quot;{log.reason}&quot;
                                            </p>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="flex justify-end border-t pt-3">
                            <button
                                onClick={() => setAuditDrawerPayment(null)}
                                className="px-4 py-2 bg-gray-900 text-white text-xs font-bold rounded-lg hover:bg-gray-800 transition"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Metadata Preview Modal */}
            {metadataModalItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-gray-100">
                        <div className="flex items-center justify-between border-b pb-3">
                            <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
                                <FiFileText className="text-gray-600" /> Audit Log Metadata
                            </h3>
                            <button
                                onClick={() => setMetadataModalItem(null)}
                                className="text-gray-400 hover:text-gray-700 text-lg"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="bg-gray-900 text-emerald-400 p-4 rounded-xl text-xs font-mono overflow-x-auto max-h-60">
                            <pre>{JSON.stringify(metadataModalItem.metadata, null, 2)}</pre>
                        </div>
                        <div className="flex justify-end">
                            <button
                                onClick={() => setMetadataModalItem(null)}
                                className="px-4 py-2 bg-gray-900 text-white text-xs font-bold rounded-lg hover:bg-gray-800 transition"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
