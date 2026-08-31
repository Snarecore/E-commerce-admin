import { useMemo } from "react";
import { FiEye } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
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
        <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="flex justify-between p-2">
                <h2 className="text-lg font-semibold mb-4">{title}</h2>
                <Link to={"/orders"} className="underline text-[#212B36] text-[13px] hover:text-[#fe9f43] transition-all ease-in duration-300">
                    View All
                </Link>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                    <thead>
                        <tr>
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
                            <tr key={rowIndex} className="border-y border-gray-200">
                                <td className="p-3 text-left">
                                    {rowIndex + 1}
                                </td>
                                <td className="p-3 text-left">
                                    {row.orderId}
                                </td>

                                <td className="p-3">{row.user.name}</td>
                                <td className="p-3">${row.totalAmount}</td>
                                <td className="p-3">
                                    <span className={`px-3 py-1 text-xs font-semibold rounded-md flex items-center w-fit transition-all ${row.status === "Completed" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                                        {row.status}
                                    </span>
                                </td>
                                <td className="p-3">{formatPrettyDateWithTime(row.createdAt)}</td>


                                <td className="p-3 flex items-center gap-3">
                                    <button onClick={() => handleInvoice(row)} className="border border-gray-300 text-gray-700 hover:text-[var(--color-primary)] hover:bg-gray-200 cursor-pointer p-2 rounded-md transition duration-300">
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
