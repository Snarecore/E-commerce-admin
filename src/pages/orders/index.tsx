import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import PageHeader from "../../components/cards/PageHeader";
import OrderTable from "./components/OrderTable";
import { useAPI } from "../../hooks/useApi";
import apiConfig from "../../config/api.json";
import { orderQueryKey } from "../../config/query-key";

import { useSocket } from "../../hooks/useSocket";
import { SocketEvent } from "../../types/socket.types";

const ORDER_TABS = [
    { key: "all", label: "All Orders" },
    { key: "Pending", label: "Pending" },
    { key: "Processing", label: "Processing" },
    { key: "Completed", label: "Completed" },
    { key: "Failed", label: "Failed" },
    { key: "abandoned", label: "Abandoned" },
];

const Orders = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const urlOrderId = searchParams.get("orderId");
    const { socket } = useSocket();

    const dataLimit = 10;
    const [activeTab, setActiveTab] = useState("all");
    const [currentPageNumber, setCurrentPageNumber] = useState(1);
    const { usePaginatedQuery } = useAPI();

    const [selectedFilters, setSelectedFilters] = useState<{
        userId: { label: string; value: string } | null;
        status: { label: string; value: string } | null;
        paymentStatus: { label: string; value: string } | null;
        startDate: { label: Date; value: Date } | null;
        endDate: { label: Date; value: Date } | null;
    }>({
        userId: null,
        status: null,
        paymentStatus: null,
        startDate: null,
        endDate: null,
    });

    // Sync tab → filters
    const handleTabChange = (tabKey: string) => {
        setActiveTab(tabKey);
        setCurrentPageNumber(1);
        if (tabKey === "all") {
            setSelectedFilters((prev) => ({ ...prev, status: null, paymentStatus: null }));
        } else if (tabKey === "abandoned") {
            setSelectedFilters((prev) => ({
                ...prev,
                status: { label: "Failed", value: "Failed" },
                paymentStatus: { label: "Unpaid", value: "Unpaid" },
            }));
        } else {
            setSelectedFilters((prev) => ({
                ...prev,
                status: { label: tabKey, value: tabKey },
                paymentStatus: null,
            }));
        }
    };

    const getOrderListApiUrl = () => {
        const params = new URLSearchParams({
            page: currentPageNumber.toString(),
            limit: dataLimit.toString(),
            sortBy: "createdAt",
            sortOrder: "DESC",
            sort_by: "createdAt",
            sort_order: "desc",
            sort: "-createdAt",
            orderBy: "createdAt",
            order: "DESC",
            sortDir: "DESC",
            direction: "desc",
        });

        if (selectedFilters.userId?.value) params.append("userId", selectedFilters.userId.value);
        if (selectedFilters.status?.value) params.append("status", selectedFilters.status.value);
        if (selectedFilters.paymentStatus?.value) params.append("paymentStatus", selectedFilters.paymentStatus.value);
        if (selectedFilters.startDate?.value) {
            params.append("startDate", new Date(selectedFilters.startDate.value.setHours(0, 0, 0, 0)).toISOString());
        }
        if (selectedFilters.endDate?.value) {
            params.append("endDate", new Date(selectedFilters.endDate.value.setHours(23, 59, 59, 999)).toISOString());
        }
        if (urlOrderId) {
            params.append("orderId", urlOrderId);
        }

        return `${apiConfig.order.orderListUrl}?${params.toString()}`;
    };

    const handlePagination = (paginationData: { selected: number }) => {
        setCurrentPageNumber(paginationData.selected + 1);
    };

    const {
        data: dataList,
        refetch: fetchOrderList,
        pageCount,
        isFetching,
        isLoading,
    } = usePaginatedQuery({
        // @ts-ignore
        queryKey: [
            orderQueryKey,
            activeTab,
            selectedFilters.userId?.value || "",
            selectedFilters.status?.value || "",
            selectedFilters.paymentStatus?.value || "",
            selectedFilters.startDate?.value ? new Date(selectedFilters.startDate.value).toISOString().split('T')[0] : "",
            selectedFilters.endDate?.value ? new Date(selectedFilters.endDate.value).toISOString().split('T')[0] : "",
            currentPageNumber.toString(),
            dataLimit.toString(),
            urlOrderId || ""
        ],
        url: getOrderListApiUrl(),
    });

    useEffect(() => {
        fetchOrderList();
    }, [currentPageNumber]);

    // Real-time socket events for admin order updates
    useEffect(() => {
        if (!socket) return;

        const handleOrderCreated = () => {
            fetchOrderList();
        };

        const handleOrderStatusUpdated = () => {
            fetchOrderList();
        };

        socket.on(SocketEvent.ORDER_CREATED, handleOrderCreated);
        socket.on(SocketEvent.ORDER_STATUS_UPDATED, handleOrderStatusUpdated);

        return () => {
            socket.off(SocketEvent.ORDER_CREATED, handleOrderCreated);
            socket.off(SocketEvent.ORDER_STATUS_UPDATED, handleOrderStatusUpdated);
        };
    }, [socket, fetchOrderList]);

    return (
        <div>
            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between flex-wrap">
                    <PageHeader
                        headerTitle="Order List"
                        headerDescription="Manage and track all your orders"
                    />
                </div>

                {/* Tab Bar */}
                <div className="flex flex-wrap gap-1 bg-white border border-gray-200 rounded-xl p-1.5">
                    {ORDER_TABS.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => handleTabChange(tab.key)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                                activeTab === tab.key
                                    ? tab.key === "abandoned"
                                        ? "bg-gray-700 text-white shadow-sm"
                                        : tab.key === "Failed"
                                        ? "bg-red-500 text-white shadow-sm"
                                        : "bg-orange-500 text-white shadow-sm"
                                    : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Filtered Order ID notice from Notification */}
                {urlOrderId && (
                    <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-4 py-2.5 text-sm text-blue-800">
                        <span>Filtered for Order: <strong>#{urlOrderId}</strong></span>
                        <button
                            onClick={() => navigate("/orders")}
                            className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium px-3 py-1 rounded-md transition-colors cursor-pointer"
                        >
                            Clear Filter (View All)
                        </button>
                    </div>
                )}

                {/* Abandoned Orders notice */}
                {activeTab === "abandoned" && (
                    <div className="flex items-start gap-2 bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 text-sm text-yellow-700">
                        <span className="text-base">⚠️</span>
                        <span>
                            Showing orders with <strong>Unpaid + Failed</strong> status as abandoned indicators.
                            For true abandoned cart tracking, backend cart persistence API is required.
                        </span>
                    </div>
                )}

                <div className="grid grid-cols-12 gap-12">
                    <div className="col-span-12">
                        <OrderTable
                            // @ts-ignore
                            dataList={dataList}
                            fetchOrderList={fetchOrderList}
                            pageCount={pageCount}
                            currentPageNumber={currentPageNumber}
                            setCurrentPageNumber={setCurrentPageNumber}
                            handlePagination={handlePagination}
                            isLoading={isLoading}
                            isFetching={isFetching}
                            selectedFilters={selectedFilters}
                            setSelectedFilters={setSelectedFilters}
                            activeTab={activeTab}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Orders;

