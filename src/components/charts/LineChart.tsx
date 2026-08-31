import { useMemo, useRef } from "react";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { FiGrid } from "react-icons/fi";

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Filler, Tooltip, Legend);

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DEFAULT_VALUES = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

const hoverLine = {
  id: "hoverLine",
  afterDatasetsDraw(chart: any) {
    try {
      const { ctx, tooltip, chartArea } = chart;
      if (!ctx || !chartArea || !tooltip) return;

      const active = tooltip?.getActiveElements?.() || [];
      if (!active.length || !active[0] || !active[0].element) return;

      const x = active[0].element.x;
      const y = active[0].element.y;
      if (x == null || y == null) return;

      ctx.save();
      ctx.setLineDash([4, 6]);
      ctx.strokeStyle = "#FE9F43";
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, chartArea.bottom);
      ctx.stroke();
      ctx.restore();
    } catch {
      // Ignore hover line errors safely
    }
  },
};

interface MonthlyReportsLineProps {
  title?: string;
  values?: number[];
  label?: string;
  lineColor?: string;
  pointBorder?: string;
}

export default function MonthlyReportsLine({
  title = "Customer Reports by Month",
  values = DEFAULT_VALUES,
  label = "Monthly Activity",
  lineColor = "#FE9F43",
  pointBorder = "#FE9F43",
}: MonthlyReportsLineProps) {
  const chartRef = useRef(null);

  const chartValues = Array.isArray(values) && values.length === 12 ? values : DEFAULT_VALUES;

  const data = useMemo(
    () => ({
      labels: months,
      datasets: [
        {
          label,
          data: chartValues,
          tension: 0.35,
          borderColor: lineColor,
          borderWidth: 4,
          pointRadius: 5,
          pointHoverRadius: 5,
          pointBorderWidth: 3,
          pointHoverBorderWidth: 3,
          pointBackgroundColor: "#ffffff",
          pointBorderColor: pointBorder,
          pointHoverBackgroundColor: "#ffffff",
          pointHoverBorderColor: pointBorder,
          fill: true,
          backgroundColor: (ctx: any) => {
            const chart = ctx.chart;
            const { ctx: c, chartArea } = chart;
            if (!chartArea) return "rgba(254,159,67,0.15)";
            const grad = c.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
            grad.addColorStop(0, "rgba(254,159,67,0.05)");
            grad.addColorStop(1, "rgba(254,159,67,0.3)");
            return grad;
          },
        },
      ],
    }),
    [chartValues, label, lineColor, pointBorder]
  );

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index" as const, intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          enabled: true,
          displayColors: false,
          backgroundColor: "#111827",
          titleColor: "#D1D5DB",
          bodyColor: "#FFFFFF",
          cornerRadius: 8,
          padding: 12,
          callbacks: {
            title: () => label,
            label: (ctx: any) => Number(ctx.parsed.y).toLocaleString(),
            labelTextColor: () => "#FFFFFF",
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: "#6B7280", font: { size: 12 } },
        },
        y: {
          beginAtZero: true,
          grid: {
            color: "rgba(17,24,39,0.06)",
          },
          ticks: {
            color: "#9CA3AF",
            font: { size: 12 },
            callback: (v: any) => v,
          },
          suggestedMax: Math.max(Math.max(...(chartValues?.length ? chartValues : [10]), 10) * 1.15, 10),
        },
      },
    }),
    [chartValues, label]
  );

  return (
    <div className="w-full rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
      <div className="flex items-center gap-3 mb-4">
        <span className="bg-orange-50 text-[#FE9F43] p-2 rounded-full">
          <FiGrid size={20} />
        </span>
        <p className="text-2xl font-bold text-gray-800">{title}</p>
      </div>

      <div className="border-b border-gray-200 mb-6"></div>

      <div className="relative h-[320px]">
        <Line ref={chartRef} data={data} options={options} plugins={[hoverLine]} />
      </div>
    </div>
  );
}
