import { FiDollarSign as DollarIcon, FiShoppingBag as BagIcon, FiTrendingUp as UpIcon, FiAlertCircle as AlertIcon, FiTruck as TruckIcon, FiTag as TagIcon, FiPieChart as PieIcon, FiInfo as InfoIcon } from "react-icons/fi";

interface SummaryData {
  grossSales: number;
  productDiscount: number;
  couponDiscount: number;
  netRevenue: number;
  cogs: number;
  grossProfit: number;
  deliveryCollected: number;
  courierCost: number;
  isCourierCostTracked: boolean;
  netProfit: number;
  grossMargin: number;
  netMargin: number;
  deliveredOrders: number;
  averageNetProfitPerOrder: number;
  unknownCostItemCount: number;
}

interface ProfitOverviewCardsProps {
  summary: SummaryData | null;
  isLoading: boolean;
}

export default function ProfitOverviewCards({ summary, isLoading }: ProfitOverviewCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-white p-5 rounded-xl border border-gray-200 animate-pulse h-28" />
        ))}
      </div>
    );
  }

  if (!summary) return null;

  const cards = [
    {
      title: "Net Product Revenue",
      value: `৳${summary.netRevenue.toLocaleString()}`,
      subtext: `Subtotal minus ৳${summary.couponDiscount.toLocaleString()} coupons`,
      icon: <DollarIcon className="w-5 h-5 text-blue-600" />,
      bg: "bg-blue-50 text-blue-800 border-blue-100",
    },
    {
      title: "COGS (Cost of Goods)",
      value: `৳${summary.cogs.toLocaleString()}`,
      subtext: "Historical cost price snapshot",
      icon: <BagIcon className="w-5 h-5 text-amber-600" />,
      bg: "bg-amber-50 text-amber-800 border-amber-100",
    },
    {
      title: "Gross Profit",
      value: `৳${summary.grossProfit.toLocaleString()}`,
      subtext: `Revenue minus COGS`,
      icon: <UpIcon className="w-5 h-5 text-emerald-600" />,
      bg: "bg-emerald-50 text-emerald-800 border-emerald-100",
    },
    {
      title: "Net Profit",
      value: `৳${summary.netProfit.toLocaleString()}`,
      subtext: `Incl. ৳${summary.deliveryCollected.toLocaleString()} delivery fee`,
      icon: <UpIcon className="w-5 h-5 text-orange-600" />,
      bg: "bg-orange-50 text-orange-800 border-orange-100",
    },
    {
      title: "Gross Margin %",
      value: `${summary.grossMargin}%`,
      subtext: "Gross Profit / Net Revenue",
      icon: <PieIcon className="w-5 h-5 text-purple-600" />,
      bg: "bg-purple-50 text-purple-800 border-purple-100",
    },
    {
      title: "Net Margin %",
      value: `${summary.netMargin}%`,
      subtext: "Net Profit / Net Revenue",
      icon: <PieIcon className="w-5 h-5 text-indigo-600" />,
      bg: "bg-indigo-50 text-indigo-800 border-indigo-100",
    },
    {
      title: "Orders Included",
      value: summary.deliveredOrders.toLocaleString(),
      subtext: "Completed/Delivered scope",
      icon: <TruckIcon className="w-5 h-5 text-sky-600" />,
      bg: "bg-sky-50 text-sky-800 border-sky-100",
    },
    {
      title: "Avg Net Profit / Order",
      value: `৳${summary.averageNetProfitPerOrder.toLocaleString()}`,
      subtext: "Net Profit per completed order",
      icon: <TagIcon className="w-5 h-5 text-teal-600" />,
      bg: "bg-teal-50 text-teal-800 border-teal-100",
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c, idx) => (
          <div
            key={idx}
            className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between hover:border-gray-300 transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {c.title}
              </span>
              <div className={`p-2 rounded-lg border ${c.bg}`}>{c.icon}</div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold text-gray-900">{c.value}</span>
              <p className="text-[11px] text-gray-400 mt-1">{c.subtext}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Info & Warning Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-orange-50/60 border border-orange-200/70 text-orange-950 p-3.5 rounded-xl text-xs gap-3">
        <div className="flex items-center gap-2">
          <InfoIcon className="w-4 h-4 text-orange-600 shrink-0" />
          <span>
            Profit metrics calculated from <strong>{summary.deliveredOrders}</strong> qualifying orders.{" "}
            <em>Courier operational cost is not currently tracked.</em>
          </span>
        </div>

        {summary.unknownCostItemCount > 0 && (
          <div className="flex items-center gap-1.5 bg-amber-100 text-amber-900 border border-amber-200 px-3 py-1 rounded-md font-semibold text-[11px] shrink-0">
            <AlertIcon className="w-3.5 h-3.5 text-amber-600" />
            <span>{summary.unknownCostItemCount} items with unverified cost</span>
          </div>
        )}
      </div>
    </div>
  );
}
