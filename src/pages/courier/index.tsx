import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FiAlertTriangle, FiExternalLink, FiRefreshCw, FiSearch, FiTruck } from "react-icons/fi";
import toast from "react-hot-toast";
import PageHeader from "../../components/cards/PageHeader";
import { useAPI } from "../../hooks/useApi";

type TabKey = "ready" | "attention" | "cod" | "all";

const TABS: { key: TabKey; label: string; hint: string }[] = [
    { key: "ready", label: "Ready to book", hint: "Confirmed orders not yet sent to Steadfast" },
    { key: "attention", label: "Needs attention", hint: "Failed bookings, partial deliveries, unknown courier statuses" },
    { key: "cod", label: "COD to receive", hint: "Delivered by Steadfast, payout not yet recorded" },
    { key: "all", label: "All shipments", hint: "Every Steadfast booking" },
];

const SHIPMENT_STATUSES = [
    "PENDING_DISPATCH", "DISPATCH_FAILED", "CANCELLED", "IN_REVIEW", "IN_TRANSIT", "ON_HOLD",
    "APPROVAL_PENDING", "DELIVERED", "PARTIAL_DELIVERED", "RETURN_IN_TRANSIT", "UNKNOWN",
];

const STATUS_CLS: Record<string, string> = {
    PENDING_DISPATCH: "bg-amber-50 text-amber-700",
    DISPATCH_FAILED: "bg-red-50 text-red-700",
    CANCELLED: "bg-gray-100 text-gray-600",
    DELIVERED: "bg-emerald-50 text-emerald-700",
    PARTIAL_DELIVERED: "bg-orange-50 text-orange-700",
    RETURN_IN_TRANSIT: "bg-purple-50 text-purple-700",
};

interface ReadyOrder {
    id: string;
    orderId: string;
    status: string;
    paymentMethod: string;
    paymentStatus: string;
    totalAmount: number;
    codAmount: number;
    customerName: string;
    phone: string;
    city: string;
    createdAt: string;
    problem: string | null;
}

interface ShipmentRow {
    id: string;
    orderId: string;
    orderCode: string;
    invoice: string;
    status: string;
    providerStatus: string | null;
    consignmentId: string | null;
    trackingCode: string | null;
    trackingUrl: string | null;
    codAmount: string | number;
    codCollectedAmount: string | number | null;
    courierCharge: string | number | null;
    lastError: string | null;
    needsAttention: boolean;
    recipientName: string;
    updatedAt: string;
}

interface Paged<T> {
    data: T[];
    total: number;
    page: number;
    pageCount: number;
    summary?: { codAmount: number; codCollected: number; courierCharge: number };
}

interface BulkResult {
    orderId?: string;
    shipmentId?: string;
    ok: boolean;
    message: string;
}

const money = (v: string | number | null | undefined) =>
    v === null || v === undefined || v === "" ? "—" : `৳${Number(v).toLocaleString("en-BD")}`;

const CourierPage = () => {
    const navigate = useNavigate();
    const [params, setParams] = useSearchParams();
    const tab = (TABS.find((t) => t.key === params.get("tab"))?.key || "ready") as TabKey;
    const { fetchData, handleApiMutation, postMutation } = useAPI();

    const [enabled, setEnabled] = useState<boolean | null>(null);
    const [page, setPage] = useState(1);
    const [q, setQ] = useState("");
    const [query, setQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [loading, setLoading] = useState(false);
    const [ready, setReady] = useState<Paged<ReadyOrder> | null>(null);
    const [shipments, setShipments] = useState<Paged<ShipmentRow> | null>(null);
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [busy, setBusy] = useState(false);
    const [settleRef, setSettleRef] = useState("");
    const [failures, setFailures] = useState<BulkResult[]>([]);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const qs = new URLSearchParams({ page: String(page), limit: "20" });
            if (query) qs.set("q", query);
            if (tab === "ready") {
                const res = (await fetchData({ apiUrl: `courier/ready-orders?${qs}` })) as Paged<ReadyOrder> | undefined;
                setReady(res || null);
            } else {
                if (tab === "attention") qs.set("needsAttention", "true");
                if (tab === "cod") qs.set("codUnsettled", "true");
                if (tab === "all" && statusFilter) qs.set("status", statusFilter);
                const res = (await fetchData({ apiUrl: `courier/shipments?${qs}` })) as Paged<ShipmentRow> | undefined;
                setShipments(res || null);
            }
        } finally {
            setLoading(false);
        }
        // fetchData is recreated each render by useAPI.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tab, page, query, statusFilter]);

    useEffect(() => {
        load();
    }, [load]);

    useEffect(() => {
        (async () => {
            const res = (await fetchData({ apiUrl: "courier/status" })) as { steadfastEnabled?: boolean } | undefined;
            setEnabled(!!res?.steadfastEnabled);
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const switchTab = (key: TabKey) => {
        setParams({ tab: key });
        setPage(1);
        setSelected(new Set());
        setFailures([]);
        setQ("");
        setQuery("");
        setStatusFilter("");
    };

    const toggle = (id: string) =>
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });

    const selectableIds = useMemo(() => {
        if (tab === "ready") return (ready?.data || []).filter((o) => !o.problem).map((o) => o.id);
        if (tab === "cod") return (shipments?.data || []).map((s) => s.id);
        return [];
    }, [tab, ready, shipments]);

    const allSelected = selectableIds.length > 0 && selectableIds.every((id) => selected.has(id));
    const toggleAll = () => setSelected(allSelected ? new Set() : new Set(selectableIds));

    const selectedCodTotal = useMemo(
        () =>
            (shipments?.data || [])
                .filter((s) => selected.has(s.id))
                .reduce((sum, s) => sum + Number(s.codCollectedAmount ?? s.codAmount ?? 0), 0),
        [shipments, selected],
    );

    const runBulk = async (url: string, body: Record<string, unknown>) => {
        setBusy(true);
        setFailures([]);
        try {
            const res = await handleApiMutation({ mutation: postMutation, url, body, requiredFields: [], showSuccessMessage: true });
            const results = ((res?.data as { data?: BulkResult[] } | undefined)?.data || []) as BulkResult[];
            const failed = results.filter((r) => !r.ok);
            setFailures(failed);
            if (failed.length) toast.error(`${failed.length} item(s) could not be processed. See the list below.`);
            setSelected(new Set());
            await load();
        } finally {
            setBusy(false);
        }
    };

    const bookSelected = () => runBulk("courier/shipments/bulk", { orderIds: Array.from(selected) });
    const settleSelected = () =>
        runBulk("courier/shipments/bulk-cod-settled", {
            shipmentIds: Array.from(selected),
            ...(settleRef.trim() ? { reference: settleRef.trim() } : {}),
        });

    const orderCodeFor = (id?: string) =>
        ready?.data.find((o) => o.id === id)?.orderId || shipments?.data.find((s) => s.id === id)?.orderCode || id;

    const pageCount = (tab === "ready" ? ready?.pageCount : shipments?.pageCount) || 1;
    const total = (tab === "ready" ? ready?.total : shipments?.total) || 0;

    return (
        <div className="flex flex-col gap-5">
            <PageHeader headerTitle="Courier" headerDescription="Book, track and reconcile Steadfast parcels">
                <button
                    onClick={load}
                    className="flex items-center gap-2 text-sm border border-gray-300 rounded-lg px-3 py-2 hover:border-orange-400 cursor-pointer"
                >
                    <FiRefreshCw className={loading ? "animate-spin" : ""} /> Refresh
                </button>
            </PageHeader>

            {enabled === false && (
                <div className="text-sm bg-amber-50 border border-amber-200 text-amber-800 rounded-lg p-3 flex gap-2">
                    <FiAlertTriangle className="mt-0.5 shrink-0" />
                    Steadfast integration is turned off on the server (STEADFAST_ENABLED). Booking is disabled; existing data is still shown.
                </div>
            )}

            <div className="flex flex-wrap gap-2 border-b border-gray-200">
                {TABS.map((t) => (
                    <button
                        key={t.key}
                        onClick={() => switchTab(t.key)}
                        className={`px-4 py-2 text-sm font-semibold -mb-px border-b-2 cursor-pointer ${tab === t.key ? "border-orange-500 text-orange-600" : "border-transparent text-gray-500 hover:text-gray-800"}`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>
            <p className="text-xs text-gray-500 -mt-3">{TABS.find((t) => t.key === tab)?.hint}</p>

            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-3">
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        setPage(1);
                        setQuery(q.trim());
                    }}
                    className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 bg-white"
                >
                    <FiSearch className="text-gray-400" />
                    <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder={tab === "ready" ? "Order ID" : "Order ID, invoice, consignment, tracking"}
                        className="text-sm outline-none w-56"
                    />
                </form>
                {tab === "all" && (
                    <select
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setPage(1);
                        }}
                        className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white cursor-pointer"
                    >
                        <option value="">All statuses</option>
                        {SHIPMENT_STATUSES.map((s) => (
                            <option key={s} value={s}>{s.replace(/_/g, " ").toLowerCase()}</option>
                        ))}
                    </select>
                )}

                {tab === "ready" && (
                    <button
                        onClick={bookSelected}
                        disabled={!enabled || busy || selected.size === 0}
                        className="ml-auto flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-2 rounded-lg cursor-pointer"
                    >
                        <FiTruck /> {busy ? "Queuing…" : `Book selected with Steadfast (${selected.size})`}
                    </button>
                )}

                {tab === "cod" && (
                    <div className="ml-auto flex flex-wrap items-center gap-2">
                        {shipments?.summary && (
                            <span className="text-xs text-gray-600">
                                Outstanding: <b>{money(shipments.summary.codCollected || shipments.summary.codAmount)}</b>
                                {" · "}courier charges {money(shipments.summary.courierCharge)}
                            </span>
                        )}
                        <input
                            value={settleRef}
                            onChange={(e) => setSettleRef(e.target.value)}
                            placeholder="Steadfast payment ID"
                            className="text-sm border border-gray-300 rounded-lg px-3 py-2 w-44"
                        />
                        <button
                            onClick={settleSelected}
                            disabled={busy || selected.size === 0}
                            className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-2 rounded-lg cursor-pointer"
                        >
                            {busy ? "Saving…" : `Mark COD received (${selected.size} · ${money(selectedCodTotal)})`}
                        </button>
                    </div>
                )}
            </div>

            {failures.length > 0 && (
                <div className="text-sm bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="font-semibold text-red-700 mb-1">Not processed:</p>
                    <ul className="list-disc pl-5 text-red-700 space-y-0.5">
                        {failures.map((f, i) => (
                            <li key={i}>
                                <b>{orderCodeFor(f.orderId || f.shipmentId)}</b>: {f.message}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
                {tab === "ready" ? (
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                            <tr>
                                <th className="p-3 w-10">
                                    <input type="checkbox" checked={allSelected} onChange={toggleAll} disabled={!selectableIds.length} />
                                </th>
                                <th className="p-3 text-left">Order</th>
                                <th className="p-3 text-left">Customer</th>
                                <th className="p-3 text-left">City</th>
                                <th className="p-3 text-left">Payment</th>
                                <th className="p-3 text-right">COD</th>
                                <th className="p-3 text-left">Placed</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(ready?.data || []).map((o) => (
                                <tr key={o.id} className="border-t border-gray-100 hover:bg-gray-50">
                                    <td className="p-3 text-center">
                                        <input type="checkbox" checked={selected.has(o.id)} onChange={() => toggle(o.id)} disabled={!!o.problem} />
                                    </td>
                                    <td className="p-3">
                                        <button onClick={() => navigate(`/order-detail/${o.id}`)} className="font-semibold text-orange-600 hover:underline cursor-pointer">
                                            #{o.orderId}
                                        </button>
                                        <p className="text-xs text-gray-400">{o.status}</p>
                                        {o.problem && <p className="text-xs text-red-600 mt-1">{o.problem}</p>}
                                    </td>
                                    <td className="p-3">
                                        <p className="text-gray-800">{o.customerName || "—"}</p>
                                        <p className="text-xs text-gray-500">{o.phone}</p>
                                    </td>
                                    <td className="p-3 text-gray-700">{o.city || "—"}</td>
                                    <td className="p-3 text-xs text-gray-600">{o.paymentMethod} · {o.paymentStatus}</td>
                                    <td className="p-3 text-right font-semibold">{money(o.codAmount)}</td>
                                    <td className="p-3 text-xs text-gray-500">{new Date(o.createdAt).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                            <tr>
                                {tab === "cod" && (
                                    <th className="p-3 w-10">
                                        <input type="checkbox" checked={allSelected} onChange={toggleAll} disabled={!selectableIds.length} />
                                    </th>
                                )}
                                <th className="p-3 text-left">Order</th>
                                <th className="p-3 text-left">Status</th>
                                <th className="p-3 text-left">Consignment</th>
                                <th className="p-3 text-right">COD</th>
                                <th className="p-3 text-right">Collected</th>
                                <th className="p-3 text-right">Charge</th>
                                {tab !== "cod" && <th className="p-3 text-left">Issue</th>}
                                <th className="p-3 text-left">Updated</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(shipments?.data || []).map((s) => (
                                <tr key={s.id} className="border-t border-gray-100 hover:bg-gray-50 align-top">
                                    {tab === "cod" && (
                                        <td className="p-3 text-center">
                                            <input type="checkbox" checked={selected.has(s.id)} onChange={() => toggle(s.id)} />
                                        </td>
                                    )}
                                    <td className="p-3">
                                        <button onClick={() => navigate(`/order-detail/${s.orderId}`)} className="font-semibold text-orange-600 hover:underline cursor-pointer">
                                            #{s.orderCode}
                                        </button>
                                        <p className="text-xs text-gray-400">{s.recipientName}</p>
                                    </td>
                                    <td className="p-3">
                                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_CLS[s.status] || "bg-blue-50 text-blue-700"}`}>
                                            {s.status.replace(/_/g, " ").toLowerCase()}
                                        </span>
                                        {s.providerStatus && <p className="text-[11px] text-gray-400 mt-1">{s.providerStatus}</p>}
                                    </td>
                                    <td className="p-3 text-xs">
                                        {s.consignmentId || "—"}
                                        {s.trackingUrl && (
                                            <a href={s.trackingUrl} target="_blank" rel="noopener noreferrer" className="ml-1 inline-flex items-center gap-0.5 text-orange-600 hover:underline">
                                                {s.trackingCode} <FiExternalLink className="w-3 h-3" />
                                            </a>
                                        )}
                                    </td>
                                    <td className="p-3 text-right">{money(s.codAmount)}</td>
                                    <td className="p-3 text-right">{money(s.codCollectedAmount)}</td>
                                    <td className="p-3 text-right">{money(s.courierCharge)}</td>
                                    {tab !== "cod" && (
                                        <td className="p-3 text-xs text-red-600 max-w-xs">
                                            {s.needsAttention ? s.lastError || "Needs review" : ""}
                                        </td>
                                    )}
                                    <td className="p-3 text-xs text-gray-500">{new Date(s.updatedAt).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {!loading && total === 0 && <p className="text-sm text-gray-400 text-center py-10">Nothing here.</p>}
            </div>

            {pageCount > 1 && (
                <div className="flex items-center justify-end gap-2 text-sm">
                    <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="px-3 py-1.5 border border-gray-300 rounded-lg disabled:opacity-40 cursor-pointer">
                        Previous
                    </button>
                    <span className="text-gray-600">Page {page} of {pageCount} · {total} total</span>
                    <button onClick={() => setPage((p) => Math.min(pageCount, p + 1))} disabled={page >= pageCount} className="px-3 py-1.5 border border-gray-300 rounded-lg disabled:opacity-40 cursor-pointer">
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default CourierPage;
