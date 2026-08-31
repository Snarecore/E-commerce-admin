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

const defaultTopCategories: TopCategory[] = [
  { category: "Men's Collection", sales: 0 },
  { category: "Girls Collection", sales: 0 },
  { category: "Kids Collection", sales: 0 },
  { category: "Others", sales: 0 },
];

const DoughnutChart = ({
  totalCategories = 0,
  totalProducts = 0,
  topCategories,
}: DoughnutChartProps) => {
  // Format categories so they prioritize Men's, Girls, Kids, and Others
  const categoriesToDisplay: TopCategory[] = (() => {
    if (!topCategories || topCategories.length === 0) {
      return defaultTopCategories;
    }

    let mensSales = 0;
    let girlsSales = 0;
    let kidsSales = 0;
    let othersSales = 0;

    topCategories.forEach((item) => {
      if (!item) return;
      const name = item.category ? String(item.category).toLowerCase() : "";
      const sales = Number(item.sales || 0);
      if (name.includes('men') && !name.includes('women')) {
        mensSales += sales;
      } else if (name.includes('girl') || name.includes('women') || name.includes('lady') || name.includes('female')) {
        girlsSales += sales;
      } else if (name.includes('kid') || name.includes('child') || name.includes('baby')) {
        kidsSales += sales;
      } else {
        othersSales += sales;
      }
    });

    const result: TopCategory[] = [
      { category: "Men's Collection", sales: mensSales },
      { category: "Girls Collection", sales: girlsSales },
      { category: "Kids Collection", sales: kidsSales },
      { category: "Others", sales: othersSales },
    ];

    return result;
  })();

  const chartData = categoriesToDisplay.map((item) => item.sales);
  const chartLabels = categoriesToDisplay.map((item) => item.category);
  const chartColors = ['#1b2850', '#FE9F43', '#28c76f', '#00cfe8'];

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
        hoverOffset: 12,
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
        callbacks: {
          label: function (context: any) {
            return `${context.label}: ${context.raw} Sales`;
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
    value: item.sales,
    color: chartColors[index % chartColors.length],
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
