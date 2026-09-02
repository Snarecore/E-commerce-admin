import { useMemo } from "react";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { FiTrendingUp } from "react-icons/fi";

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend, Filler);

interface TrendItem {
  date: string;
  ordersCount: number;
  netRevenue: number;
  cogs: number;
  grossProfit: number;
  netProfit: number;
}

interface ProfitTrendChartProps {
  trendData: TrendItem[];
  isLoading: boolean;
  period: string;
  setPeriod: (period: "daily" | "weekly" | "monthly" | "yearly") => void;
}

export default function ProfitTrendChart({
  trendData,
  isLoading,
  period,
  setPeriod,
}: ProfitTrendChartProps) {
  const chartData = useMemo(() => {
    const labels = trendData.map((t) => t.date);
    const revenueData = trendData.map((t) => t.netRevenue);
    const cogsData = trendData.map((t) => t.cogs);
    const profitData = trendData.map((t) => t.netProfit);

    return {
      labels: labels.length > 0 ? labels : ["No Data"],
      datasets: [
        {
          label: "Net Revenue (৳)",
          data: revenueData.length > 0 ? revenueData : [0],
          borderColor: "#3B82F6", // Blue
          backgroundColor: "rgba(59, 130, 246, 0.05)",
          borderWidth: 3,
          tension: 0.3,
          pointRadius: 4,
          pointBackgroundColor: "#3B82F6",
          fill: true,
        },
        {
          label: "COGS (৳)",
          data: cogsData.length > 0 ? cogsData : [0],
          borderColor: "#F59E0B", // Amber
          backgroundColor: "transparent",
          borderWidth: 2,
          borderDash: [5, 5],
          tension: 0.3,
          pointRadius: 3,
          pointBackgroundColor: "#F59E0B",
        },
        {
          label: "Net Profit (৳)",
          data: profitData.length > 0 ? profitData : [0],
          borderColor: "#EA580C", // Orange
          backgroundColor: "rgba(234, 88, 12, 0.1)",
          borderWidth: 3,
          tension: 0.3,
          pointRadius: 4,
          pointBackgroundColor: "#EA580C",
          fill: true,
        },
      ],
    };
  }, [trendData]);

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index" as const, intersect: false },
      plugins: {
        legend: {
          display: true,
          position: "top" as const,
          labels: { font: { size: 12, weight: "bold" }, usePointStyle: true },
        },
        tooltip: {
          enabled: true,
          backgroundColor: "#1F2937",
          padding: 12,
          callbacks: {
            label: (ctx: any) => `${ctx.dataset.label}: ৳${Number(ctx.parsed.y).toLocaleString()}`,
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: "#6B7280", font: { size: 11 } },
        },
        y: {
          beginAtZero: true,
          grid: { color: "rgba(107, 114, 128, 0.1)" },
          ticks: {
            color: "#6B7280",
            font: { size: 11 },
            callback: (v: any) => `৳${v}`,
          },
        },
      },
    }),
    []
  );

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-4 border-b border-gray-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
            <FiTrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-800">Financial Trend</h3>
            <p className="text-xs text-gray-400">Revenue, COGS, and Profit trajectories</p>
          </div>
        </div>

        {/* Period Selector */}
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
          {(["daily", "weekly", "monthly", "yearly"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 rounded-md text-xs font-semibold capitalize transition-all cursor-pointer ${
                period === p
                  ? "bg-white text-orange-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[300px] relative">
        {isLoading ? (
          <div className="flex items-center justify-center h-full text-xs text-gray-400">
            Loading trend chart...
          </div>
        ) : (
          <Line data={chartData} options={options as any} />
        )}
      </div>
    </div>
  );
}
