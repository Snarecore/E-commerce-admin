import { FiPieChart } from "react-icons/fi";

interface CategoryItem {
  mainCategoryId: string | null;
  categoryName: string;
  ordersCount: number;
  quantitySold: number;
  netRevenue: number;
  cogs: number;
  grossProfit: number;
  grossMargin: number;
}

interface CategoryProfitabilityChartProps {
  categories: CategoryItem[];
  isLoading: boolean;
  selectedCategoryId: string | null;
  onSelectCategory: (id: string | null) => void;
}

export default function CategoryProfitabilityChart({
  categories,
  isLoading,
  selectedCategoryId,
  onSelectCategory,
}: CategoryProfitabilityChartProps) {
  const maxRevenue = Math.max(...categories.map((c) => c.netRevenue), 1);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
            <FiPieChart className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-800">Category Profitability</h3>
            <p className="text-xs text-gray-400">Contribution breakdown by main category</p>
          </div>
        </div>

        {selectedCategoryId && (
          <button
            onClick={() => onSelectCategory(null)}
            className="text-xs font-semibold text-orange-600 hover:underline cursor-pointer"
          >
            Clear Category Filter
          </button>
        )}
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-6 text-xs text-gray-400">Loading categories...</div>
        ) : categories.length > 0 ? (
          categories.map((c, idx) => {
            const pct = Math.round((c.netRevenue / maxRevenue) * 100);
            const isSelected = selectedCategoryId === c.mainCategoryId;

            return (
              <div
                key={c.mainCategoryId || idx}
                onClick={() =>
                  c.mainCategoryId &&
                  onSelectCategory(isSelected ? null : c.mainCategoryId)
                }
                className={`p-3 rounded-lg border transition-all cursor-pointer ${
                  isSelected
                    ? "border-orange-500 bg-orange-50/40 ring-1 ring-orange-500"
                    : "border-gray-100 hover:border-gray-300 hover:bg-gray-50/60"
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-bold text-gray-900 truncate max-w-[180px]">
                    {c.categoryName}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">{c.quantitySold} sold</span>
                    <span className="font-bold text-emerald-600">
                      ৳{c.grossProfit.toLocaleString()}
                    </span>
                    <span className="bg-gray-100 text-gray-700 font-bold px-1.5 py-0.5 rounded text-[10px]">
                      {c.grossMargin}%
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-orange-500 to-amber-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-6 text-xs text-gray-400 italic">
            No category data available for selected scope.
          </div>
        )}
      </div>
    </div>
  );
}
