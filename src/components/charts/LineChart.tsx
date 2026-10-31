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
import { useAppearance } from "../../theme";
import { hexToRgb } from "../../theme/color";

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

      const strokeColor = chart.data?.datasets?.[0]?.borderColor || "#FE9F43";

      ctx.save();
      ctx.setLineDash([4, 6]);
      ctx.strokeStyle = strokeColor;
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
  lineColor,
  pointBorder,
}: MonthlyReportsLineProps) {
  const chartRef = useRef(null);
  const { resolved } = useAppearance();

  const effectiveLineColor = lineColor && lineColor !== "#FE9F43" ? lineColor : resolved.palette.accent;
  const effectivePointBorder = pointBorder && pointBorder !== "#FE9F43" ? pointBorder : resolved.palette.accent;
  const isDark = resolved.palette.isDark;

  const chartValues = Array.isArray(values) && values.length === 12 ? values : DEFAULT_VALUES;

  const data = useMemo(
    () => ({
      labels: months,
      datasets: [
        {
          label,
          data: chartValues,
          tension: 0.35,
          borderColor: effectiveLineColor,
          borderWidth: 4,
          pointRadius: 5,
          pointHoverRadius: 6,
          pointBorderWidth: 3,
          pointHoverBorderWidth: 3,
          pointBackgroundColor: resolved.palette.surface,
          pointBorderColor: effectivePointBorder,
          pointHoverBackgroundColor: resolved.palette.surface,
          pointHoverBorderColor: effectivePointBorder,
          fill: true,
          backgroundColor: (ctx: any) => {
            const chart = ctx.chart;
            const { ctx: c, chartArea } = chart;
            const { r, g, b } = hexToRgb(effectiveLineColor);
            if (!chartArea) return `rgba(${r},${g},${b},0.15)`;
            const grad = c.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
            grad.addColorStop(0, `rgba(${r},${g},${b},0.02)`);
            grad.addColorStop(1, `rgba(${r},${g},${b},0.3)`);
            return grad;
          },
        },
      ],
    }),
    [chartValues, label, effectiveLineColor, effectivePointBorder, resolved.palette.surface]
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
          backgroundColor: isDark ? "#1e293b" : "#111827",
          titleColor: "#D1D5DB",
          bodyColor: "#FFFFFF",
          borderColor: resolved.palette.border,
          borderWidth: 1,
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
          ticks: { color: resolved.palette.textMuted, font: { size: 12 } },
        },
        y: {
          beginAtZero: true,
          grid: {
            color: isDark ? "rgba(255,255,255,0.08)" : "rgba(17,24,39,0.06)",
          },
          ticks: {
            color: resolved.palette.textMuted,
            font: { size: 12 },
            callback: (v: any) => v,
          },
          suggestedMax: Math.max(Math.max(...(chartValues?.length ? chartValues : [10]), 10) * 1.15, 10),
        },
      },
    }),
    [chartValues, label, isDark, resolved.palette.border, resolved.palette.textMuted]
  );

  return (
    <div className="w-full rounded-md bg-[var(--ui-surface)] p-6 shadow-sm border border-[var(--ui-border)] transition-colors duration-200">
      <div className="flex items-center gap-3 mb-4">
        <span
          className="p-2 rounded-full transition-colors"
          style={{
            backgroundColor: "var(--primary-color-light)",
            color: "var(--primary-color)",
          }}
        >
          <FiGrid size={20} />
        </span>
        <p className="text-2xl font-bold text-[var(--ui-text)]">{title}</p>
      </div>

      <div className="border-b border-[var(--ui-border)] mb-6"></div>

      <div className="relative h-[320px]">
        <Line ref={chartRef} data={data} options={options} plugins={[hoverLine]} />
      </div>
    </div>
  );
}
