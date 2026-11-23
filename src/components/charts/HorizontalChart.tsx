import { useMemo, useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { FiGrid } from "react-icons/fi";
import { useAppearance } from "../../theme";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const valueLabels = {
  id: "valueLabelsHorizontal",
  afterDatasetsDraw(chart: any, _args: any, pluginOptions: any) {
    try {
      const dataset = chart?.data?.datasets?.[0];
      if (!dataset || !Array.isArray(dataset.data)) return;

      const { ctx, chartArea } = chart;
      if (!ctx || !chartArea) return;

      const meta = chart?.getDatasetMeta?.(0);
      if (!meta || !Array.isArray(meta?.data)) return;

      ctx.save();
      ctx.font = "12px system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial";
      ctx.fillStyle = pluginOptions?.color || "#6b7280";

      meta.data.forEach((bar: any, i: number) => {
        if (!bar) return;
        const v = dataset.data[i];
        if (v == null) return;
        const x = Math.min((bar.x || 0) + 8, (chartArea.right || 0) - 16);
        const y = (bar.y || 0) + 4;
        ctx.fillText(String(v), x, y);
      });

      ctx.restore();
    } catch {
      // Ignore plugin errors safely
    }
  },
};

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DEFAULT_DATA = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

interface HorizontalChartProps {
  title?: string;
  dataValues?: number[];
  barColor?: string;
  cardBg?: string;
}

export default function NewAgentsBar({
  title = "New Registered Customers",
  dataValues = DEFAULT_DATA,
  barColor,
  cardBg,
}: HorizontalChartProps) {
  const { resolved } = useAppearance();
  const effectiveBarColor = barColor && barColor !== "#FE9F43" ? barColor : resolved.palette.accent;

  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );

  const values = Array.isArray(dataValues) && dataValues.length === 12 ? dataValues : DEFAULT_DATA;

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const safeMax = Math.max(...(values?.length ? values : [10]), 10);
  const suggestedMax = Math.ceil((isNaN(safeMax) ? 10 : safeMax) * 1.15);

  const data = useMemo(
    () => ({
      labels: months,
      datasets: [
        {
          data: values,
          backgroundColor: effectiveBarColor,
          borderRadius: {
            topRight: windowWidth < 768 ? 4 : 8,
            bottomRight: windowWidth < 768 ? 4 : 8,
            topLeft: 0,
            bottomLeft: 0,
          },
          borderSkipped: false,
          barThickness: windowWidth < 768 ? 8 : windowWidth < 1440 ? 9 : 13,
          maxBarThickness: windowWidth < 768 ? 10 : windowWidth < 1440 ? 12 : 18,
        },
      ],
    }),
    [values, effectiveBarColor, windowWidth]
  );

  const options = useMemo(
    () => ({
      indexAxis: "y" as const,
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: {
          top: 6,
          right: 14,
          bottom: 6,
          left: 6,
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false },
        valueLabelsHorizontal: { color: resolved.palette.text },
      },
      scales: {
        x: {
          display: false,
          grid: { display: false },
          min: 0,
          suggestedMax,
        },
        y: {
          grid: { display: false },
          ticks: {
            color: resolved.palette.textMuted,
            font: {
              size: windowWidth < 768 ? 9 : 11,
            },
            padding: windowWidth < 768 ? 4 : 6,
          },
        },
      },
    }),
    [suggestedMax, windowWidth, resolved.palette.text, resolved.palette.textMuted]
  );

  return (
    <div
      className="w-full rounded-lg shadow-xs border border-[var(--ui-border)] bg-[var(--ui-surface)] p-3.5 sm:p-4 2xl:p-6 transition-colors duration-200"
      style={cardBg && cardBg !== "#ffffff" ? { background: cardBg } : undefined}
    >
      <div className="flex items-center gap-2.5 mb-3">
        <span
          className="p-1.5 2xl:p-2 rounded-full transition-colors"
          style={{
            backgroundColor: "var(--primary-color-light)",
            color: "var(--primary-color)",
          }}
        >
          <FiGrid size={18} />
        </span>
        <p className="text-lg sm:text-xl 2xl:text-2xl font-bold text-[var(--ui-text)]">{title}</p>
      </div>

      <div className="border-b border-[var(--ui-border)] mb-3 2xl:mb-5"></div>

      <div className="relative w-full h-[210px] sm:h-[230px] 2xl:h-[300px]">
        <Bar data={data} options={options} plugins={[valueLabels]} />
      </div>
    </div>
  );
}
