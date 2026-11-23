import { useMemo } from 'react';
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
import { useAppearance } from '../../theme';

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
  const { resolved } = useAppearance();

  const { monthlySales, monthlyCommissions } = useMemo(() => {
    const sales = Array(12).fill(0);
    const comms = Array(12).fill(0);

    monthlySalesCommissionData.forEach((entry) => {
      try {
        const dateStr = entry.month.includes('-') && entry.month.split('-').length === 2 ? `${entry.month}-01` : entry.month;
        const date = new Date(dateStr);
        const monthIndex = isNaN(date.getTime()) ? 0 : date.getMonth();
        sales[monthIndex] += parseFloat(String(entry.totalSales || 0));
        comms[monthIndex] += parseFloat(String(entry.totalCommission || 0));
      } catch {
        // fallback
      }
    });

    return { monthlySales: sales, monthlyCommissions: comms };
  }, [monthlySalesCommissionData]);

  const salesColor = resolved.palette.accent;
  const commissionColor = resolved.palette.accentMuted || '#F9C1A4';

  const data = useMemo(() => ({
    labels: monthNames,
    datasets: [
      {
        label: 'Total Sales',
        data: monthlySales,
        backgroundColor: salesColor,
        stack: 'stack1',
      },
      {
        label: 'Total Commission',
        data: monthlyCommissions,
        backgroundColor: commissionColor,
        borderRadius: 8,
        stack: 'stack1',
      },
    ],
  }), [monthlySales, monthlyCommissions, salesColor, commissionColor]);

  const options = useMemo(() => ({
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
        backgroundColor: resolved.palette.isDark ? '#1e293b' : '#0f172a',
        titleColor: '#f8fafc',
        bodyColor: '#f8fafc',
        borderColor: resolved.palette.border,
        borderWidth: 1,
        callbacks: {
          label: (context: any) => {
            const label = context.dataset.label || '';
            const value = context.parsed.y || 0;
            return `${label}: ৳${value.toLocaleString()}`;
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
          color: resolved.palette.textMuted,
          font: {
            size: 12,
          },
        },
      },
      y: {
        stacked: true,
        beginAtZero: true,
        ticks: {
          callback: (value: any) => `৳${value}`,
          color: resolved.palette.textMuted,
          font: {
            size: 12,
          },
        },
        grid: {
          color: resolved.palette.isDark ? 'rgba(255,255,255,0.08)' : '#E5E7EB',
        },
      },
    },
  }), [resolved.palette.isDark, resolved.palette.border, resolved.palette.textMuted]);

  const totalSales = monthlySales.reduce((acc, val) => acc + val, 0);
  const totalCommissions = monthlyCommissions.reduce((acc, val) => acc + val, 0);

  return (
    <div className="w-full mx-auto bg-[var(--ui-surface)] p-3.5 sm:p-4 2xl:p-6 rounded-lg shadow-xs border border-[var(--ui-border)] transition-colors duration-200">
      <div className="flex items-center justify-between mb-3">
        <p className="text-lg sm:text-xl 2xl:text-2xl font-bold flex items-center gap-2.5 text-[var(--ui-text)]">
          <span
            className="p-1.5 2xl:p-2 rounded-full transition-colors"
            style={{
              backgroundColor: 'var(--primary-color-light)',
              color: 'var(--primary-color)',
            }}
          >
            <FiBarChart2 size={18} />
          </span>
          Sales vs Commissions
        </p>
      </div>

      <div className="border-b border-[var(--ui-border)] mb-3 2xl:mb-5"></div>

      <div className="flex flex-wrap gap-2.5 sm:gap-3 mb-3 2xl:mb-5">
        <div className="border border-[var(--ui-border)] bg-[var(--ui-surface-muted)] rounded-lg p-2.5 sm:p-3 min-w-[120px] flex-1">
          <div className="flex items-center gap-2 text-[var(--ui-text-muted)] text-xs sm:text-sm">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: salesColor }}></span>
            <span>Total Sales</span>
          </div>
          <p className="font-bold text-base sm:text-lg 2xl:text-xl mt-0.5 text-[var(--ui-text)]">৳{totalSales.toLocaleString()}</p>
        </div>

        <div className="border border-[var(--ui-border)] bg-[var(--ui-surface-muted)] rounded-lg p-2.5 sm:p-3 min-w-[120px] flex-1">
          <div className="flex items-center gap-2 text-[var(--ui-text-muted)] text-xs sm:text-sm">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: commissionColor }}></span>
            <span>Total Commissions</span>
          </div>
          <p className="font-bold text-base sm:text-lg 2xl:text-xl mt-0.5 text-[var(--ui-text)]">৳{totalCommissions.toLocaleString()}</p>
        </div>
      </div>

      <div className="relative w-full h-[210px] sm:h-[230px] 2xl:h-[280px]">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};

export default SalesPurchaseChart;
