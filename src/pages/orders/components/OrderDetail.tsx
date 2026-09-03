import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiMessageSquare, FiPrinter } from "react-icons/fi";
import { useAPI } from "../../../hooks/useApi";
import apiConfig from "../../../config/api.json";
import { formatDate } from "../../../utils/date-utils";
import PageHeader from "../../../components/cards/PageHeader";
import OrderStatusStepper from "./OrderStatusStepper";

import { productQueryKey, auditLogQueryKey, dashboardQueryKey } from "../../../config/query-key";

const STATUS_OPTIONS = ["Pending", "Order Placed", "Processing", "Shipped", "Delivered", "Completed", "Rejected", "Failed"];

const OrderDetail = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams<{ id: string }>();
    const { fetchData, handleApiMutation, patchMutation } = useAPI();

    const [order, setOrder] = useState<any>(location.state?.orderData || null);
    const [isLoading, setIsLoading] = useState(!location.state?.orderData);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<string>("");

    // Fetch order from API if not passed via navigation state
    useEffect(() => {
        if (!order && id) {
            setIsLoading(true);
            fetchData({ apiUrl: `${apiConfig.order.orderDetailUrl}/${id}` })
                .then((res: any) => {
                    const data = res?.data || res;
                    setOrder(data);
                    setSelectedStatus(data?.status || "");
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
                // Enterprise Standard Stock State Machine
                const orderItems = order.orderSummaries || order.orderItems || order.items || [];
                const ACTIVE_STATUSES = ["Pending", "Order Placed", "Processing", "Shipped", "Delivered", "Completed"];
                const CANCELLED_STATUSES = ["Rejected", "Failed", "Cancelled"];

                const wasActive = ACTIVE_STATUSES.includes(order.status);
                const wasCancelled = CANCELLED_STATUSES.includes(order.status);

                const isNowActive = ACTIVE_STATUSES.includes(selectedStatus);
                const isNowCancelled = CANCELLED_STATUSES.includes(selectedStatus);

                // Stock only changes when transitioning between Active and Cancelled states
                const shouldRestoreStock = wasActive && isNowCancelled;
                const shouldDeductStock = wasCancelled && isNowActive;

                if (shouldRestoreStock || shouldDeductStock) {
                    for (const item of orderItems) {
                        const prodId = item.productId || item.product?.id || item.id;
                        const qty = Number(item.quantity) || 1;
                        if (prodId) {
                            try {
                                const prodRes: any = await fetchData({ apiUrl: `${apiConfig.inventory.productUrl}/${prodId}` });
                                const prodData = prodRes?.data || prodRes;
                                if (prodData) {
                                    const currentQty = Number(prodData.quantity) || 0;
                                    let newQty = currentQty;

                                    if (shouldRestoreStock) {
                                        newQty = currentQty + qty;
                                    } else if (shouldDeductStock) {
                                        newQty = Math.max(0, currentQty - qty);
                                    }

                                    let updatedSizeStock = prodData.sizeStock;
                                    if (updatedSizeStock && typeof updatedSizeStock === "object" && item.size && updatedSizeStock[item.size] !== undefined) {
                                        const curSizeQty = Number(updatedSizeStock[item.size]) || 0;
                                        const newSizeQty = shouldRestoreStock
                                            ? curSizeQty + qty
                                            : Math.max(0, curSizeQty - qty);
                                        updatedSizeStock = { ...updatedSizeStock, [item.size]: newSizeQty };
                                    }

                                    await handleApiMutation({
                                        // @ts-ignore
                                        mutation: patchMutation,
                                        url: `${apiConfig.inventory.productStatusUrl}/${prodId}`,
                                        body: {
                                            quantity: newQty,
                                            sizeStock: updatedSizeStock,
                                            status: prodData.status,
                                            isApprove: prodData.isApprove,
                                            quantityAlert: prodData.quantityAlert,
                                            reduceQuantity: shouldDeductStock ? qty : 0,
                                            restoreQuantity: shouldRestoreStock ? qty : 0
                                        },
                                        invalidateQueryKey: [productQueryKey, auditLogQueryKey, dashboardQueryKey],
                                        showSuccessMessage: false,
                                        showErrorMessage: false,
                                        requiredFields: []
                                    });
                                }
                            } catch (e) {
                                console.error("Error updating product stock for:", prodId, e);
                            }
                        }
                    }
                }

                setOrder((prev: any) => ({
                    ...prev,
                    status: selectedStatus,
                    rejectionReason: bodyPayload.rejectionReason,
                    rejectionMessage: bodyPayload.rejectionMessage
                }));
                setIsRejectModalOpen(false);
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
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-orange-500 border border-gray-300 hover:border-orange-400 px-4 py-2 rounded-lg transition-all cursor-pointer"
                >
                    <FiArrowLeft className="w-4 h-4" />
                    Back to Orders
                </button>
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
                        <h3 className="text-base font-semibold text-gray-800 mb-4">Order Items</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="bg-gray-50 text-gray-600 border-b border-gray-200">
                                        <th className="px-4 py-3 text-left">Product</th>
                                        <th className="px-4 py-3 text-center">Qty</th>
                                        <th className="px-4 py-3 text-center">Price</th>
                                        <th className="px-4 py-3 text-center">Unit Cost</th>
                                        <th className="px-4 py-3 text-right">Subtotal</th>
                                        <th className="px-4 py-3 text-right text-emerald-600">Est. Profit</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {orderItems.length > 0 ? (
                                        orderItems.map((item: any) => {
                                            const unitCost = Number(item.unitCostPrice || item.product?.cost || 0);
                                            const hasCost = unitCost > 0;
                                            const itemSubtotal = item.price * item.quantity;
                                            const itemCostTotal = unitCost * item.quantity;
                                            const itemProfit = itemSubtotal - itemCostTotal;

                                            return (
                                                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-3">
                                                            <img
                                                                src={item.productImage}
                                                                alt={item.productName}
                                                                className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                                                            />
                                                            <span className="font-medium text-gray-800">{item.productName}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-center text-gray-600">{item.quantity}</td>
                                                    <td className="px-4 py-3 text-center text-gray-600">৳{Number(item.price).toFixed(2)}</td>
                                                    <td className="px-4 py-3 text-center text-gray-600">
                                                        {hasCost ? `৳${unitCost.toFixed(2)}` : <span className="text-gray-400 italic text-xs">Unknown</span>}
                                                    </td>
                                                    <td className="px-4 py-3 text-right font-semibold text-gray-800">
                                                        ৳{itemSubtotal.toFixed(2)}
                                                    </td>
                                                    <td className="px-4 py-3 text-right font-bold text-emerald-600">
                                                        {hasCost ? `+৳${itemProfit.toFixed(2)}` : <span className="text-gray-400 text-xs font-normal">N/A</span>}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="px-4 py-6 text-center text-gray-400 italic">
                                                No items found for this order.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                                {/* Totals */}
                                <tfoot>
                                    <tr>
                                        <td colSpan={5} className="px-4 py-2 text-right text-sm text-gray-500">Sub Total</td>
                                        <td className="px-4 py-2 text-right font-semibold text-gray-700">৳{Number(order.totalAmount ?? 0).toFixed(2)}</td>
                                    </tr>
                                    <tr className="border-t border-gray-200">
                                        <td colSpan={5} className="px-4 py-3 text-right text-base font-bold text-gray-800">Total Amount</td>
                                        <td className="px-4 py-3 text-right text-base font-bold text-orange-600">৳{Number(order.totalAmount ?? 0).toFixed(2)}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Right Column — Customer & Actions */}
                <div className="col-span-12 xl:col-span-4 flex flex-col gap-5">

                    {/* Customer Info */}
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                        <h3 className="text-base font-semibold text-gray-800 mb-4">Customer</h3>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-11 h-11 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-lg shrink-0">
                                {order.user?.name?.charAt(0)?.toUpperCase() || "?"}
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900">{order.user?.name || "—"}</p>
                                <p className="text-xs text-gray-500">{order.user?.email || "—"}</p>
                            </div>
                        </div>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Phone</span>
                                <span className="font-medium text-gray-800">{order.user?.phone || "—"}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Order Date</span>
                                <span className="font-medium text-gray-800">{formatDate(order.createdAt)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Payment & Order Status */}
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                        <h3 className="text-base font-semibold text-gray-800 mb-4">Payment & Status</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500">Order ID</span>
                                <span className="font-semibold text-orange-600">#{order.orderId}</span>
                            </div>
                            {order.stripeSessionId && (
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500">Stripe Session</span>
                                    <span className="font-mono text-xs text-gray-700 bg-gray-100 px-2 py-0.5 rounded truncate max-w-[180px]" title={order.stripeSessionId}>
                                        {order.stripeSessionId}
                                    </span>
                                </div>
                            )}
                            {order.paymentIntentId && (
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500">Payment Intent</span>
                                    <span className="font-mono text-xs text-gray-700 bg-gray-100 px-2 py-0.5 rounded truncate max-w-[180px]" title={order.paymentIntentId}>
                                        {order.paymentIntentId}
                                    </span>
                                </div>
                            )}
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500">Payment</span>
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
                            {(order.couponCode || Number(order.discountAmount) > 0) && (
                                <div className="flex justify-between items-center bg-orange-50 p-2 rounded-lg border border-orange-200">
                                    <span className="text-xs font-semibold text-orange-800">Coupon ({order.couponCode || "Applied"})</span>
                                    <span className="font-bold text-xs text-orange-700">-৳{Number(order.discountAmount || 0).toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500">Total</span>
                                <span className="font-bold text-gray-900">৳{order.totalAmount ?? "0.00"}</span>
                            </div>
                        </div>
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
        </div>
    );
};

export default OrderDetail;
