import { useMemo } from "react";
import { FiEye } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { getDisplayCustomerName } from "../../utils/order-utils";
import { formatPrettyDateWithTime } from "../../utils/date-utils";

interface OrdersDataProps {
	id: string;
	orderId: string;
	totalAmount: string;
	status: string;
	paymentStatus: string;
	createdAt?: string;
}

const OrderListTable = ({
    title,
    headers,
    data,
}: {
    title: string;
    headers: string[];
    data: any[];
}) => {
    const navigate = useNavigate();

    const handleInvoice = (data: OrdersDataProps) => {
		navigate(`/invoice/${data.id}`, { state: { orderData: data } });
	};

    const sortedData = useMemo(() => {
        if (!data || !Array.isArray(data)) return [];
        return [...data].sort((a, b) => {
            const dateA = a?.createdAt || a?.created_at || a?.date || a?.updatedAt;
            const dateB = b?.createdAt || b?.created_at || b?.date || b?.updatedAt;

            const timeA = dateA ? new Date(dateA).getTime() : 0;
            const timeB = dateB ? new Date(dateB).getTime() : 0;

            const validA = !isNaN(timeA) ? timeA : 0;
            const validB = !isNaN(timeB) ? timeB : 0;

            if (validA && validB && validA !== validB) {
                return validB - validA;
            }
            if (validA && !validB) return -1;
            if (!validA && validB) return 1;

            return String(b?.orderId || b?.id || "").localeCompare(
                String(a?.orderId || a?.id || ""),
                undefined,
                { numeric: true }
            );
        });
    }, [data]);

    return (
        <div className="bg-[var(--ui-surface)] p-5 rounded-md shadow-sm border border-[var(--ui-border)] transition-colors duration-200">
            <div className="flex justify-between items-center pb-2">
                <h2 className="text-lg font-semibold text-[var(--ui-text)]">{title}</h2>
                <Link to={"/orders"} className="underline text-[var(--ui-text-muted)] text-[13px] hover:text-[var(--primary-color)] transition-all ease-in duration-300">
                    View All
                </Link>
            </div>

            <div className="overflow-x-auto mt-2">
                <table className="w-full min-w-[600px]">
                    <thead>
                        <tr className="border-b border-[var(--ui-border)] text-[var(--ui-text-muted)] text-sm">
                            <th className="p-3 text-left">
                                Sl
                            </th>
                            {headers.map((header, index) => (
                                <th key={index} className="p-3 text-left">
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {sortedData.map((row, rowIndex) => (
                            <tr key={row?.id || row?._id || rowIndex} className="border-b border-[var(--ui-border)] text-[var(--ui-text)] hover:bg-[var(--ui-surface-muted)] transition-colors">
                                <td className="p-3 text-left text-sm text-[var(--ui-text-muted)]">
                                    {rowIndex + 1}
                                </td>
                                <td className="p-3 text-left font-medium">
                                    {row?.orderId || row?.id || row?._id || "N/A"}
                                </td>

                                <td className="p-3">{getDisplayCustomerName(row)}</td>
                                <td className="p-3 font-semibold">৳{row?.totalAmount || row?.grandTotal || 0}</td>
                                <td className="p-3">
                                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-md flex items-center w-fit transition-all ${row?.status === "Completed" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                                        {row?.status || "Pending"}
                                    </span>
                                </td>
                                <td className="p-3 text-sm text-[var(--ui-text-muted)]">{formatPrettyDateWithTime(row?.createdAt)}</td>

                                <td className="p-3 flex items-center gap-3">
                                    <button onClick={() => handleInvoice(row)} className="border border-[var(--ui-border)] text-[var(--ui-text-muted)] hover:text-[var(--primary-color)] hover:bg-[var(--primary-color-light)] cursor-pointer p-2 rounded-md transition duration-300">
                                        <FiEye />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

    );
};

export default OrderListTable;
