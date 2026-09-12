import { useEffect, useMemo, useState } from "react";
import { FiEye, FiMessageSquare, FiShield, FiTrash2, FiPackage } from "react-icons/fi";
import toast from "react-hot-toast";
import { useAPI } from "../../../hooks/useApi";
import apiConfig from "../../../config/api.json";
import TableSkeleton from "../../../components/skeleton/TableSkeleton";
import EmptyState from "../../../components/empty-state/EmptyState";
import DeleteModal from "../../../components/modals/DeleteModal";
import Pagination from "../../../components/pagination";
import { useNavigate } from "react-router-dom";
import { formatPrettyDateWithTime } from "../../../utils/date-utils";
import { getDisplayCustomerName, getDisplayCustomerContact, getDisplayCustomerPhone } from "../../../utils/order-utils";
import { saveBlacklistItem, isCustomerBlacklisted, isCustomerSuspicious } from "../../../utils/blacklist-storage";
import { IBlacklistItem } from "../../settings/blacklist/BlacklistPage";
import DateRangePicker from "../../../components/cards/welcomeCard/DateRangePicker";
import DropdownFilter from "../../../components/table-components/DropdownFilter";
import RefreshButton from "../../../components/table-components/RefreshButton";

interface OrderUser {
    id: string;
    name: string;
    email: string;
    phone?: string;
}

interface OrderSummaryItem {
    id?: string;
    productId?: string;
    productName?: string;
    productImage?: string;
    quantity?: number;
    price?: number;
    product?: {
        featuredImage?: string;
        name?: string;
    };
}

interface OrdersDataProps {
    id: string;
    orderId: string;
    totalAmount: string;
    totalCommission: string;
    status: string;
    paymentStatus: string;
    createdAt?: string;
    user?: OrderUser;
    orderSummaries?: OrderSummaryItem[];
    items?: any[];
}

interface OrderTableProps {
    dataList: OrdersDataProps[];
    fetchOrderList: () => void;
    pageCount: number;
    currentPageNumber: number;
    setCurrentPageNumber: React.Dispatch<React.SetStateAction<number>>;
    handlePagination: (paginationData: { selected: number }) => void;
    isLoading: boolean;
    isFetching?: boolean;
    activeTab?: string;
    selectedFilters: {
        userId: { label: string; value: string } | null;
        status: { label: string; value: string } | null;
        paymentStatus: { label: string; value: string } | null;
        startDate: { label: Date; value: Date } | null;
        endDate: { label: Date; value: Date } | null;
    };
    setSelectedFilters: React.Dispatch<React.SetStateAction<{
        userId: { label: string; value: string } | null;
        status: { label: string; value: string } | null;
        paymentStatus: { label: string; value: string } | null;
        startDate: { label: Date; value: Date } | null;
        endDate: { label: Date; value: Date } | null;
    }>>;
}

const getFirstProductImage = (order: any): string | null => {
    if (order.orderSummaries && order.orderSummaries.length > 0) {
        for (const item of order.orderSummaries) {
            if (item.productImage) return item.productImage;
            if (item.product?.featuredImage) return item.product.featuredImage;
        }
    }
    if (order.items && order.items.length > 0) {
        for (const item of order.items) {
            if (item.productImage) return item.productImage;
            if (item.product?.featuredImage) return item.product.featuredImage;
            if (item.featuredImage) return item.featuredImage;
            if (item.image) return item.image;
        }
    }
    return order.productImage || order.featuredImage || null;
};

const getProductItemCount = (order: any): number => {
    const list = order.orderSummaries || order.items || [];
    return list.length;
};

const getStatusBadgeClass = (status: string) => {
    switch (status) {
        case "Completed": return "bg-green-100 text-green-800";
        case "Failed": return "bg-red-100 text-red-800";
        case "Pending": return "bg-yellow-100 text-yellow-800";
        case "Processing": return "bg-blue-100 text-blue-800";
        case "Shipped": return "bg-purple-100 text-purple-800";
        case "Delivered": return "bg-teal-100 text-teal-800";
        default: return "bg-gray-100 text-gray-700";
    }
};

const OrderTable = ({
    dataList,
    pageCount,
    currentPageNumber,
    fetchOrderList,
    setCurrentPageNumber,
    handlePagination,
    isLoading,
    isFetching: _isFetching,
    selectedFilters,
    setSelectedFilters,
}: OrderTableProps) => {
    const navigate = useNavigate();
    const { handleDeleteAPI, fetchData } = useAPI();
    const apiUrl = apiConfig.order.orderListUrl;

    const tableHeaders = [
        { key: "image", label: "Item" },
        { key: "sl", label: "Sl" },
        { key: "orderId", label: "Order ID" },
        { key: "customer", label: "Customer" },
        { key: "totalAmount", label: "Amount" },
        { key: "paymentStatus", label: "Payment" },
        { key: "status", label: "Status" },
        { key: "createdAt", label: "Date" },
        { key: "action", label: "Action" },
    ];

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedOrderData, setSelectedOrderData] = useState<OrdersDataProps | null>(null);

    // Block Customer Modal State
    const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
    const [selectedBlockOrder, setSelectedBlockOrder] = useState<any>(null);
    const [blockSeverity, setBlockSeverity] = useState<"HARD_BLOCK" | "SUSPICIOUS_FLAG">("HARD_BLOCK");
    const [blockReason, setBlockReason] = useState("FRAUD_HISTORY");
    const [blockNote, setBlockNote] = useState("");

    const handleOpenBlockModal = (order: any) => {
        setSelectedBlockOrder(order);
        setBlockNote(`Blocked directly from Order #${order.orderId || order.id}`);
        setIsBlockModalOpen(true);
    };

    const handleConfirmBlock = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedBlockOrder) return;
        const name = getDisplayCustomerName(selectedBlockOrder);
        const contact = getDisplayCustomerContact(selectedBlockOrder);
        const email = selectedBlockOrder.user?.email || selectedBlockOrder.customerEmail || selectedBlockOrder.email;
        const phone = contact || selectedBlockOrder.user?.phone || selectedBlockOrder.phone;

        const simulatedHash = phone
            ? Array.from(phone).map((c: any) => String(c).charCodeAt(0).toString(16)).join('').padEnd(32, '0').slice(0, 32)
            : undefined;

        const newItem: IBlacklistItem = {
            id: `bl-${Date.now()}`,
            subjectType: 'PHONE',
            customerName: name !== 'Unknown Customer' ? name : undefined,
            customerEmail: email || undefined,
            displayValue: phone || name,
            valueHash: simulatedHash,
            severity: blockSeverity,
            reasonCode: blockReason,
            note: blockNote,
            status: 'ACTIVE',
            createdByAdminId: 'Admin (Order List)',
            createdAt: new Date().toISOString(),
        };

        saveBlacklistItem(newItem);
        toast.success(`Customer "${name}" (${phone || 'Target'}) added to Blacklist successfully!`);
        setIsBlockModalOpen(false);
        setSelectedBlockOrder(null);
    };

    const handleOpenDeleteModal = (data: OrdersDataProps) => {
        setSelectedOrderData(data);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setSelectedOrderData(null);
    };

    const handleViewDetail = (data: OrdersDataProps) => {
        navigate(`/order-detail/${data.id}`, { state: { orderData: data } });
    };

    const handleChat = (data: OrdersDataProps) => {
        navigate("/chat", {
            state: {
                autoSelectCustomerId: data.user?.id,
                prefillMessage: `Hi, regarding your order #${data.orderId}...`,
            },
        });
    };

    const handleDelete = async () => {
        if (!selectedOrderData) return;
        const apiResponse = await handleDeleteAPI({
            url: `${apiUrl}/${selectedOrderData.id}`,
            showSuccessMessage: true,
        });
        if (apiResponse) {
            fetchOrderList();
            closeDeleteModal();
        }
    };

    // Dropdown filter options
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [customers, setCustomers] = useState<{ label: string; value: string }[]>([]);
    const customersApiUrl = apiConfig.site.customerListUrl;

    const fetchCustomersData = async () => {
        try {
            const result = await fetchData({ apiUrl: `${customersApiUrl}?role=customer` });
            setCustomers(result.customerList.map((cat: any) => ({ label: cat.name, value: cat.id })));
        } catch (error) {
            console.error("Failed to fetch customers:", error);
        }
    };

    useEffect(() => {
        fetchCustomersData();
    }, []);

    const dropdownOptions = useMemo(() => ({
        userId: customers,
        status: [
            { label: "Pending", value: "Pending" },
            { label: "Processing", value: "Processing" },
            { label: "Completed", value: "Completed" },
            { label: "Failed", value: "Failed" },
            { label: "Shipped", value: "Shipped" },
            { label: "Delivered", value: "Delivered" },
        ],
        paymentStatus: [
            { label: "Paid", value: "Paid" },
            { label: "Unpaid", value: "Unpaid" },
        ],
    }), [customers]);

    const handleRefreshButton = () => {
        setSelectedFilters({
            userId: null,
            status: null,
            paymentStatus: null,
            startDate: null,
            endDate: null,
        });
        setCurrentPageNumber(1);
        setOpenDropdown(null);
    };

    const sortedDataList = useMemo(() => {
        if (!dataList || !Array.isArray(dataList)) return [];
        return [...dataList].sort((a, b) => {
            const dateA = a.createdAt || (a as any).created_at || (a as any).date || (a as any).updatedAt;
            const dateB = b.createdAt || (b as any).created_at || (b as any).date || (b as any).updatedAt;

            const timeA = dateA ? new Date(dateA).getTime() : 0;
            const timeB = dateB ? new Date(dateB).getTime() : 0;

            const validA = !isNaN(timeA) ? timeA : 0;
            const validB = !isNaN(timeB) ? timeB : 0;

            if (validA && validB && validA !== validB) {
                return validB - validA;
            }
            if (validA && !validB) return -1;
            if (!validA && validB) return 1;

            return (b.orderId || b.id || "").localeCompare(a.orderId || a.id || "", undefined, { numeric: true });
        });
    }, [dataList]);

    const displayDataList = useMemo(() => {
        if (!sortedDataList || sortedDataList.length === 0) return [];
        if (sortedDataList.length > 10 && (!pageCount || pageCount <= 1)) {
            const startIndex = (currentPageNumber - 1) * 10;
            return sortedDataList.slice(startIndex, startIndex + 10);
        }
        return sortedDataList;
    }, [sortedDataList, currentPageNumber, pageCount]);

    if (isLoading) return <TableSkeleton />;

    return (
        <div className="p-6 bg-white rounded-lg border border-gray-200">
            {/* Filters */}
            <div className="flex justify-end flex-wrap space-y-4 mb-4">
                <div className="flex flex-wrap gap-2">
                    {(Object.entries(dropdownOptions) as [keyof typeof selectedFilters, any][]).map(([key, options]) => (
                        <DropdownFilter
                            key={key}
                            title={
                                key === "userId" ? "Customer"
                                : key === "status" ? "Status"
                                : key === "paymentStatus" ? "Payment Status"
                                : key
                            }
                            options={options}
                            // @ts-ignore
                            selectedOption={selectedFilters[key]}
                            isOpen={openDropdown === key}
                            onToggle={() => setOpenDropdown(openDropdown === key ? null : key)}
                            onSelect={(selected) => {
                                setSelectedFilters((prev) => ({ ...prev, [key]: selected }));
                                setCurrentPageNumber(1);
                                setOpenDropdown(null);
                            }}
                        />
                    ))}
                    <DateRangePicker
                        onDateChange={(start, end) => {
                            setSelectedFilters((prev) => ({
                                ...prev,
                                startDate: { label: start, value: start },
                                endDate: { label: end, value: end },
                            }));
                            setCurrentPageNumber(1);
                        }}
                        initialStartDate={selectedFilters.startDate?.value}
                        initialEndDate={selectedFilters.endDate?.value}
                    />
                    <RefreshButton onClick={handleRefreshButton} />
                </div>
            </div>

            {/* Table */}
            <div className="mt-2 w-full overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[1000px]">
                    <thead className="bg-gray-100">
                        <tr className="text-gray-600 text-sm border-b border-gray-200">
                            {tableHeaders.map(({ key, label }) => (
                                <th key={key} className="px-6 py-4 text-left text-[#000000e0]">
                                    {label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 rounded-lg">
                        {displayDataList?.length > 0 ? (
                            displayDataList.map((data, index) => (
                                <tr
                                    key={data.id}
                                    className="border-b border-gray-100 text-gray-700 hover:bg-gray-50 transition duration-300"
                                >
                                    {/* Product Image Thumbnail */}
                                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                        {(() => {
                                            const imgUrl = getFirstProductImage(data);
                                            const itemCount = getProductItemCount(data);
                                            const firstItem = data.orderSummaries?.[0] || (data as any).items?.[0];
                                            const title = firstItem?.productName || "Ordered Product";

                                            return (
                                                <div
                                                    className="relative group w-10 h-10 flex-shrink-0 cursor-pointer"
                                                    onClick={() => navigate(`/order-detail/${data.id}`)}
                                                    title={title}
                                                >
                                                    {imgUrl ? (
                                                        <img
                                                            src={imgUrl}
                                                            alt={title}
                                                            className="w-10 h-10 rounded-lg object-cover border border-gray-200 shadow-xs bg-gray-50 hover:scale-105 transition-transform duration-200"
                                                            onError={(e) => {
                                                                (e.target as HTMLElement).style.display = "none";
                                                                const fallback = (e.target as HTMLElement).nextElementSibling;
                                                                if (fallback) fallback.classList.remove("hidden");
                                                            }}
                                                        />
                                                    ) : null}
                                                    <div className={`w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 ${imgUrl ? 'hidden' : ''}`}>
                                                        <FiPackage className="text-gray-400 text-lg" />
                                                    </div>
                                                    {itemCount > 1 && (
                                                        <span className="absolute -bottom-1 -right-1 bg-gray-900 text-white text-[9px] font-bold rounded-full px-1.5 py-0.5 shadow leading-none">
                                                            +{itemCount - 1}
                                                        </span>
                                                    )}
                                                </div>
                                            );
                                        })()}
                                    </td>

                                    {/* Sl */}
                                    <td className="px-6 py-4 font-medium text-gray-800">
                                        {(currentPageNumber - 1) * 10 + index + 1}
                                    </td>
                                    {/* Order ID */}
                                    <td className="px-6 py-4 font-medium text-orange-600">
                                        #{data.orderId}
                                    </td>
                                    {/* Customer */}
                                    <td className="px-6 py-4">
                                        {(() => {
                                            const custPhone = getDisplayCustomerPhone(data);
                                            const custContact = custPhone || getDisplayCustomerContact(data);
                                            const custEmail = data.user?.email || (data as any).email || (data as any).customerEmail;
                                            const custIp = (data as any).ipAddress || (data as any).userIp || (data as any).clientIp || (data as any).ip;
                                            const isBlocked = isCustomerBlacklisted(custContact, custEmail, custIp);
                                            const isSuspicious = !isBlocked && isCustomerSuspicious(custContact, custEmail, custIp);

                                            return (
                                                <div>
                                                    <div className="flex items-center gap-1.5 flex-wrap">
                                                        <p className="font-medium text-gray-800 text-sm">
                                                            {getDisplayCustomerName(data)}
                                                        </p>
                                                        {isBlocked && (
                                                            <span className="px-1.5 py-0.5 text-[10px] bg-red-100 text-red-700 font-bold rounded border border-red-200">
                                                                BLOCKED
                                                            </span>
                                                        )}
                                                        {isSuspicious && (
                                                            <span className="px-1.5 py-0.5 text-[10px] bg-yellow-100 text-yellow-800 font-bold rounded border border-yellow-300">
                                                                SUSPICIOUS
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-gray-400 font-mono">
                                                        {custPhone || custContact || "N/A"}
                                                    </p>
                                                </div>
                                            );
                                        })()}
                                    </td>
                                    {/* Amount */}
                                    <td className="px-6 py-4 font-semibold text-gray-800">
                                        ৳{Number(data.totalAmount || 0).toFixed(2)}
                                    </td>
                                    {/* Payment Status */}
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 text-xs font-semibold rounded-md flex items-center w-fit ${data.paymentStatus === "Paid" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                                            {data.paymentStatus}
                                        </span>
                                    </td>
                                    {/* Order Status */}
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 text-xs font-semibold rounded-md flex items-center w-fit ${getStatusBadgeClass(data.status)}`}>
                                            {data.status}
                                        </span>
                                    </td>
                                    {/* Date */}
                                    <td className="px-6 py-4 font-medium text-gray-500 text-sm">
                                        {formatPrettyDateWithTime(
                                            data?.createdAt || (data as any)?.created_at || (data as any)?.date || (data as any)?.updatedAt
                                        )}
                                    </td>
                                    {/* Actions */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            {/* View Detail */}
                                            <button
                                                onClick={() => handleViewDetail(data)}
                                                title="View Detail"
                                                className="border border-gray-300 text-gray-700 hover:text-orange-500 hover:border-orange-400 hover:bg-orange-50 cursor-pointer p-2 rounded-md transition duration-300"
                                            >
                                                <FiEye className="w-4 h-4" />
                                            </button>
                                            {/* Chat */}
                                            <button
                                                onClick={() => handleChat(data)}
                                                title="Chat with Customer"
                                                className="border border-gray-300 text-gray-700 hover:text-orange-500 hover:border-orange-400 hover:bg-orange-50 cursor-pointer p-2 rounded-md transition duration-300"
                                            >
                                                <FiMessageSquare className="w-4 h-4" />
                                            </button>
                                            {/* Block Customer */}
                                            <button
                                                onClick={() => handleOpenBlockModal(data)}
                                                title="Block Customer / Add to Blacklist"
                                                className="border border-red-200 text-red-600 hover:text-red-700 hover:border-red-400 hover:bg-red-50 cursor-pointer p-2 rounded-md transition duration-300"
                                            >
                                                <FiShield className="w-4 h-4" />
                                            </button>
                                            {/* Delete Order */}
                                            <button
                                                onClick={() => handleOpenDeleteModal(data)}
                                                title="Delete Order"
                                                className="border border-red-200 text-red-600 hover:text-red-700 hover:border-red-400 hover:bg-red-50 cursor-pointer p-2 rounded-md transition duration-300"
                                            >
                                                <FiTrash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={tableHeaders.length} className="px-6 py-4 text-center italic">
                                    <EmptyState
                                        title="No orders found."
                                        description="Try adjusting filters or check back later!"
                                    />
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {selectedOrderData && (
                <DeleteModal
                    isOpen={isDeleteModalOpen}
                    title="Delete Order"
                    message={`Are you sure you want to delete?`}
                    onClose={closeDeleteModal}
                    onDelete={handleDelete}
                />
            )}

            {pageCount > 1 && (
                <div className="flex justify-center mt-6">
                    <Pagination
                        pageCount={pageCount}
                        currentPageNumber={currentPageNumber}
                        handlePagination={handlePagination}
                    />
                </div>
            )}

            {/* Quick Block Modal */}
            {isBlockModalOpen && selectedBlockOrder && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl space-y-4 border border-gray-200">
                        <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                            <FiShield className="w-5 h-5 text-red-600" />
                            <h3 className="text-lg font-bold text-gray-900">Block Customer</h3>
                        </div>

                        <div className="bg-red-50 border border-red-100 rounded-lg p-3 text-xs text-red-800 space-y-1">
                            <p className="font-semibold">Customer Information:</p>
                            <p><strong>Name:</strong> {getDisplayCustomerName(selectedBlockOrder)}</p>
                            <p><strong>Phone:</strong> {getDisplayCustomerContact(selectedBlockOrder) || 'N/A'}</p>
                            <p><strong>Email:</strong> {selectedBlockOrder.user?.email || selectedBlockOrder.customerEmail || selectedBlockOrder.email || 'N/A'}</p>
                            <p><strong>Order ID:</strong> #{selectedBlockOrder.orderId || selectedBlockOrder.id}</p>
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
                                    onClick={() => {
                                        setIsBlockModalOpen(false);
                                        setSelectedBlockOrder(null);
                                    }}
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
        </div>
    );
};

export default OrderTable;

