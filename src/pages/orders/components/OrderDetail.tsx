import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiMessageSquare, FiPrinter, FiShield, FiTrash2, FiCopy, FiAlertTriangle, FiCreditCard, FiRotateCcw, FiRepeat, FiLock } from "react-icons/fi";
import toast from "react-hot-toast";
import DeleteModal from "../../../components/modals/DeleteModal";
import { useAPI } from "../../../hooks/useApi";
import apiConfig from "../../../config/api.json";
import { formatDate } from "../../../utils/date-utils";
import { getDisplayCustomerName, getDisplayCustomerContact } from "../../../utils/order-utils";
import { saveBlacklistItem } from "../../../utils/blacklist-storage";
import { IBlacklistItem } from "../../settings/blacklist/BlacklistPage";
import PageHeader from "../../../components/cards/PageHeader";
import OrderStatusStepper from "./OrderStatusStepper";
import ProcessReturnModal from "./ProcessReturnModal";
import ExchangeModal from "./ExchangeModal";

const STATUS_OPTIONS = ["Pending", "Order Placed", "Processing", "Shipped", "Delivered", "Completed", "Rejected", "Failed"];

const OrderDetail = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams<{ id: string }>();
    const { fetchData, handleApiMutation, postMutation, patchMutation, handleDeleteAPI } = useAPI();

    const [order, setOrder] = useState<any>(location.state?.orderData || null);
    const [isLoading, setIsLoading] = useState(!location.state?.orderData);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
    const [exchangeItem, setExchangeItem] = useState<any | null>(null);

    const refetchOrder = async () => {
        const cleanId = (id || "").replace(/^#/, "").trim();
        if (cleanId) {
            const updated = await fetchData({ apiUrl: `${apiConfig.order.orderDetailUrl}/${cleanId}` });
            const parsed = parseOrderResponse(updated, cleanId);
            if (parsed) setOrder(parsed);
        }
    };

    const handleDeleteOrder = async () => {
        if (!order?.id) return;
        const apiResponse = await handleDeleteAPI({
            url: `${apiConfig.order.orderListUrl}/${order.id}`,
            showSuccessMessage: true,
        });
        if (apiResponse) {
            navigate("/orders");
        }
    };
    const [selectedStatus, setSelectedStatus] = useState<string>("");

    const copyToClipboard = (text: string, label: string) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        toast.success(`${label} copied to clipboard!`);
    };

    const handleAdminReview = async (paymentId: string, action: "APPROVE" | "REJECT" | "HOLD") => {
        try {
            const res = await handleApiMutation({
                mutation: postMutation,
                url: `payments/admin/${paymentId}/review`,
                body: { action, reason: `Action ${action} executed by Admin` },
                requiredFields: [],
                showSuccessMessage: true
            });
            if (res) {
                const cleanId = (id || "").replace(/^#/, "").trim();
                const updated = await fetchData({ apiUrl: `${apiConfig.order.orderDetailUrl}/${cleanId}` });
                const parsed = parseOrderResponse(updated, cleanId);
                if (parsed) setOrder(parsed);
            }
        } catch (err: any) {
            toast.error(err?.message || "Failed to process review action");
        }
    };

    const parseOrderResponse = (res: any, cleanId: string) => {
        if (!res) return null;

        // Direct single order object
        if (!Array.isArray(res) && !Array.isArray(res.data) && !Array.isArray(res.data?.data) && !Array.isArray(res.orderList)) {
            const single = res.data && typeof res.data === "object" ? res.data : res;
            if (single && (single.id || single.orderId)) {
                return single;
            }
        }

        let items: any[] = [];
        if (Array.isArray(res)) {
            items = res;
        } else if (Array.isArray(res.data)) {
            items = res.data;
        } else if (res.data && Array.isArray(res.data.data)) {
            items = res.data.data;
        } else if (Array.isArray(res.orderList)) {
            items = res.orderList;
        }

        if (items.length > 0) {
            const found = items.find((o: any) =>
                String(o.id || "").toLowerCase() === cleanId.toLowerCase() ||
                String(o.orderId || "").toLowerCase() === cleanId.toLowerCase() ||
                String(o.id || "").replace(/^#/, "").toLowerCase() === cleanId.toLowerCase() ||
                String(o.orderId || "").replace(/^#/, "").toLowerCase() === cleanId.toLowerCase()
            );
            return found || null;
        }

        return null;
    };

    // Fetch order from API if not passed via navigation state
    useEffect(() => {
        if (!order && id) {
            setIsLoading(true);
            const cleanId = String(id).replace(/^#/, "").trim();

            // Try direct single order lookup first
            fetchData({ apiUrl: `${apiConfig.order.orderDetailUrl}/${cleanId}` })
                .then(async (directRes: any) => {
                    let targetOrder = parseOrderResponse(directRes, cleanId);
                    if (!targetOrder) {
                        const res: any = await fetchData({ apiUrl: `${apiConfig.order.orderListUrl}?orderId=${cleanId}` });
                        targetOrder = parseOrderResponse(res, cleanId);
                    }
                    if (!targetOrder) {
                        const idRes: any = await fetchData({ apiUrl: `${apiConfig.order.orderListUrl}?id=${cleanId}` });
                        targetOrder = parseOrderResponse(idRes, cleanId);
                    }

                    if (targetOrder) {
                        setOrder(targetOrder);
                        setSelectedStatus(targetOrder.status || "");
                    }
                })
                .catch((err: any) => console.error("Failed to fetch order detail:", err))
                .finally(() => setIsLoading(false));
        } else if (order) {
            setSelectedStatus(order.status || "");
        }
    }, [id]);

    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");
    const [rejectionMessage, setRejectionMessage] = useState("");

    // Block Customer Modal State
    const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
    const [blockSeverity, setBlockSeverity] = useState<"HARD_BLOCK" | "SUSPICIOUS_FLAG">("HARD_BLOCK");
    const [blockReason, setBlockReason] = useState("FRAUD_HISTORY");
    const [blockNote, setBlockNote] = useState("");

    const handleOpenBlockModal = () => {
        setBlockNote(`Blocked directly from Order #${order?.orderId || order?.id}`);
        setIsBlockModalOpen(true);
    };

    const handleConfirmBlock = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!order) return;
        const name = getDisplayCustomerName(order);
        const contact = getDisplayCustomerContact(order);
        const email = order.user?.email || order.customerEmail || order.email;
        const phone = contact || order.user?.phone || order.phone;

        const newItem: Partial<IBlacklistItem> = {
            subjectType: 'PHONE',
            customerName: name !== 'Unknown Customer' ? name : undefined,
            customerEmail: email || undefined,
            displayValue: phone || name,
            severity: blockSeverity,
            reasonCode: blockReason as any,
            note: blockNote,
            status: 'ACTIVE',
        };

        await saveBlacklistItem(newItem);
        toast.success(`Customer "${name}" (${phone || 'Target'}) added to Blacklist successfully!`);

        setOrder({
            ...order,
            isBlacklisted: blockSeverity === 'HARD_BLOCK',
            isSuspicious: blockSeverity === 'SUSPICIOUS_FLAG',
            riskLevel: blockSeverity === 'HARD_BLOCK' ? 'CRITICAL' : 'HIGH',
            riskScore: blockSeverity === 'HARD_BLOCK' ? 100 : 60,
            policyDecision: blockSeverity === 'HARD_BLOCK' ? 'HARD_BLOCK' : 'MANUAL_REVIEW',
            fulfillmentHold: true,
            riskReviewStatus: blockSeverity === 'HARD_BLOCK' ? 'HARD_BLOCKED' : 'MANUAL_REVIEW',
        });

        setIsBlockModalOpen(false);
    };

    const REJECTION_REASONS = [
        "Product unavailable",
        "Out of stock",
        "Delivery unavailable",
        "Customer information issue",
        "Payment issue",
        "Other"
    ];

    const handleStatusUpdate = async () => {
        if (!selectedStatus || selectedStatus === order?.status) return;

        if (selectedStatus === "Rejected" && !isRejectModalOpen) {
            setIsRejectModalOpen(true);
            return;
        }

        setIsUpdatingStatus(true);
        try {
            const bodyPayload: any = { newStatus: selectedStatus, status: selectedStatus };
            if (selectedStatus === "Rejected") {
                const effectiveReason = rejectionReason || (rejectionMessage.trim() ? "Other" : "");
                if (!effectiveReason) {
                    alert("Please select a reason or write a message for rejecting this order.");
                    setIsUpdatingStatus(false);
                    return;
                }
                bodyPayload.rejectionReason = effectiveReason;
                bodyPayload.rejectionMessage = rejectionMessage.trim();
                bodyPayload.note = `Reason: ${effectiveReason}${rejectionMessage.trim() ? ` - ${rejectionMessage.trim()}` : ""}`;
            }

            const result = await handleApiMutation({
                // @ts-ignore
                mutation: patchMutation,
                url: `${apiConfig.order.orderDetailUrl}/${order.id}/status`,
                body: bodyPayload,
                showSuccessMessage: true,
                showErrorMessage: true,
                requiredFields: [],
            });
            if (result?.success || result?.data) {
                setOrder((prev: any) => ({
                    ...prev,
                    status: selectedStatus,
                    rejectionReason: bodyPayload.rejectionReason,
                    rejectionMessage: bodyPayload.rejectionMessage
                }));
                setIsRejectModalOpen(false);

                if (typeof window !== "undefined" && "BroadcastChannel" in window) {
                    try {
                        const bc = new BroadcastChannel("fashion_time_notifications");
                        bc.postMessage({ type: "ORDER_STATUS_CHANGED", orderId: order.orderId || order.id, status: selectedStatus });
                        bc.close();
                    } catch {}
                }
            }
        } catch (err) {
            console.error("Status update failed:", err);
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    const handleChatWithCustomer = () => {
        navigate("/chat", {
            state: {
                autoSelectCustomerId: order?.user?.id,
                prefillMessage: `Hi, regarding your order #${order?.orderId}...`,
            },
        });
    };

    const handlePrint = () => {
        window.print();
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
                Loading order details...
            </div>
        );
    }

    if (!order) {
        return (
            <div className="p-6 bg-white text-center text-red-500 font-semibold rounded-lg border border-gray-200">
                Order data not found. Please go back to the order list.
            </div>
        );
    }

    const orderItems = order.orderSummaries || [];
    const paymentStatusColor =
        order.paymentStatus === "Paid"
            ? "bg-green-100 text-green-800"
            : order.paymentStatus === "Review Required"
            ? "bg-amber-100 text-amber-800 border border-amber-300 font-bold"
            : order.paymentStatus === "Refunded" || order.paymentStatus === "Partially Refunded"
            ? "bg-blue-100 text-blue-800"
            : "bg-red-100 text-red-800";
    const orderStatusColor =
        order.status === "Completed" || order.status === "Order Placed"
            ? "bg-green-100 text-green-800"
            : order.status === "Pending"
            ? "bg-yellow-100 text-yellow-800"
            : order.status === "Failed" || order.status === "Rejected"
            ? "bg-red-100 text-red-800"
            : "bg-blue-100 text-blue-800";

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <PageHeader
                    headerTitle="Order Detail"
                    headerDescription={`Viewing order #${order.orderId}`}
                />
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsDeleteModalOpen(true)}
                        className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 bg-red-50 border border-red-200 hover:border-red-300 px-4 py-2 rounded-lg transition-all cursor-pointer font-medium"
                    >
                        <FiTrash2 className="w-4 h-4 text-red-600" />
                        Delete Order
                    </button>
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-orange-500 border border-gray-300 hover:border-orange-400 px-4 py-2 rounded-lg transition-all cursor-pointer"
                    >
                        <FiArrowLeft className="w-4 h-4" />
                        Back to Orders
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-5">
                {/* Left Column — Order Info */}
                <div className="col-span-12 xl:col-span-8 flex flex-col gap-5">

                    {/* Status Timeline */}
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                        <h3 className="text-base font-semibold text-gray-800 mb-1">Order Status</h3>
                        <p className="text-xs text-gray-400 mb-3">Track the current stage of this order</p>
                        <OrderStatusStepper currentStatus={order.status} />
                    </div>

                    {/* Order Items Table */}
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                        {(() => {
                            const isOrderExchanged = Boolean(
                                order.isExchanged ||
                                (order.exchangeCount && order.exchangeCount >= 1) ||
                                orderItems.some((item: any) => item.isExchanged || (item.exchangeCount && item.exchangeCount >= 1))
                            );

                            return (
                                <>
                                    <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                                        <div className="flex items-center gap-2.5">
                                            <h3 className="text-base font-semibold text-gray-800">Order Items</h3>
                                            {isOrderExchanged && (
                                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                                                    <FiLock className="w-3 h-3 text-amber-600" /> 1-Time Exchange Used (Order Locked)
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm">
                                            <thead>
                                                <tr className="bg-gray-50 text-gray-600 border-b border-gray-200">
                                                    <th className="px-4 py-3 text-left">Product</th>
                                                    <th className="px-4 py-3 text-center">Qty</th>
                                                    <th className="px-4 py-3 text-center">Price</th>
                                                    <th className="px-4 py-3 text-right">Subtotal</th>
                                                    <th className="px-4 py-3 text-center">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {orderItems.length > 0 ? (
                                                    orderItems.map((item: any) => {
                                                        const itemSubtotal = item.subtotal !== undefined ? Number(item.subtotal) : (Number(item.price || 0) * Number(item.quantity || 1));
                                                        const itemSize = item.selectedSize || item.size;

                                                        return (
                                                            <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                                                <td className="px-4 py-3">
                                                                    <div className="flex items-center gap-3">
                                                                        <img
                                                                            src={item.productImage}
                                                                            alt={item.productName}
                                                                            className="w-12 h-12 object-cover rounded-lg border border-gray-200 shrink-0"
                                                                        />
                                                                        <div className="min-w-0">
                                                                            <span className="font-medium text-gray-800 block truncate">{item.productName}</span>
                                                                            <span className="text-xs text-gray-500 inline-flex items-center gap-1.5 mt-0.5 flex-wrap">
                                                                                Size: <span className="font-semibold text-gray-700 bg-gray-100 px-1.5 py-0.2 rounded border border-gray-200 text-[11px]">{itemSize || "Standard"}</span>
                                                                                {(item.isExchanged || item.exchangeCount >= 1) && (
                                                                                    <span className="text-[10px] text-amber-800 bg-amber-100/80 border border-amber-300 px-1.5 py-0.5 rounded font-medium inline-flex items-center gap-1">
                                                                                        <FiRepeat className="w-2.5 h-2.5 text-amber-700" />
                                                                                        Exchanged (Orig: {item.originalSize || "Previous"})
                                                                                    </span>
                                                                                )}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="px-4 py-3 text-center text-gray-600">{item.quantity}</td>
                                                                <td className="px-4 py-3 text-center text-gray-600">৳{Number(item.price).toFixed(2)}</td>
                                                                <td className="px-4 py-3 text-right font-semibold text-gray-800">
                                                                    ৳{itemSubtotal.toFixed(2)}
                                                                </td>
                                                                <td className="px-4 py-3 text-center">
                                                                    {order.status !== "Cancelled" && order.status !== "Rejected" && order.status !== "Failed" && (
                                                                        isOrderExchanged ? (
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => toast(`This order has already used its 1 allowed exchange policy (Order #${order.orderId}). Store policy allows maximum 1 exchange per order.`, { icon: '🔒' })}
                                                                                className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 rounded-md font-medium transition cursor-pointer"
                                                                                title="This order has already used its 1-time exchange limit. Store policy: Maximum 1 exchange per order."
                                                                            >
                                                                                <FiLock className="w-3.5 h-3.5 text-amber-600" />
                                                                                Already Exchanged
                                                                            </button>
                                                                        ) : (
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => setExchangeItem(item)}
                                                                                className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-md font-semibold transition cursor-pointer"
                                                                                title="Exchange variant or size (Allowed 1 time for this order)"
                                                                            >
                                                                                <FiRepeat className="w-3.5 h-3.5 text-amber-600" />
                                                                                Exchange
                                                                            </button>
                                                                        )
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })
                                                ) : (
                                                    <tr>
                                                        <td colSpan={5} className="px-4 py-6 text-center text-gray-400 italic">
                                                            No items found for this order.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                            {/* Totals */}
                                            <tfoot>
                                                {(() => {
                                                    const calculatedItemsSubtotal = orderItems.reduce((acc: number, item: any) => {
                                                        const sub = item.subtotal !== undefined ? Number(item.subtotal) : (Number(item.price || 0) * Number(item.quantity || 1));
                                                        return acc + sub;
                                                    }, 0);
                                                    const displayedSubtotal = order.subtotal !== undefined && order.subtotal !== null ? Number(order.subtotal) : calculatedItemsSubtotal;
                                                    const delivery = Number(order.deliveryCharge || 0);
                                                    const discount = Number(order.discountAmount || 0);

                                                    return (
                                                        <>
                                                            <tr>
                                                                <td colSpan={3} className="px-4 py-2 text-right text-sm text-gray-500">Sub Total</td>
                                                                <td className="px-4 py-2 text-right font-semibold text-gray-700">৳{displayedSubtotal.toFixed(2)}</td>
                                                                <td></td>
                                                            </tr>
                                                            {delivery > 0 && (
                                                                <tr>
                                                                    <td colSpan={3} className="px-4 py-2 text-right text-sm text-gray-500">Delivery Charge</td>
                                                                    <td className="px-4 py-2 text-right font-semibold text-gray-700">৳{delivery.toFixed(2)}</td>
                                                                    <td></td>
                                                                </tr>
                                                            )}
                                                            {discount > 0 && (
                                                                <tr>
                                                                    <td colSpan={3} className="px-4 py-2 text-right text-sm text-orange-600">Discount</td>
                                                                    <td className="px-4 py-2 text-right font-semibold text-orange-600">-৳{discount.toFixed(2)}</td>
                                                                    <td></td>
                                                                </tr>
                                                            )}
                                                            <tr className="border-t border-gray-200">
                                                                <td colSpan={3} className="px-4 py-3 text-right text-base font-bold text-gray-800">Total Amount</td>
                                                                <td className="px-4 py-3 text-right text-base font-bold text-orange-600">৳{Number(order.totalAmount ?? 0).toFixed(2)}</td>
                                                                <td></td>
                                                            </tr>
                                                        </>
                                                    );
                                                })()}
                                            </tfoot>
                                        </table>
                                    </div>
                                </>
                            );
                        })()}
                    </div>
                </div>

                {/* Right Column — Customer & Actions */}
                <div className="col-span-12 xl:col-span-4 flex flex-col gap-5">

                    {/* Customer Info */}
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                        <h3 className="text-base font-semibold text-gray-800 mb-4">Customer</h3>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-11 h-11 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-lg shrink-0">
                                {getDisplayCustomerName(order).charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900">{getDisplayCustomerName(order)}</p>
                                <p className="text-xs text-gray-500">{order.shippingAddress?.email || order.user?.email || order.customerEmail || order.email || "—"}</p>
                            </div>
                        </div>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Contact / Phone</span>
                                <span className="font-medium text-gray-800">{getDisplayCustomerContact(order) || "—"}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Order Date</span>
                                <span className="font-medium text-gray-800">{formatDate(order.createdAt)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Customer Risk & Manual Review Card */}
                    {(() => {
                        const isBlacklisted = Boolean(order.isBlacklisted || order.riskLevel === 'CRITICAL');
                        const isSuspicious = Boolean(!isBlacklisted && (order.isSuspicious || order.riskLevel === 'HIGH'));
                        const effectiveRiskLevel = isBlacklisted ? 'CRITICAL' : (isSuspicious ? 'HIGH' : (order.riskLevel || 'LOW'));
                        const effectiveRiskScore = isBlacklisted ? 100 : (isSuspicious ? Math.max(order.riskScore ?? 0, 50) : (order.riskScore ?? 0));
                        const effectivePolicyDecision = isBlacklisted ? 'HARD_BLOCK' : (isSuspicious ? 'MANUAL_REVIEW' : (order.policyDecision || 'ALLOW'));
                        const effectiveFulfillmentHold = isBlacklisted || isSuspicious || order.fulfillmentHold;

                        return (
                            <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                                        <span className={`w-2.5 h-2.5 rounded-full inline-block ${isBlacklisted ? 'bg-red-600 animate-pulse' : 'bg-red-500'}`}></span>
                                        Customer Risk Protection
                                    </h3>
                                    <span className={`px-2 py-0.5 text-xs font-semibold rounded ${
                                        effectiveRiskLevel === 'CRITICAL' || effectiveRiskLevel === 'HIGH'
                                            ? 'bg-red-100 text-red-800'
                                            : effectiveRiskLevel === 'MEDIUM'
                                            ? 'bg-yellow-100 text-yellow-800'
                                            : 'bg-green-100 text-green-800'
                                    }`}>
                                        {effectiveRiskLevel} RISK {isBlacklisted && '(BLACK-LISTED)'}
                                    </span>
                                </div>

                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500">Risk Score</span>
                                        <span className="font-bold text-gray-900">{effectiveRiskScore} / 100</span>
                                    </div>

                                    <div className="w-full bg-gray-100 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full ${
                                                effectiveRiskScore >= 70
                                                    ? 'bg-red-600'
                                                    : effectiveRiskScore >= 50
                                                    ? 'bg-orange-500'
                                                    : effectiveRiskScore >= 30
                                                    ? 'bg-yellow-500'
                                                    : 'bg-green-500'
                                            }`}
                                            style={{ width: `${Math.min(100, Math.max(5, effectiveRiskScore))}%` }}
                                        ></div>
                                    </div>

                                    <div className="flex justify-between items-center pt-1">
                                        <span className="text-gray-500">Policy Decision</span>
                                        <span className={`font-semibold ${isBlacklisted ? 'text-red-700 font-bold' : 'text-gray-800'}`}>
                                            {effectivePolicyDecision}
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500">Fulfillment Hold</span>
                                        <span className={`font-semibold text-xs px-2 py-0.5 rounded ${
                                            effectiveFulfillmentHold
                                                ? 'bg-red-100 text-red-700 border border-red-200'
                                                : 'bg-gray-100 text-gray-700'
                                        }`}>
                                            {effectiveFulfillmentHold ? 'HELD (Fulfillment Restricted)' : 'CLEARED (No Hold)'}
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500">Review Status</span>
                                        <span className="font-medium text-xs text-gray-700">
                                            {isBlacklisted ? 'HARD_BLOCKED' : (order.riskReviewStatus || 'NOT_REQUIRED')}
                                        </span>
                                    </div>
                                </div>

                        {/* Signals breakdown */}
                        {order.riskSnapshot?.signals && order.riskSnapshot.signals.length > 0 && (
                            <div className="pt-2 border-t border-gray-100">
                                <p className="text-xs font-semibold text-gray-600 mb-1.5">Detected Risk Signals:</p>
                                <div className="space-y-1">
                                    {order.riskSnapshot.signals.map((sig: any, idx: number) => (
                                        <div key={idx} className="flex justify-between text-xs bg-gray-50 p-1.5 rounded border border-gray-100">
                                            <span className="text-gray-700 font-medium">{sig.code}</span>
                                            <span className="font-bold text-red-600">+{sig.weight}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Manual Review Actions */}
                        {order.fulfillmentHold && order.riskReviewStatus === 'PENDING_REVIEW' && (
                            <div className="pt-3 border-t border-gray-200 space-y-2">
                                <p className="text-xs font-semibold text-gray-800">Manual Risk Review Actions:</p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={async () => {
                                            if (window.confirm('Approve order risk and release fulfillment hold?')) {
                                                setOrder({
                                                    ...order,
                                                    fulfillmentHold: false,
                                                    riskReviewStatus: 'APPROVED',
                                                });
                                                alert('Order risk approved successfully. Fulfillment hold released.');
                                            }
                                        }}
                                        className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold py-2 rounded-lg transition-colors"
                                    >
                                        Approve & Release Hold
                                    </button>
                                    <button
                                        onClick={async () => {
                                            if (window.confirm('Reject risk review and keep fulfillment held?')) {
                                                setOrder({
                                                    ...order,
                                                    riskReviewStatus: 'REJECTED',
                                                });
                                                alert('Risk review rejected.');
                                            }
                                        }}
                                        className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold py-2 rounded-lg transition-colors"
                                    >
                                        Reject Review
                                    </button>
                                </div>
                            </div>
                        )}
                        {/* Direct Block Customer Action */}
                        <div className="pt-3 border-t border-gray-200">
                            <button
                                onClick={handleOpenBlockModal}
                                className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-semibold py-2 rounded-lg transition-colors cursor-pointer"
                            >
                                <FiShield className="w-4 h-4 text-red-600" />
                                Block Customer / Add to Blacklist
                            </button>
                        </div>
                        </div>
                    );
                })()}

                    {/* Payment & Gateway Audit Card */}
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                                <FiCreditCard className="text-orange-500" /> Payment & Gateway
                            </h3>
                            {(() => {
                                const latestPay = order.payments && order.payments.length > 0 ? order.payments[0] : null;
                                const method = (latestPay?.paymentMethod || order.paymentMethod || "COD").toUpperCase();
                                if (method.includes("BKASH")) return <span className="text-[11px] font-bold bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full">bKash</span>;
                                if (method.includes("NAGAD")) return <span className="text-[11px] font-bold bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">Nagad</span>;
                                if (method.includes("ROCKET")) return <span className="text-[11px] font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">Rocket</span>;
                                if (method.includes("STRIPE") || method.includes("ONLINE")) return <span className="text-[11px] font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">Stripe Card</span>;
                                return <span className="text-[11px] font-bold bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">{method}</span>;
                            })()}
                        </div>

                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500">Order ID</span>
                                <span className="font-semibold text-orange-600">#{order.orderId}</span>
                            </div>

                            {/* Payment Status & Order Status */}
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500">Payment Status</span>
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${paymentStatusColor}`}>
                                    {order.paymentStatus}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500">Order Status</span>
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${orderStatusColor}`}>
                                    {order.status}
                                </span>
                            </div>

                            {/* Gateway Metadata from latest payment */}
                            {(() => {
                                const latestPay = order.payments && order.payments.length > 0 ? order.payments[0] : null;
                                if (!latestPay) return null;

                                return (
                                    <div className="pt-2 border-t border-gray-100 space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-500 text-xs">Gateway</span>
                                            <span className="font-semibold text-xs text-gray-800">{latestPay.gateway}</span>
                                        </div>
                                        {latestPay.tranId && (
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-500 text-xs">SSL Tran ID</span>
                                                <button
                                                    onClick={() => copyToClipboard(latestPay.tranId, "SSL Tran ID")}
                                                    className="flex items-center gap-1 font-mono text-xs text-gray-700 bg-gray-100 hover:bg-gray-200 px-2 py-0.5 rounded truncate max-w-[170px] cursor-pointer"
                                                    title={latestPay.tranId}
                                                >
                                                    <span className="truncate">{latestPay.tranId}</span>
                                                    <FiCopy className="w-3 h-3 text-gray-500 shrink-0" />
                                                </button>
                                            </div>
                                        )}
                                        {latestPay.bankTranId && (
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-500 text-xs font-semibold text-pink-700">bKash/Nagad TrxID</span>
                                                <button
                                                    onClick={() => copyToClipboard(latestPay.bankTranId, "Bank/MFS TrxID")}
                                                    className="flex items-center gap-1 font-mono text-xs text-pink-700 bg-pink-50 hover:bg-pink-100 border border-pink-200 px-2 py-0.5 rounded truncate max-w-[170px] cursor-pointer"
                                                    title={latestPay.bankTranId}
                                                >
                                                    <span className="truncate">{latestPay.bankTranId}</span>
                                                    <FiCopy className="w-3 h-3 text-pink-600 shrink-0" />
                                                </button>
                                            </div>
                                        )}
                                        {latestPay.valId && (
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-500 text-xs">Val ID</span>
                                                <button
                                                    onClick={() => copyToClipboard(latestPay.valId, "Validation ID")}
                                                    className="flex items-center gap-1 font-mono text-xs text-gray-700 bg-gray-100 hover:bg-gray-200 px-2 py-0.5 rounded truncate max-w-[170px] cursor-pointer"
                                                    title={latestPay.valId}
                                                >
                                                    <span className="truncate">{latestPay.valId}</span>
                                                    <FiCopy className="w-3 h-3 text-gray-500 shrink-0" />
                                                </button>
                                            </div>
                                        )}
                                        {latestPay.paidAt && (
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-gray-500">Paid At</span>
                                                <span className="text-gray-700">{formatDate(latestPay.paidAt)}</span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })()}

                            {/* Legacy Stripe identifiers */}
                            {order.stripeSessionId && !order.payments?.length && (
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500">Stripe Session</span>
                                    <span className="font-mono text-xs text-gray-700 bg-gray-100 px-2 py-0.5 rounded truncate max-w-[180px]" title={order.stripeSessionId}>
                                        {order.stripeSessionId}
                                    </span>
                                </div>
                            )}
                            {order.paymentIntentId && !order.payments?.length && (
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500">Payment Intent</span>
                                    <span className="font-mono text-xs text-gray-700 bg-gray-100 px-2 py-0.5 rounded truncate max-w-[180px]" title={order.paymentIntentId}>
                                        {order.paymentIntentId}
                                    </span>
                                </div>
                            )}

                            {(order.couponCode || Number(order.discountAmount) > 0) && (
                                <div className="flex justify-between items-center bg-orange-50 p-2 rounded-lg border border-orange-200">
                                    <span className="text-xs font-semibold text-orange-800">Coupon ({order.couponCode || "Applied"})</span>
                                    <span className="font-bold text-xs text-orange-700">-৳{Number(order.discountAmount || 0).toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                                <span className="text-gray-500 font-semibold">Total</span>
                                <span className="font-bold text-base text-gray-900">৳{Number(order.totalAmount ?? 0).toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Admin Review Action Alert Box if flagged */}
                        {(() => {
                            const latestPay = order.payments && order.payments.length > 0 ? order.payments[0] : null;
                            const isReview = order.paymentStatus === "Review Required" || latestPay?.needsAdminReview;
                            if (!isReview || !latestPay) return null;

                            return (
                                <div className="mt-4 p-3.5 bg-amber-50 border border-amber-300 rounded-xl space-y-2.5">
                                    <div className="flex items-center gap-2 text-amber-800 font-bold text-xs">
                                        <FiAlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                                        Manual Review: {latestPay.adminReviewReason || "Fraud Risk / Late Payment"}
                                    </div>
                                    <p className="text-[11px] text-amber-700">
                                        Verify with customer or gateway records before approving order fulfillment.
                                    </p>
                                    <div className="flex items-center gap-2 pt-1">
                                        <button
                                            onClick={() => handleAdminReview(latestPay.id, "APPROVE")}
                                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-1.5 px-2 rounded-lg transition-colors cursor-pointer"
                                        >
                                            Verify & Approve
                                        </button>
                                        <button
                                            onClick={() => handleAdminReview(latestPay.id, "REJECT")}
                                            className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold py-1.5 px-2 rounded-lg transition-colors cursor-pointer"
                                        >
                                            Reject / Refund
                                        </button>
                                        <button
                                            onClick={() => handleAdminReview(latestPay.id, "HOLD")}
                                            className="bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-semibold py-1.5 px-2.5 rounded-lg transition-colors cursor-pointer"
                                        >
                                            Hold
                                        </button>
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Multiple Payment Attempts Breakdown if > 1 attempts */}
                        {order.payments && order.payments.length > 1 && (
                            <div className="mt-4 pt-3 border-t border-gray-100">
                                <span className="text-xs font-bold text-gray-700 block mb-2">
                                    All Payment Attempts ({order.payments.length})
                                </span>
                                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                                    {order.payments.map((att: any, idx: number) => (
                                        <div key={att.id || idx} className="text-xs p-2 bg-gray-50 rounded-lg flex items-center justify-between">
                                            <div>
                                                <span className="font-semibold text-gray-700">Attempt #{order.payments.length - idx}</span>
                                                <span className="text-[10px] text-gray-500 block">{att.gateway} - {att.paymentMethod || "UNKNOWN"}</span>
                                            </div>
                                            <div className="text-right">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${att.status === "PAID" ? "bg-emerald-100 text-emerald-800" : att.status === "FAILED" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"}`}>
                                                    {att.status}
                                                </span>
                                                <span className="text-[10px] text-gray-500 block">৳{att.amount}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Update Status */}
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                        <h3 className="text-base font-semibold text-gray-800 mb-3">Update Status</h3>
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white mb-3 cursor-pointer"
                        >
                            {STATUS_OPTIONS.map((s) => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                        <button
                            onClick={handleStatusUpdate}
                            disabled={isUpdatingStatus || selectedStatus === order.status}
                            className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold py-2.5 rounded-lg transition-all cursor-pointer"
                        >
                            {isUpdatingStatus ? "Updating..." : "Save Status"}
                        </button>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={handleChatWithCustomer}
                            className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 hover:border-orange-400 hover:text-orange-500 text-gray-700 text-sm font-semibold py-2.5 rounded-lg transition-all cursor-pointer"
                        >
                            <FiMessageSquare className="w-4 h-4" />
                            Chat with Customer
                        </button>
                        <button
                            onClick={handlePrint}
                            className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 hover:border-gray-400 text-gray-600 text-sm font-medium py-2.5 rounded-lg transition-all cursor-pointer"
                        >
                            <FiPrinter className="w-4 h-4" />
                            Print Invoice
                        </button>
                        {order.status !== "Cancelled" && order.status !== "Rejected" && order.status !== "Failed" && (
                            <button
                                onClick={() => setIsReturnModalOpen(true)}
                                className="w-full flex items-center justify-center gap-2 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 text-sm font-semibold py-2.5 rounded-lg transition-all cursor-pointer"
                            >
                                <FiRotateCcw className="w-4 h-4 text-indigo-600" />
                                Process Return (RMA)
                            </button>
                        )}
                        <button
                            onClick={() => setIsDeleteModalOpen(true)}
                            className="w-full flex items-center justify-center gap-2 bg-red-50 border border-red-200 hover:bg-red-100 text-red-600 text-sm font-semibold py-2.5 rounded-lg transition-all cursor-pointer"
                        >
                            <FiTrash2 className="w-4 h-4 text-red-600" />
                            Delete Order
                        </button>
                    </div>
                </div>
            </div>

            {/* Rejection Modal */}
            {isRejectModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
                        <h3 className="text-lg font-bold text-red-600">Reject Order #{order.orderId}</h3>
                        <div className="space-y-3 text-left">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">
                                    Rejection Reason <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-red-400 outline-none"
                                >
                                    <option value="">Select reason...</option>
                                    {REJECTION_REASONS.map((r) => (
                                        <option key={r} value={r}>
                                            {r}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">
                                    Additional Comment / Message for Customer
                                </label>
                                <textarea
                                    rows={3}
                                    value={rejectionMessage}
                                    onChange={(e) => setRejectionMessage(e.target.value)}
                                    placeholder="Explain why this order is being rejected..."
                                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-red-400 outline-none resize-none"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                disabled={isUpdatingStatus}
                                onClick={() => {
                                    setIsRejectModalOpen(false);
                                    setSelectedStatus(order.status);
                                }}
                                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-lg cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                disabled={isUpdatingStatus || (!rejectionReason && !rejectionMessage.trim())}
                                onClick={handleStatusUpdate}
                                className="px-5 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold text-xs rounded-lg cursor-pointer transition"
                            >
                                {isUpdatingStatus ? "Rejecting..." : "Confirm Rejection"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Quick Block Modal */}
            {isBlockModalOpen && order && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl space-y-4 border border-gray-200">
                        <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                            <FiShield className="w-5 h-5 text-red-600" />
                            <h3 className="text-lg font-bold text-gray-900">Block Customer</h3>
                        </div>

                        <div className="bg-red-50 border border-red-100 rounded-lg p-3 text-xs text-red-800 space-y-1">
                            <p className="font-semibold">Customer Information:</p>
                            <p><strong>Name:</strong> {getDisplayCustomerName(order)}</p>
                            <p><strong>Phone:</strong> {getDisplayCustomerContact(order) || 'N/A'}</p>
                            <p><strong>Email:</strong> {order.user?.email || order.customerEmail || order.email || 'N/A'}</p>
                            <p><strong>Order ID:</strong> #{order.orderId || order.id}</p>
                        </div>

                        <form onSubmit={handleConfirmBlock} className="space-y-3 text-left">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">
                                    Enforcement Severity
                                </label>
                                <select
                                    value={blockSeverity}
                                    onChange={(e) => setBlockSeverity(e.target.value as any)}
                                    className="w-full border border-gray-300 rounded-lg p-2 text-xs bg-white focus:ring-1 focus:ring-red-500 outline-none"
                                >
                                    <option value="HARD_BLOCK">HARD BLOCK (Refuse Checkout & Fraud Prevention)</option>
                                    <option value="SUSPICIOUS_FLAG">SUSPICIOUS FLAG (Allow Checkout + Force Manual Review)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">
                                    Reason Code
                                </label>
                                <select
                                    value={blockReason}
                                    onChange={(e) => setBlockReason(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg p-2 text-xs bg-white focus:ring-1 focus:ring-red-500 outline-none"
                                >
                                    <option value="FRAUD_HISTORY">FRAUD_HISTORY (Repeated fake orders or fraud)</option>
                                    <option value="CHARGEBACK_RISK">CHARGEBACK_RISK (High chargeback / dispute risk)</option>
                                    <option value="SUSPICIOUS_BEHAVIOR">SUSPICIOUS_BEHAVIOR (Abusive ordering pattern)</option>
                                    <option value="ADMIN_REQUEST">ADMIN_REQUEST (Direct admin decision)</option>
                                    <option value="POLICY_VIOLATION">POLICY_VIOLATION (Store rules violation)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">
                                    Admin Note / Reference
                                </label>
                                <textarea
                                    rows={2}
                                    value={blockNote}
                                    onChange={(e) => setBlockNote(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-red-500 outline-none resize-none"
                                    placeholder="Enter reason for blocking this customer..."
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsBlockModalOpen(false)}
                                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-lg cursor-pointer transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs rounded-lg cursor-pointer transition"
                                >
                                    Confirm Block Customer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Delete Order Confirmation Modal */}
            {isDeleteModalOpen && (
                <DeleteModal
                    isOpen={isDeleteModalOpen}
                    title="Delete Order"
                    message={`Are you sure you want to delete order #${order.orderId || order.id}? This action cannot be undone.`}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onDelete={handleDeleteOrder}
                />
            )}
            {/* Process Return RMA Modal */}
            {isReturnModalOpen && (
                <ProcessReturnModal
                    isOpen={isReturnModalOpen}
                    onClose={() => setIsReturnModalOpen(false)}
                    order={order}
                    onSuccess={() => refetchOrder()}
                />
            )}
            {/* Exchange Size / Variant Modal */}
            {exchangeItem && (
                <ExchangeModal
                    isOpen={!!exchangeItem}
                    onClose={() => setExchangeItem(null)}
                    order={order}
                    item={exchangeItem}
                    onSuccess={() => refetchOrder()}
                />
            )}
        </div>
    );
};

export default OrderDetail;
