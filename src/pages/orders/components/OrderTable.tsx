import { useEffect, useMemo, useState } from "react";
import { FiEye, FiMessageSquare } from "react-icons/fi";
import { useAPI } from "../../../hooks/useApi";
import apiConfig from "../../../config/api.json";
import TableSkeleton from "../../../components/skeleton/TableSkeleton";
import EmptyState from "../../../components/empty-state/EmptyState";
import DeleteModal from "../../../components/modals/DeleteModal";
import Pagination from "../../../components/pagination";
import { useNavigate } from "react-router-dom";
import { formatPrettyDateWithTime } from "../../../utils/date-utils";
import DateRangePicker from "../../../components/cards/welcomeCard/DateRangePicker";
import DropdownFilter from "../../../components/table-components/DropdownFilter";
import RefreshButton from "../../../components/table-components/RefreshButton";

interface OrderUser {
    id: string;
    name: string;
    email: string;
    phone?: string;
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
                        {sortedDataList?.length > 0 ? (
                            sortedDataList.map((data, index) => (
                                <tr
                                    key={data.id}
                                    className="border-b border-gray-100 text-gray-700 hover:bg-gray-50 transition duration-300"
                                >
                                    {/* Sl */}
                                    <td className="px-6 py-4 font-medium text-gray-800">
                                        {index + 1}
                                    </td>
                                    {/* Order ID */}
                                    <td className="px-6 py-4 font-medium text-orange-600">
                                        #{data.orderId}
                                    </td>
                                    {/* Customer */}
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="font-medium text-gray-800 text-sm">
                                                {data.user?.name || "—"}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                {data.user?.phone || data.user?.email || ""}
                                            </p>
                                        </div>
                                    </td>
                                    {/* Amount */}
                                    <td className="px-6 py-4 font-semibold text-gray-800">
                                        ${data.totalAmount}
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
        </div>
    );
};

export default OrderTable;

