import { useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { FiGrid } from 'react-icons/fi';
import { useAppearance } from '../../theme';

ChartJS.register(ArcElement, Tooltip, Legend);

export interface TopCategory {
  category: string;
  sales: number;
}

interface DoughnutChartProps {
  totalCategories?: number;
  totalProducts?: number;
  topCategories?: TopCategory[];
}

const DoughnutChart = ({
  totalCategories = 0,
  totalProducts = 0,
  topCategories = [],
}: DoughnutChartProps) => {
  const { resolved } = useAppearance();

  const dynamicPalette = useMemo(() => [
    '#1b2850',
    resolved.palette.accent,
    '#28c76f',
    '#00cfe8',
    '#8B5CF6',
    '#EC4899',
  ], [resolved.palette.accent]);

  // Use authoritative categories aggregated directly from backend database
  const categoriesToDisplay: TopCategory[] = useMemo(() => {
    if (topCategories && topCategories.length > 0) {
      return topCategories;
    }
    return [];
  }, [topCategories]);

  const hasSalesData = categoriesToDisplay.some((item) => Number(item.sales || 0) > 0);

  const chartData = hasSalesData
    ? categoriesToDisplay.map((item) => Number(item.sales || 0))
    : [1];

  const chartLabels = hasSalesData
    ? categoriesToDisplay.map((item) => item.category)
    : ["No Sales Data Yet"];

  const chartColors = hasSalesData
    ? categoriesToDisplay.map((_, i) => dynamicPalette[i % dynamicPalette.length])
    : [resolved.palette.isDark ? '#334155' : '#E5E7EB'];

  const data = useMemo(() => ({
    labels: chartLabels,
    datasets: [
      {
        data: chartData,
        backgroundColor: chartColors,
        borderWidth: 2,
        borderColor: resolved.palette.surface,
        borderRadius: 8,
        spacing: 4,
        hoverOffset: hasSalesData ? 12 : 0,
      },
    ],
  }), [chartLabels, chartData, chartColors, resolved.palette.surface, hasSalesData]);

  const options = useMemo(() => ({
    cutout: '50%',
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: 10,
    },
    animation: {
      animateRotate: true,
      duration: 1000,
      easing: 'easeInOutQuad' as const,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: hasSalesData,
        callbacks: {
          label: function (context: any) {
            return `${context.label}: ৳${Number(context.raw || 0).toLocaleString()}`;
          },
        },
        displayColors: false,
        backgroundColor: resolved.palette.isDark ? '#1e293b' : '#0f172a',
        borderColor: resolved.palette.border,
        borderWidth: 1,
        titleColor: '#f8fafc',
        bodyColor: '#f8fafc',
        cornerRadius: 8,
        padding: 10,
      },
    },
    hover: {
      mode: 'nearest' as const,
      animationDuration: 400,
    },
  }), [hasSalesData, resolved.palette.isDark, resolved.palette.border]);

  const legendItems = categoriesToDisplay.map((item, index) => ({
    label: item.category,
    value: Number(item.sales || 0),
    color: dynamicPalette[index % dynamicPalette.length],
  }));

  return (
    <div className="bg-[var(--ui-surface)] px-6 py-6 rounded-md shadow-sm border border-[var(--ui-border)] h-full flex flex-col justify-between transition-colors duration-200">
      <div>
        <div className="flex items-center gap-3 mb-4">
          <span
            className="p-2 rounded-full transition-colors"
            style={{
              backgroundColor: 'var(--primary-color-light)',
              color: 'var(--primary-color)',
            }}
          >
            <FiGrid size={20} />
          </span>
          <p className="text-2xl font-bold text-[var(--ui-text)]">Top Categories</p>
        </div>

        <div className="border-b border-[var(--ui-border)] mb-6"></div>

        <div className="flex items-center justify-around gap-4 my-4">
          <div className="h-48 w-48 relative">
            <Doughnut data={data} options={options} />
          </div>

          <div className="space-y-3">
            {legendItems.map((item, index) => (
              <div key={index}>
                <div className="flex items-center gap-2 text-xs text-[var(--ui-text-muted)]">
                  <span
                    className="w-1.5 h-3 rounded-full inline-block"
                    style={{ backgroundColor: item.color }}
                  ></span>
                  {item.label}
                </div>
                <div className="text-base font-semibold text-[var(--ui-text)] ml-3.5">
                  {item.value.toLocaleString()} <span className="text-xs font-normal text-[var(--ui-text-muted)] opacity-70">Sales</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <p className="text-sm font-semibold text-[var(--ui-text)]">Category Statistics</p>
        <div className="border border-[var(--ui-border)] bg-[var(--ui-surface-muted)] mt-2 rounded-lg divide-y divide-[var(--ui-border)]">
          <div className="flex items-center justify-between p-2.5">
            <p className="text-sm flex items-center gap-2 text-[var(--ui-text-muted)]">
              <span className="w-2 h-2 rounded-full inline-block bg-black"></span>
              Total Number Of Categories
            </p>
            <p className="text-sm font-semibold text-[var(--ui-text)]">{totalCategories}</p>
          </div>

          <div className="flex items-center justify-between p-2.5">
            <p className="text-sm flex items-center gap-2 text-[var(--ui-text-muted)]">
              <span className="w-2 h-2 rounded-full inline-block bg-[#28c76f]"></span>
              Total Number Of Products
            </p>
            <p className="text-sm font-semibold text-[var(--ui-text)]">{totalProducts}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoughnutChart;
