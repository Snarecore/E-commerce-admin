import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { FiBarChart2 } from 'react-icons/fi';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export interface MonthlySalesCommissionDataProps {
  month: string;
  totalSales: string | number;
  totalCommission: string | number;
}

interface SalesPurchaseChartProps {
  monthlySalesCommissionData?: MonthlySalesCommissionDataProps[];
}

const SalesPurchaseChart = ({ monthlySalesCommissionData = [] }: SalesPurchaseChartProps) => {
  const monthlySales = Array(12).fill(0);
  const monthlyCommissions = Array(12).fill(0);

  monthlySalesCommissionData.forEach((entry) => {
    try {
      const dateStr = entry.month.includes('-') && entry.month.split('-').length === 2 ? `${entry.month}-01` : entry.month;
      const date = new Date(dateStr);
      const monthIndex = isNaN(date.getTime()) ? 0 : date.getMonth();
      monthlySales[monthIndex] += parseFloat(String(entry.totalSales || 0));
      monthlyCommissions[monthIndex] += parseFloat(String(entry.totalCommission || 0));
    } catch {
      // fallback
    }
  });

  const data = {
    labels: monthNames,
    datasets: [
      {
        label: 'Total Sales',
        data: monthlySales,
        backgroundColor: '#FE9F43',
        stack: 'stack1',
      },
      {
        label: 'Total Commission',
        data: monthlyCommissions,
        backgroundColor: '#F9C1A4',
        borderRadius: 8,
        stack: 'stack1',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 10,
        bottom: 10,
        left: 0,
        right: 0,
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        displayColors: false,
        callbacks: {
          label: (context: any) => {
            const label = context.dataset.label || '';
            const value = context.parsed.y || 0;
            return `${label}: $${value.toLocaleString()}`;
          },
        },
      },
    },
    interaction: {
      mode: 'nearest' as const,
      intersect: true,
    },
    scales: {
      x: {
        stacked: true,
        grid: {
          display: false,
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 12,
          },
        },
      },
      y: {
        stacked: true,
        beginAtZero: true,
        ticks: {
          callback: (value: any) => `$${value}`,
          color: '#6B7280',
          font: {
            size: 12,
          },
        },
        grid: {
          color: '#E5E7EB',
        },
      },
    },
  };

  const totalSales = monthlySales.reduce((acc, val) => acc + val, 0);
  const totalCommissions = monthlyCommissions.reduce((acc, val) => acc + val, 0);

  return (
    <div className="w-full mx-auto bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <p className="text-2xl font-bold flex items-center gap-3 text-gray-800">
          <span className="bg-orange-50 text-[#FE9F43] p-2 rounded-full">
            <FiBarChart2 size={22} />
          </span>
          Sales vs Commissions
        </p>
      </div>

      <div className="border-b border-gray-200 mb-6"></div>

      <div className="flex flex-wrap gap-4 mb-6">
        <div className="text-md border border-gray-200 rounded-lg p-3 min-w-[140px] flex-1">
          <div className="flex items-center gap-2 text-gray-600 text-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FE9F43]"></span>
            <span>Total Sales</span>
          </div>
          <p className="font-bold text-xl mt-1 text-gray-800">${totalSales.toLocaleString()}</p>
        </div>

        <div className="text-md border border-gray-200 rounded-lg p-3 min-w-[140px] flex-1">
          <div className="flex items-center gap-2 text-gray-600 text-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F9C1A4]"></span>
            <span>Total Commissions</span>
          </div>
          <p className="font-bold text-xl mt-1 text-gray-800">${totalCommissions.toLocaleString()}</p>
        </div>
      </div>

      <div className="relative w-full h-[280px]">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};

export default SalesPurchaseChart;
