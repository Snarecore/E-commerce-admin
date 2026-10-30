import { useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { FiGrid } from 'react-icons/fi';

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

const PALETTE = ['#1b2850', '#FE9F43', '#28c76f', '#00cfe8', '#8B5CF6', '#EC4899'];

const DoughnutChart = ({
  totalCategories = 0,
  totalProducts = 0,
  topCategories = [],
}: DoughnutChartProps) => {
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
    ? categoriesToDisplay.map((_, i) => PALETTE[i % PALETTE.length])
    : ['#E5E7EB'];

  const data = {
    labels: chartLabels,
    datasets: [
      {
        data: chartData,
        backgroundColor: chartColors,
        borderWidth: 2,
        borderColor: '#fff',
        borderRadius: 8,
        spacing: 4,
        hoverOffset: hasSalesData ? 12 : 0,
      },
    ],
  };

  const options = {
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
      },
    },
    hover: {
      mode: 'nearest' as const,
      animationDuration: 400,
    },
  };

  const legendItems = categoriesToDisplay.map((item, index) => ({
    label: item.category,
    value: Number(item.sales || 0),
    color: PALETTE[index % PALETTE.length],
  }));

  return (
    <div className="bg-white px-6 py-6 rounded-2xl shadow-sm border border-gray-100 h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-3 mb-4">
          <span className="bg-orange-50 text-[#FE9F43] p-2 rounded-full">
            <FiGrid size={20} />
          </span>
          <p className="text-2xl font-bold text-gray-800">Top Categories</p>
        </div>

        <div className="border-b border-gray-200 mb-6"></div>

        <div className="flex items-center justify-around gap-4 my-4">
          <div className="h-48 w-48 relative">
            <Doughnut data={data} options={options} />
          </div>

          <div className="space-y-3">
            {legendItems.map((item, index) => (
              <div key={index}>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <span
                    className="w-1.5 h-3 rounded-full inline-block"
                    style={{ backgroundColor: item.color }}
                  ></span>
                  {item.label}
                </div>
                <div className="text-base font-semibold text-gray-800 ml-3.5">
                  {item.value.toLocaleString()} <span className="text-xs font-normal text-gray-500">Sales</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <p className="text-sm font-semibold text-gray-700">Category Statistics</p>
        <div className="border border-gray-200 mt-2 rounded-lg divide-y divide-gray-200">
          <div className="flex items-center justify-between p-2.5">
            <p className="text-sm flex items-center gap-2 text-gray-600">
              <span className="w-2 h-2 rounded-full inline-block bg-black"></span>
              Total Number Of Categories
            </p>
            <p className="text-sm font-semibold text-gray-800">{totalCategories}</p>
          </div>

          <div className="flex items-center justify-between p-2.5">
            <p className="text-sm flex items-center gap-2 text-gray-600">
              <span className="w-2 h-2 rounded-full inline-block bg-green-500"></span>
              Total Number Of Products
            </p>
            <p className="text-sm font-semibold text-gray-800">{totalProducts}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoughnutChart;
