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
    <div className="bg-[var(--ui-surface)] rounded-md border border-[var(--ui-border)] p-3.5 sm:p-4 shadow-sm transition-colors duration-200">
      <div className="flex items-center justify-between border-b border-[var(--ui-border)] pb-3 mb-3">
        <div>
          <h3 className="text-base font-bold text-[var(--ui-text)]">Order Financial Breakdown</h3>
          <p className="text-xs text-[var(--ui-text-muted)]">Order-level revenue, COGS, and profit margins</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse min-w-[900px]">
          <thead className="bg-[var(--ui-surface-muted)]">
            <tr className="text-[13px] font-semibold border-b border-[var(--ui-border)] text-[var(--ui-text-muted)]">
              <th className="px-4 py-2.5 font-semibold text-[var(--ui-text)] whitespace-nowrap">Order ID</th>
              <th className="px-4 py-2.5 font-semibold text-[var(--ui-text)] whitespace-nowrap">Date</th>
              <th className="px-4 py-2.5 font-semibold text-[var(--ui-text)] whitespace-nowrap">Customer</th>
              <th className="px-4 py-2.5 font-semibold text-[var(--ui-text)] text-center whitespace-nowrap">Status</th>
              <th className="px-4 py-2.5 font-semibold text-[var(--ui-text)] text-right whitespace-nowrap">Subtotal</th>
              <th className="px-4 py-2.5 font-semibold text-[var(--ui-text)] text-right whitespace-nowrap">Discount</th>
              <th className="px-4 py-2.5 font-semibold text-[var(--ui-text)] text-right whitespace-nowrap">COGS</th>
              <th className="px-4 py-2.5 font-semibold text-[var(--ui-text)] text-right whitespace-nowrap">Gross Profit</th>
              <th className="px-4 py-2.5 font-semibold text-[var(--ui-text)] text-right whitespace-nowrap">Net Profit</th>
              <th className="px-4 py-2.5 font-semibold text-[var(--ui-text)] text-center whitespace-nowrap">Net Margin</th>
              <th className="px-4 py-2.5 font-semibold text-[var(--ui-text)] text-center whitespace-nowrap">Action</th>
            </tr>
          </thead>
          <tbody className="bg-[var(--ui-surface)] divide-y divide-[var(--ui-border)] rounded-md">
            {isLoading ? (
              <tr>
                <td colSpan={11} className="text-center py-8 text-[var(--ui-text-muted)]">
                  Loading order list...
                </td>
              </tr>
            ) : orders.length > 0 ? (
              orders.map((o) => (
                <tr key={o.id} className="border-b border-[var(--ui-border)] text-[var(--ui-text)] hover:bg-[var(--ui-surface-muted)] transition duration-200">
                  <td className="px-4 py-2.5 font-semibold text-[var(--primary-color)] whitespace-nowrap">#{o.orderId}</td>
                  <td className="px-4 py-2.5 text-xs text-[var(--ui-text-muted)] whitespace-nowrap">{formatDate(o.createdAt)}</td>
                  <td className="px-4 py-2.5 font-medium text-[var(--ui-text)] whitespace-nowrap">{o.customerName}</td>
                  <td className="px-4 py-2.5 text-center whitespace-nowrap">
                    <span className="bg-blue-500/15 text-blue-500 border border-blue-500/30 px-2 py-0.5 rounded text-[10px] font-bold">
                      {o.status}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right font-medium text-[var(--ui-text)] whitespace-nowrap">
                    ৳{o.subtotal.toLocaleString()}
                  </td>
                  <td className="px-4 py-2.5 text-right font-medium text-red-400 whitespace-nowrap">
                    {o.couponDiscount > 0 ? `-৳${o.couponDiscount.toLocaleString()}` : "—"}
                  </td>
                  <td className="px-4 py-2.5 text-right font-medium text-amber-500 whitespace-nowrap">
                    ৳{o.cogs.toLocaleString()}
                  </td>
                  <td className="px-4 py-2.5 text-right font-semibold text-[var(--ui-text)] whitespace-nowrap">
                    ৳{o.grossProfit.toLocaleString()}
                  </td>
                  <td className="px-4 py-2.5 text-right font-bold text-emerald-500 whitespace-nowrap">
                    ৳{o.netProfit.toLocaleString()}
                  </td>
                  <td className="px-4 py-2.5 text-center whitespace-nowrap">
                    <span className="bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px] font-bold">
                      {o.netMargin}%
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-center whitespace-nowrap">
                    <button
                      onClick={() => navigate(`/orders`)}
                      className="p-1.5 border border-[var(--ui-border)] text-[var(--ui-text-muted)] hover:text-[var(--primary-color)] hover:bg-[var(--ui-surface-muted)] rounded-md transition-colors cursor-pointer"
                      title="View Order Details"
                    >
                      <FiEye className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={11} className="text-center py-8 text-[var(--ui-text-muted)] italic">
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
