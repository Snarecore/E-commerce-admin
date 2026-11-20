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
    <div className="bg-[var(--ui-surface)] rounded-md border border-[var(--ui-border)] p-3.5 sm:p-4 shadow-sm transition-colors duration-200">
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-[var(--ui-border)] pb-3 mb-3">
        <div>
          <h3 className="text-base font-bold text-[var(--ui-text)]">Product Profitability</h3>
          <p className="text-xs text-[var(--ui-text-muted)]">Financial performance per product line</p>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-[var(--ui-surface-muted)] p-1 rounded-lg border border-[var(--ui-border)]">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => {
                setActiveTab(t.key);
                onPageChange(1);
              }}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                activeTab === t.key
                  ? "bg-[var(--ui-surface)] text-[var(--color-primary)] shadow-sm border border-[var(--ui-border)]"
                  : "text-[var(--ui-text-muted)] hover:text-[var(--ui-text)]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse min-w-[900px]">
          <thead className="bg-[var(--ui-surface-muted)]">
            <tr className="text-[13px] font-semibold border-b border-[var(--ui-border)] text-[var(--ui-text-muted)]">
              <th className="px-4 py-2.5 font-semibold text-[var(--ui-text)] whitespace-nowrap">Product</th>
              <th className="px-4 py-2.5 font-semibold text-[var(--ui-text)] text-center whitespace-nowrap">Qty Sold</th>
              <th className="px-4 py-2.5 font-semibold text-[var(--ui-text)] text-right whitespace-nowrap">Realized Unit Price</th>
              <th className="px-4 py-2.5 font-semibold text-[var(--ui-text)] text-right whitespace-nowrap">Unit Cost</th>
              <th className="px-4 py-2.5 font-semibold text-[var(--ui-text)] text-right whitespace-nowrap">Net Revenue</th>
              <th className="px-4 py-2.5 font-semibold text-[var(--ui-text)] text-right whitespace-nowrap">COGS</th>
              <th className="px-4 py-2.5 font-semibold text-[var(--ui-text)] text-right whitespace-nowrap">Gross Profit</th>
              <th className="px-4 py-2.5 font-semibold text-[var(--ui-text)] text-center whitespace-nowrap">Margin</th>
              <th className="px-4 py-2.5 font-semibold text-[var(--ui-text)] text-center whitespace-nowrap">Cost Source</th>
            </tr>
          </thead>
          <tbody className="bg-[var(--ui-surface)] divide-y divide-[var(--ui-border)] rounded-md">
            {isLoading ? (
              <tr>
                <td colSpan={9} className="text-center py-8 text-[var(--ui-text-muted)]">
                  Loading product data...
                </td>
              </tr>
            ) : products.length > 0 ? (
              products.map((p) => {
                const isLoss = p.grossProfit < 0;
                const isUnknown = !p.isCostVerified;

                return (
                  <tr key={p.productId} className="border-b border-[var(--ui-border)] text-[var(--ui-text)] hover:bg-[var(--ui-surface-muted)] transition duration-200">
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={p.productImage || "/images/empty-box.svg"}
                          alt={p.productName}
                          className="w-9 h-9 object-cover rounded-lg border border-[var(--ui-border)] shrink-0"
                          onError={(e) => {
                            (e.target as any).src = "/images/empty-box.svg";
                          }}
                        />
                        <span className="font-semibold text-[var(--ui-text)] line-clamp-1 max-w-[200px]">
                          {p.productName}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-center font-medium text-[var(--ui-text)] whitespace-nowrap">
                      {p.quantitySold}
                    </td>
                    <td className="px-4 py-2.5 text-right font-medium text-[var(--ui-text)] whitespace-nowrap">
                      ৳{p.realizedUnitPrice.toLocaleString()}
                    </td>
                    <td className="px-4 py-2.5 text-right font-medium text-[var(--ui-text-muted)] whitespace-nowrap">
                      {isUnknown ? "—" : `৳${p.unitCostPrice.toLocaleString()}`}
                    </td>
                    <td className="px-4 py-2.5 text-right font-semibold text-[var(--ui-text)] whitespace-nowrap">
                      ৳{p.netRevenue.toLocaleString()}
                    </td>
                    <td className="px-4 py-2.5 text-right font-medium text-amber-500 whitespace-nowrap">
                      {isUnknown ? "—" : `৳${p.cogs.toLocaleString()}`}
                    </td>
                    <td
                      className={`px-4 py-2.5 text-right font-bold whitespace-nowrap ${
                        isLoss
                          ? "text-red-400"
                          : isUnknown
                          ? "text-[var(--ui-text-muted)]"
                          : "text-emerald-500"
                      }`}
                    >
                      {isUnknown ? `৳${p.netRevenue.toLocaleString()}*` : `৳${p.grossProfit.toLocaleString()}`}
                    </td>
                    <td className="px-4 py-2.5 text-center whitespace-nowrap">
                      {isUnknown ? (
                        <span className="inline-flex items-center gap-1 bg-amber-500/15 text-amber-500 border border-amber-500/30 px-2 py-0.5 rounded text-[10px] font-semibold">
                          <FiAlertTriangle className="w-3 h-3 text-amber-500" /> Unverified
                        </span>
                      ) : (
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                            isLoss
                              ? "bg-red-500/15 text-red-400 border border-red-500/30"
                              : p.grossMargin! < 20
                              ? "bg-amber-500/15 text-amber-500 border border-amber-500/30"
                              : "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30"
                          }`}
                        >
                          {p.grossMargin}%
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-center whitespace-nowrap">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                          p.costSource === "SNAPSHOT"
                            ? "bg-blue-500/15 text-blue-500 border-blue-500/30"
                            : p.costSource === "MIGRATED"
                            ? "bg-purple-500/15 text-purple-400 border-purple-500/30"
                            : "bg-[var(--ui-surface-muted)] text-[var(--ui-text-muted)] border-[var(--ui-border)]"
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
                <td colSpan={9} className="text-center py-8 text-[var(--ui-text-muted)] italic">
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
