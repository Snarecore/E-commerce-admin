import { FiEye } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { formatDate } from "../../../../utils/date-utils";

interface OrderProfitItem {
  id: string;
  orderId: string;
  createdAt: string;
  status: string;
  customerName: string;
  subtotal: number;
  couponDiscount: number;
  netRevenue: number;
  cogs: number;
  grossProfit: number;
  deliveryCharge: number;
  netProfit: number;
  netMargin: number;
  hasUnknownCostItems: boolean;
}

interface OrderProfitTableProps {
  orders: OrderProfitItem[];
  isLoading: boolean;
  page: number;
  total: number;
  limit: number;
  onPageChange: (newPage: number) => void;
}

export default function OrderProfitTable({
  orders,
  isLoading,
  page,
  total,
  limit,
  onPageChange,
}: OrderProfitTableProps) {
  const navigate = useNavigate();
  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
        <div>
          <h3 className="text-base font-bold text-gray-800">Order Financial Breakdown</h3>
          <p className="text-xs text-gray-400">Order-level revenue, COGS, and profit margins</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-600 border-b border-gray-200">
              <th className="px-3 py-2.5 font-semibold">Order ID</th>
              <th className="px-3 py-2.5 font-semibold">Date</th>
              <th className="px-3 py-2.5 font-semibold">Customer</th>
              <th className="px-3 py-2.5 font-semibold text-center">Status</th>
              <th className="px-3 py-2.5 font-semibold text-right">Subtotal</th>
              <th className="px-3 py-2.5 font-semibold text-right">Discount</th>
              <th className="px-3 py-2.5 font-semibold text-right">COGS</th>
              <th className="px-3 py-2.5 font-semibold text-right">Gross Profit</th>
              <th className="px-3 py-2.5 font-semibold text-right">Net Profit</th>
              <th className="px-3 py-2.5 font-semibold text-center">Net Margin</th>
              <th className="px-3 py-2.5 font-semibold text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={11} className="text-center py-8 text-gray-400">
                  Loading order list...
                </td>
              </tr>
            ) : orders.length > 0 ? (
              orders.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-3 py-3 font-semibold text-orange-600">#{o.orderId}</td>
                  <td className="px-3 py-3 text-gray-500">{formatDate(o.createdAt)}</td>
                  <td className="px-3 py-3 font-medium text-gray-800">{o.customerName}</td>
                  <td className="px-3 py-3 text-center">
                    <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded text-[10px] font-bold">
                      {o.status}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-right font-medium text-gray-800">
                    ৳{o.subtotal.toLocaleString()}
                  </td>
                  <td className="px-3 py-3 text-right font-medium text-red-600">
                    {o.couponDiscount > 0 ? `-৳${o.couponDiscount.toLocaleString()}` : "—"}
                  </td>
                  <td className="px-3 py-3 text-right font-medium text-amber-700">
                    ৳{o.cogs.toLocaleString()}
                  </td>
                  <td className="px-3 py-3 text-right font-semibold text-gray-900">
                    ৳{o.grossProfit.toLocaleString()}
                  </td>
                  <td className="px-3 py-3 text-right font-bold text-emerald-600">
                    ৳{o.netProfit.toLocaleString()}
                  </td>
                  <td className="px-3 py-3 text-center">
                    <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-bold">
                      {o.netMargin}%
                    </span>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <button
                      onClick={() => navigate(`/orders`)}
                      className="p-1.5 bg-gray-100 hover:bg-orange-100 hover:text-orange-600 rounded text-gray-600 transition-colors cursor-pointer"
                      title="View Order Details"
                    >
                      <FiEye className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={11} className="text-center py-8 text-gray-400 italic">
                  No orders found for selected filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 text-xs">
          <span className="text-gray-500">
            Showing page {page} of {totalPages} ({total} orders)
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="px-3 py-1 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-700 font-semibold rounded cursor-pointer"
            >
              Previous
            </button>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="px-3 py-1 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-700 font-semibold rounded cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
