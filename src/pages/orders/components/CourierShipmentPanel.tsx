import { useCallback, useEffect, useState } from "react";
import { FiTruck, FiRefreshCw, FiAlertTriangle, FiExternalLink, FiCopy, FiCheckCircle, FiX, FiLink } from "react-icons/fi";
import toast from "react-hot-toast";
import { useAPI } from "../../../hooks/useApi";

type ShipmentStatus =
    | "PENDING_DISPATCH" | "DISPATCH_FAILED" | "CANCELLED"
    | "IN_REVIEW" | "IN_TRANSIT" | "ON_HOLD" | "APPROVAL_PENDING"
    | "DELIVERED" | "PARTIAL_DELIVERED" | "RETURN_IN_TRANSIT" | "UNKNOWN";

interface ShipmentEvent {
    id: string;
    createdAt: string;
    source: string;
    providerStatus: string | null;
    internalStatus: string | null;
    message: string | null;
}

interface Shipment {
    id: string;
    provider: string;
    invoice: string;
    status: ShipmentStatus;
    providerStatus: string | null;
    consignmentId: string | null;
    trackingCode: string | null;
    trackingUrl: string | null;
    codAmount: string | number;
    codCollectedAmount: string | number | null;
    courierCharge: string | number | null;
    codSettledAt: string | null;
    codSettlementRef: string | null;
    attemptCount: number;
    nextAttemptAt: string | null;
    lastError: string | null;
    needsAttention: boolean;
    dispatchedAt: string | null;
    lastSyncedAt: string | null;
    createdAt: string;
    events?: ShipmentEvent[];
}

const STATUS_STYLE: Record<ShipmentStatus, { label: string; cls: string }> = {
    PENDING_DISPATCH: { label: "Booking in progress", cls: "bg-amber-50 text-amber-700 border-amber-200" },
    DISPATCH_FAILED: { label: "Booking failed", cls: "bg-red-50 text-red-700 border-red-200" },
    CANCELLED: { label: "Cancelled", cls: "bg-gray-100 text-gray-600 border-gray-200" },
    IN_REVIEW: { label: "In review (Steadfast)", cls: "bg-blue-50 text-blue-700 border-blue-200" },
    IN_TRANSIT: { label: "In transit", cls: "bg-blue-50 text-blue-700 border-blue-200" },
    ON_HOLD: { label: "On hold", cls: "bg-amber-50 text-amber-700 border-amber-200" },
    APPROVAL_PENDING: { label: "Approval pending", cls: "bg-amber-50 text-amber-700 border-amber-200" },
    DELIVERED: { label: "Delivered", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    PARTIAL_DELIVERED: { label: "Partially delivered", cls: "bg-orange-50 text-orange-700 border-orange-200" },
    RETURN_IN_TRANSIT: { label: "Returning to us", cls: "bg-purple-50 text-purple-700 border-purple-200" },
    UNKNOWN: { label: "Unknown", cls: "bg-gray-100 text-gray-700 border-gray-200" },
};

const BOOKABLE_ORDER_STATUSES = ["Pending", "Order Placed", "Processing"];
const SYNCABLE: ShipmentStatus[] = ["IN_REVIEW", "IN_TRANSIT", "ON_HOLD", "APPROVAL_PENDING", "UNKNOWN", "DELIVERED", "PARTIAL_DELIVERED", "RETURN_IN_TRANSIT"];

const money = (v: string | number | null | undefined) =>
    v === null || v === undefined || v === "" ? "—" : `৳${Number(v).toLocaleString("en-BD")}`;

const when = (v: string | null | undefined) => {
    if (!v) return "—";
    try {
        const d = new Date(v);
        if (Number.isNaN(d.getTime())) return "—";
        return new Intl.DateTimeFormat("en-GB", {
            timeZone: "Asia/Dhaka",
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
        }).format(d);
    } catch {
        return "—";
    }
};

interface Props {
    order: { id: string; orderId?: string; status: string; paymentMethod?: string; paymentStatus?: string };
    onOrderChanged: () => void | Promise<void>;
}

const CourierShipmentPanel = ({ order, onOrderChanged }: Props) => {
    const { fetchData, handleApiMutation, postMutation } = useAPI();
    const [shipments, setShipments] = useState<Shipment[]>([]);
    const [enabled, setEnabled] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState<string | null>(null);
    const [note, setNote] = useState("");
    const [showLink, setShowLink] = useState(false);
    const [linkCid, setLinkCid] = useState("");
    const [linkTracking, setLinkTracking] = useState("");
    const [settleRef, setSettleRef] = useState("");
    const [showSettle, setShowSettle] = useState(false);
    const [showHistory, setShowHistory] = useState(false);

    const load = useCallback(async () => {
        if (!order?.id) return;
        const [status, list] = (await Promise.all([
            fetchData({ apiUrl: "courier/status" }),
            fetchData({ apiUrl: `courier/orders/${order.id}/shipments` }),
        ])) as [any, Shipment[] | undefined];
        const isEn = status?.steadfastEnabled ?? status?.data?.steadfastEnabled;
        if (typeof isEn === "boolean") {
            setEnabled(isEn);
        }
        setShipments(Array.isArray(list) ? list : []);
        setLoading(false);
        // fetchData is recreated every render by useAPI; keying on the order id is intentional.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [order?.id]);

    useEffect(() => {
        load();
    }, [load]);

    const live = shipments.find((s) => s.status !== "CANCELLED") || null;
    const history = shipments.filter((s) => s !== live);

    // While a booking is queued for retry, refresh quietly.
    useEffect(() => {
        if (live?.status !== "PENDING_DISPATCH") return;
        const t = setInterval(load, 15000);
        return () => clearInterval(t);
    }, [live?.status, load]);

    const act = async (key: string, url: string, body: Record<string, unknown> = {}) => {
        setBusy(key);
        try {
            const res = await handleApiMutation({ mutation: postMutation, url, body, requiredFields: [], showSuccessMessage: true });
            if (res?.success) {
                await load();
                await onOrderChanged();
                return true;
            }
            return false;
        } finally {
            setBusy(null);
        }
    };

    const book = async () => {
        const ok = await act("book", `courier/orders/${order.id}/shipments`, note.trim() ? { note: note.trim() } : {});
        if (ok) setNote("");
    };

    const link = async () => {
        if (!/^\d+$/.test(linkCid.trim())) {
            toast.error("Consignment ID must be numeric.");
            return;
        }
        const ok = await act("link", `courier/shipments/${live!.id}/link`, {
            consignmentId: linkCid.trim(),
            ...(linkTracking.trim() ? { trackingCode: linkTracking.trim() } : {}),
        });
        if (ok) {
            setShowLink(false);
            setLinkCid("");
            setLinkTracking("");
        }
    };

    const settle = async () => {
        const ok = await act("settle", `courier/shipments/${live!.id}/cod-settled`, settleRef.trim() ? { reference: settleRef.trim() } : {});
        if (ok) {
            setShowSettle(false);
            setSettleRef("");
        }
    };

    const copy = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast.success(`${label} copied`);
    };

    const canBook = BOOKABLE_ORDER_STATUSES.includes(order.status);
    const isCod = (order.paymentMethod || "COD").toUpperCase() === "COD";
    const codPending = live && ["DELIVERED", "PARTIAL_DELIVERED"].includes(live.status) && Number(live.codAmount) > 0 && !live.codSettledAt;

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                    <FiTruck className="w-4 h-4 text-orange-500" /> Courier (Steadfast)
                </h3>
                {live && SYNCABLE.includes(live.status) && live.consignmentId && (
                    <button
                        onClick={() => act("sync", `courier/shipments/${live.id}/sync`)}
                        disabled={!!busy}
                        title="Fetch latest status from Steadfast"
                        className="text-xs flex items-center gap-1 text-gray-500 hover:text-orange-600 disabled:opacity-50 cursor-pointer"
                    >
                        <FiRefreshCw className={`w-3.5 h-3.5 ${busy === "sync" ? "animate-spin" : ""}`} /> Sync
                    </button>
                )}
            </div>

            {loading ? (
                <p className="text-sm text-gray-400">Loading…</p>
            ) : !live ? (
                <>
                    {enabled === false && (
                        <p className="text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-lg p-3 mb-3">
                            Steadfast integration is turned off on the server. Set the STEADFAST_* environment variables to enable it.
                        </p>
                    )}
                    {enabled && !canBook && (
                        <p className="text-xs text-gray-500 mb-3">
                            Confirm the order first: a parcel can be booked only when the order is <b>Order Placed</b> or <b>Processing</b>.
                        </p>
                    )}
                    {enabled && canBook && (
                        <>
                            <p className="text-xs text-gray-500 mb-2">
                                {isCod && order.paymentStatus !== "Paid"
                                    ? "Steadfast will collect the order total as cash on delivery."
                                    : "Prepaid order: booked with COD ৳0."}
                            </p>
                            <input
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                maxLength={250}
                                placeholder="Note for the rider (optional)"
                                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
                            />
                        </>
                    )}
                    <button
                        onClick={book}
                        disabled={!enabled || !canBook || !!busy}
                        className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold py-2.5 rounded-lg transition-all cursor-pointer"
                    >
                        {busy === "book" ? "Booking…" : "Book with Steadfast"}
                    </button>
                </>
            ) : (
                <div className="space-y-3">
                    <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full border ${STATUS_STYLE[live.status]?.cls}`}>
                        {STATUS_STYLE[live.status]?.label || live.status}
                        {live.providerStatus ? <span className="font-normal opacity-70"> · {live.providerStatus}</span> : null}
                    </span>

                    {(live.needsAttention || live.lastError) && (
                        <div className={`text-xs rounded-lg p-3 border flex gap-2 ${live.needsAttention ? "bg-red-50 border-red-200 text-red-700" : "bg-amber-50 border-amber-200 text-amber-700"}`}>
                            <FiAlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                            <div className="space-y-2">
                                <p>{live.lastError || "Needs review."}</p>
                                {live.status === "PENDING_DISPATCH" && live.nextAttemptAt && (
                                    <p className="opacity-80">Next automatic retry: {when(live.nextAttemptAt)} (attempt {live.attemptCount})</p>
                                )}
                                {live.needsAttention && live.status !== "DISPATCH_FAILED" && (
                                    <button
                                        onClick={() => act("resolve", `courier/shipments/${live.id}/resolve`)}
                                        disabled={!!busy}
                                        className="text-xs font-semibold underline cursor-pointer disabled:opacity-50"
                                    >
                                        Mark as resolved
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    <dl className="text-sm grid grid-cols-2 gap-x-3 gap-y-2">
                        <dt className="text-gray-500">Invoice</dt>
                        <dd className="text-gray-800 font-mono text-xs break-all">{live.invoice}</dd>
                        <dt className="text-gray-500">Consignment</dt>
                        <dd className="text-gray-800 flex items-center gap-1">
                            {live.consignmentId || "—"}
                            {live.consignmentId && (
                                <FiCopy className="w-3.5 h-3.5 text-gray-400 hover:text-orange-500 cursor-pointer" onClick={() => copy(live.consignmentId!, "Consignment ID")} />
                            )}
                        </dd>
                        <dt className="text-gray-500">Tracking</dt>
                        <dd className="text-gray-800">
                            {live.trackingUrl ? (
                                <a href={live.trackingUrl} target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline inline-flex items-center gap-1">
                                    {live.trackingCode} <FiExternalLink className="w-3 h-3" />
                                </a>
                            ) : (live.trackingCode || "—")}
                        </dd>
                        <dt className="text-gray-500">COD to collect</dt>
                        <dd className="text-gray-800">{money(live.codAmount)}</dd>
                        {live.codCollectedAmount !== null && (
                            <>
                                <dt className="text-gray-500">Collected</dt>
                                <dd className="text-gray-800">{money(live.codCollectedAmount)}</dd>
                            </>
                        )}
                        {live.courierCharge !== null && (
                            <>
                                <dt className="text-gray-500">Courier charge</dt>
                                <dd className="text-gray-800">{money(live.courierCharge)}</dd>
                            </>
                        )}
                        {live.codSettledAt && (
                            <>
                                <dt className="text-gray-500">COD settled</dt>
                                <dd className="text-emerald-700 text-xs">{when(live.codSettledAt)}{live.codSettlementRef ? ` · ${live.codSettlementRef}` : ""}</dd>
                            </>
                        )}
                        <dt className="text-gray-500">Last sync</dt>
                        <dd className="text-gray-600 text-xs">{when(live.lastSyncedAt)}</dd>
                    </dl>

                    {live.status === "RETURN_IN_TRANSIT" && (
                        <p className="text-xs text-purple-700 bg-purple-50 border border-purple-200 rounded-lg p-3">
                            Parcel is coming back. Stock is <b>not</b> restored yet: use <b>Process Return (RMA)</b> after you receive and inspect it.
                        </p>
                    )}

                    {/* Booking failed / queued */}
                    {(live.status === "DISPATCH_FAILED" || live.status === "PENDING_DISPATCH") && (
                        <div className="flex flex-col gap-2">
                            {live.status === "DISPATCH_FAILED" && (
                                <button
                                    onClick={() => act("retry", `courier/shipments/${live.id}/retry`)}
                                    disabled={!!busy}
                                    className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-sm font-semibold py-2 rounded-lg cursor-pointer"
                                >
                                    {busy === "retry" ? "Retrying…" : "Retry booking"}
                                </button>
                            )}
                            {live.status === "DISPATCH_FAILED" && (
                                <button
                                    onClick={() => setShowLink((v) => !v)}
                                    className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 hover:border-orange-400 text-gray-700 text-sm font-medium py-2 rounded-lg cursor-pointer"
                                >
                                    <FiLink className="w-4 h-4" /> Link existing consignment
                                </button>
                            )}
                            {showLink && (
                                <div className="border border-gray-200 rounded-lg p-3 space-y-2 bg-gray-50">
                                    <p className="text-xs text-gray-500">Use this when the parcel already exists in the Steadfast panel for invoice <b>{live.invoice}</b>.</p>
                                    <input value={linkCid} onChange={(e) => setLinkCid(e.target.value)} placeholder="Consignment ID (numbers)" className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2" />
                                    <input value={linkTracking} onChange={(e) => setLinkTracking(e.target.value)} placeholder="Tracking code (optional)" className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2" />
                                    <button onClick={link} disabled={!!busy} className="w-full bg-gray-800 hover:bg-gray-900 disabled:opacity-50 text-white text-sm font-semibold py-2 rounded-lg cursor-pointer">
                                        {busy === "link" ? "Linking…" : "Link consignment"}
                                    </button>
                                </div>
                            )}
                            <button
                                onClick={() => act("cancel", `courier/shipments/${live.id}/cancel`)}
                                disabled={!!busy}
                                className="w-full flex items-center justify-center gap-2 bg-red-50 border border-red-200 hover:bg-red-100 text-red-600 text-sm font-semibold py-2 rounded-lg disabled:opacity-50 cursor-pointer"
                            >
                                <FiX className="w-4 h-4" /> Cancel booking
                            </button>
                        </div>
                    )}

                    {/* COD settlement */}
                    {codPending && (
                        <div className="flex flex-col gap-2">
                            {!showSettle ? (
                                <button
                                    onClick={() => setShowSettle(true)}
                                    className="w-full flex items-center justify-center gap-2 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-700 text-sm font-semibold py-2 rounded-lg cursor-pointer"
                                >
                                    <FiCheckCircle className="w-4 h-4" /> Mark COD received from Steadfast
                                </button>
                            ) : (
                                <div className="border border-emerald-200 rounded-lg p-3 space-y-2 bg-emerald-50/50">
                                    <p className="text-xs text-gray-600">Confirm Steadfast has paid out this COD. The order will be marked <b>Paid</b>.</p>
                                    <input value={settleRef} onChange={(e) => setSettleRef(e.target.value)} placeholder="Steadfast payment ID (optional)" className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2" />
                                    <div className="flex gap-2">
                                        <button onClick={settle} disabled={!!busy} className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-semibold py-2 rounded-lg cursor-pointer">
                                            {busy === "settle" ? "Saving…" : "Confirm"}
                                        </button>
                                        <button onClick={() => setShowSettle(false)} className="px-3 text-sm text-gray-600 border border-gray-300 rounded-lg cursor-pointer">Cancel</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {live.consignmentId && (
                        <p className="text-[11px] text-gray-400">
                            To cancel a booked parcel, cancel it in the Steadfast merchant panel; the status syncs back here.
                        </p>
                    )}

                    {!!live.events?.length && (
                        <div>
                            <button onClick={() => setShowHistory((v) => !v)} className="text-xs text-gray-500 hover:text-orange-600 cursor-pointer">
                                {showHistory ? "Hide" : "Show"} courier history ({live.events.length})
                            </button>
                            {showHistory && (
                                <ol className="mt-2 border-l border-gray-200 pl-3 space-y-2">
                                    {live.events.map((e) => (
                                        <li key={e.id} className="text-xs">
                                            <p className="text-gray-800">{e.message || e.providerStatus || e.internalStatus}</p>
                                            <p className="text-gray-400">{when(e.createdAt)} · {e.source}</p>
                                        </li>
                                    ))}
                                </ol>
                            )}
                        </div>
                    )}
                </div>
            )}

            {history.length > 0 && (
                <p className="text-[11px] text-gray-400 mt-3">
                    {history.length} earlier cancelled booking{history.length > 1 ? "s" : ""} ({history.map((h) => h.invoice).join(", ")})
                </p>
            )}
        </div>
    );
};

export default CourierShipmentPanel;
