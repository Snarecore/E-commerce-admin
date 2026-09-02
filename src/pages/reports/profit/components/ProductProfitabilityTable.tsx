import { FiAlertTriangle } from "react-icons/fi";

interface ProductItem {
  productId: string;
  productName: string;
  productImage: string;
  quantitySold: number;
  grossItemRevenue: number;
  netRevenue: number;
  cogs: number;
  grossProfit: number;
  realizedUnitPrice: number;
  grossMargin: number | null;
  costSource: "SNAPSHOT" | "MIGRATED" | "UNKNOWN";
  isCostVerified: boolean;
  unitCostPrice: number;
}

interface ProductProfitabilityTableProps {
  products: ProductItem[];
  isLoading: boolean;
  activeTab: "most_profitable" | "low_margin" | "loss_making" | "unverified_cost";
  setActiveTab: (tab: "most_profitable" | "low_margin" | "loss_making" | "unverified_cost") => void;
  page: number;
  total: number;
  limit: number;
  onPageChange: (newPage: number) => void;
}

export default function ProductProfitabilityTable({
  products,
  isLoading,
  activeTab,
  setActiveTab,
  page,
  total,
  limit,
  onPageChange,
}: ProductProfitabilityTableProps) {
  const TABS = [
    { key: "most_profitable", label: "Most Profitable" },
    { key: "low_margin", label: "Low Margin (<20%)" },
    { key: "loss_making", label: "Loss Making" },
    { key: "unverified_cost", label: "Unverified Cost" },
  ] as const;

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-gray-100 pb-3 mb-4">
        <div>
          <h3 className="text-base font-bold text-gray-800">Product Profitability</h3>
          <p className="text-xs text-gray-400">Financial performance per product line</p>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => {
                setActiveTab(t.key);
                onPageChange(1);
              }}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                activeTab === t.key
                  ? "bg-white text-orange-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-600 border-b border-gray-200">
              <th className="px-3 py-2.5 font-semibold">Product</th>
              <th className="px-3 py-2.5 font-semibold text-center">Qty Sold</th>
              <th className="px-3 py-2.5 font-semibold text-right">Realized Unit Price</th>
              <th className="px-3 py-2.5 font-semibold text-right">Unit Cost</th>
              <th className="px-3 py-2.5 font-semibold text-right">Net Revenue</th>
              <th className="px-3 py-2.5 font-semibold text-right">COGS</th>
              <th className="px-3 py-2.5 font-semibold text-right">Gross Profit</th>
              <th className="px-3 py-2.5 font-semibold text-center">Margin</th>
              <th className="px-3 py-2.5 font-semibold text-center">Cost Source</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={9} className="text-center py-8 text-gray-400">
                  Loading product data...
                </td>
              </tr>
            ) : products.length > 0 ? (
              products.map((p) => {
                const isLoss = p.grossProfit < 0;
                const isUnknown = !p.isCostVerified;

                return (
                  <tr key={p.productId} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={p.productImage || "/images/empty-box.svg"}
                          alt={p.productName}
                          className="w-9 h-9 object-cover rounded-lg border border-gray-200 shrink-0"
                          onError={(e) => {
                            (e.target as any).src = "/images/empty-box.svg";
                          }}
                        />
                        <span className="font-semibold text-gray-900 line-clamp-1 max-w-[200px]">
                          {p.productName}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-center font-medium text-gray-700">
                      {p.quantitySold}
                    </td>
                    <td className="px-3 py-3 text-right font-medium text-gray-800">
                      ৳{p.realizedUnitPrice.toLocaleString()}
                    </td>
                    <td className="px-3 py-3 text-right font-medium text-gray-600">
                      {isUnknown ? "—" : `৳${p.unitCostPrice.toLocaleString()}`}
                    </td>
                    <td className="px-3 py-3 text-right font-semibold text-gray-800">
                      ৳{p.netRevenue.toLocaleString()}
                    </td>
                    <td className="px-3 py-3 text-right font-medium text-amber-700">
                      {isUnknown ? "—" : `৳${p.cogs.toLocaleString()}`}
                    </td>
                    <td
                      className={`px-3 py-3 text-right font-bold ${
                        isLoss
                          ? "text-red-600"
                          : isUnknown
                          ? "text-gray-500"
                          : "text-emerald-600"
                      }`}
                    >
                      {isUnknown ? `৳${p.netRevenue.toLocaleString()}*` : `৳${p.grossProfit.toLocaleString()}`}
                    </td>
                    <td className="px-3 py-3 text-center">
                      {isUnknown ? (
                        <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded text-[10px] font-semibold">
                          <FiAlertTriangle className="w-3 h-3 text-amber-600" /> Unverified
                        </span>
                      ) : (
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                            isLoss
                              ? "bg-red-50 text-red-700 border border-red-200"
                              : p.grossMargin! < 20
                              ? "bg-yellow-50 text-yellow-800 border border-yellow-200"
                              : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          }`}
                        >
                          {p.grossMargin}%
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                          p.costSource === "SNAPSHOT"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : p.costSource === "MIGRATED"
                            ? "bg-purple-50 text-purple-700 border-purple-200"
                            : "bg-gray-100 text-gray-600 border-gray-300"
                        }`}
                      >
                        {p.costSource}
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={9} className="text-center py-8 text-gray-400 italic">
                  No products found for this filter tab.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 text-xs">
          <span className="text-gray-500">
            Showing page {page} of {totalPages} ({total} products)
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
