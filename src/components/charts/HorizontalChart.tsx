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

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const valueLabels = {
  id: "valueLabelsHorizontal",
  afterDatasetsDraw(chart: any, _args: any, pluginOptions: any) {
    const dataset = chart?.data?.datasets?.[0];
    if (!dataset) return;

    const { ctx, chartArea } = chart;
    const meta = chart.getDatasetMeta(0);
    ctx.save();
    ctx.font = "12px system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial";
    ctx.fillStyle = pluginOptions?.color || "#1f2544";

    meta.data.forEach((bar: any, i: number) => {
      const v = dataset.data[i];
      if (v == null) return;
      const x = Math.min(bar.x + 8, chartArea.right - 16);
      const y = bar.y + 4;
      ctx.fillText(String(v), x, y);
    });

    ctx.restore();
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
  title = "New added vendor",
  dataValues = DEFAULT_DATA,
  barColor = "#FE9F43",
  cardBg = "#ffffff",
}: HorizontalChartProps) {
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

  const suggestedMax = Math.ceil(Math.max(...values, 10) * 1.15);

  const data = useMemo(
    () => ({
      labels: months,
      datasets: [
        {
          data: values,
          backgroundColor: barColor,
          borderRadius: {
            topRight: windowWidth < 768 ? 6 : 10,
            bottomRight: windowWidth < 768 ? 6 : 10,
            topLeft: 0,
            bottomLeft: 0,
          },
          borderSkipped: false,
          barThickness: windowWidth < 768 ? 10 : windowWidth < 1024 ? 12 : 14,
          maxBarThickness: windowWidth < 768 ? 14 : windowWidth < 1024 ? 16 : 20,
        },
      ],
    }),
    [values, barColor, windowWidth]
  );

  const options = useMemo(
    () => ({
      indexAxis: "y" as const,
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: {
          top: 8,
          right: 16,
          bottom: 8,
          left: 8,
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false },
        valueLabelsHorizontal: { color: "#1f2544" },
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
            color: "#6b7280",
            font: {
              size: windowWidth < 768 ? 10 : 12,
            },
            padding: windowWidth < 768 ? 4 : 8,
          },
        },
      },
    }),
    [suggestedMax, windowWidth]
  );

  return (
    <div
      className="w-full rounded-2xl shadow-sm border border-gray-100 p-6"
      style={{ background: cardBg }}
    >
      <div className="flex items-center gap-3 mb-4">
        <span className="bg-orange-50 text-[#FE9F43] p-2 rounded-full">
          <FiGrid size={20} />
        </span>
        <p className="text-2xl font-bold text-gray-800">{title}</p>
      </div>

      <div className="border-b border-gray-200 mb-6"></div>

      <div className="relative w-full h-[320px]">
        <Bar data={data} options={options} plugins={[valueLabels]} />
      </div>
    </div>
  );
}
