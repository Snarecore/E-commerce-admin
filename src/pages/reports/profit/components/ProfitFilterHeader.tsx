import { FiDownload, FiFilter, FiCalendar } from "react-icons/fi";

interface ProfitFilterHeaderProps {
  datePreset: string;
  setDatePreset: (preset: string) => void;
  startDate: string;
  setStartDate: (date: string) => void;
  endDate: string;
  setEndDate: (date: string) => void;
  statusScope: string;
  setStatusScope: (scope: string) => void;
  customStatus: string;
  setCustomStatus: (status: string) => void;
  isExporting: boolean;
  onExportCsv: () => void;
}

export default function ProfitFilterHeader({
  datePreset,
  setDatePreset,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  statusScope,
  setStatusScope,
  customStatus,
  setCustomStatus,
  isExporting,
  onExportCsv,
}: ProfitFilterHeaderProps) {
  const PRESETS = [
    { label: "All Time", value: "all" },
    { label: "Today", value: "today" },
    { label: "7 Days", value: "7days" },
    { label: "30 Days", value: "30days" },
    { label: "This Month", value: "month" },
    { label: "Custom", value: "custom" },
  ];

  const STATUS_OPTIONS = [
    "Pending",
    "Order Placed",
    "Processing",
    "Shipped",
    "Delivered",
    "Completed",
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-4 shadow-sm">
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Profit & Financial Report</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Real-time profit margins, COGS, and revenue performance analytics
          </p>
        </div>

        <button
          onClick={onExportCsv}
          disabled={isExporting}
          className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-300 text-white font-medium text-sm px-4 py-2 rounded-lg shadow transition-all cursor-pointer"
        >
          <FiDownload className="w-4 h-4" />
          {isExporting ? "Exporting CSV..." : "Export CSV Report"}
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        {/* Date Presets */}
        <div className="flex items-center gap-1.5 bg-gray-50 p-1 rounded-lg border border-gray-200">
          {PRESETS.map((p) => (
            <button
              key={p.value}
              onClick={() => setDatePreset(p.value)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                datePreset === p.value
                  ? "bg-white text-orange-600 shadow-sm border border-gray-200"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Custom Range Picker */}
        {datePreset === "custom" && (
          <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
            <FiCalendar className="w-4 h-4 text-gray-400" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent text-xs font-medium text-gray-800 focus:outline-none"
            />
            <span className="text-xs text-gray-400">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent text-xs font-medium text-gray-800 focus:outline-none"
            />
          </div>
        )}

        {/* Status Scope Selector */}
        <div className="flex items-center gap-2 text-xs">
          <FiFilter className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-gray-500 font-medium">Status Scope:</span>
          <select
            value={statusScope}
            onChange={(e) => setStatusScope(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-gray-800 focus:outline-none focus:border-orange-500"
          >
            <option value="DELIVERED_COMPLETED">Delivered + Completed (Default)</option>
            <option value="ACTIVE_ALL">All Active Orders (Excl. Cancelled)</option>
            <option value="CUSTOM">Custom Status</option>
          </select>

          {statusScope === "CUSTOM" && (
            <select
              value={customStatus}
              onChange={(e) => setCustomStatus(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-gray-800 focus:outline-none focus:border-orange-500"
            >
              <option value="">Select Status</option>
              {STATUS_OPTIONS.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>
    </div>
  );
}
