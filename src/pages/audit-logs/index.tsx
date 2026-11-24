import { useState, useEffect } from "react";
import PageHeader from "../../components/cards/PageHeader";
import { useAPI } from "../../hooks/useApi";
import apiConfig from "../../config/api.json";
import { auditLogQueryKey } from "../../config/query-key";
import { AuditLogItem, AuditStats } from "../../models/audit-log-models";
import { 
    FiSearch, 
    FiEye, 
    FiActivity, 
    FiCheckCircle, 
    FiXCircle, 
    FiUser, 
    FiClock, 
    FiCopy, 
    FiCheck,
    FiShield,
    FiSliders
} from "react-icons/fi";
import { RxCross2 } from "react-icons/rx";
import RefreshButton from "../../components/table-components/RefreshButton";

const MODULE_OPTIONS = [
    { label: "All Modules", value: "" },
    { label: "Auth", value: "AUTH" },
    { label: "Product", value: "PRODUCT" },
    { label: "Inventory", value: "INVENTORY" },
    { label: "Order", value: "ORDER" },
    { label: "Category", value: "CATEGORY" },
    { label: "Coupon", value: "COUPON" },
    { label: "Settings", value: "SETTINGS" },
    { label: "Risk & Blacklist", value: "RISK" },
    { label: "Payments", value: "PAYMENTS" },
    { label: "CMS", value: "CMS" },
    { label: "User", value: "USER" },
];

const STATUS_OPTIONS = [
    { label: "All Status", value: "" },
    { label: "Success", value: "SUCCESS" },
    { label: "Failed", value: "FAILED" },
];

const AuditLogs = () => {
    const [page, setPage] = useState(1);
    const [limit] = useState(15);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [selectedModule, setSelectedModule] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("");
    const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);
    const [showRawJson, setShowRawJson] = useState(false);
    const [copiedField, setCopiedField] = useState<string | null>(null);

    const [statsData, setStatsData] = useState<AuditStats | null>(null);

    const { usePaginatedQuery, fetchData } = useAPI();

    const loadStats = async () => {
        try {
            const res = await fetchData({ apiUrl: apiConfig.audit.auditStatsUrl }) as any;
            if (res) {
                setStatsData(res);
            }
        } catch {
            // silent catch
        }
    };

    useEffect(() => {
        loadStats();
    }, []);

    // 300ms debounce on search
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 300);
        return () => clearTimeout(handler);
    }, [search]);

    const auditApiUrl = `${apiConfig.audit.auditLogsUrl}?page=${page}&limit=${limit}&sortBy=createdAt&sortOrder=DESC${
        debouncedSearch ? `&search=${encodeURIComponent(debouncedSearch)}` : ""
    }${selectedModule ? `&module=${selectedModule}` : ""}${selectedStatus ? `&status=${selectedStatus}` : ""}`;

    const {
        data: auditLogs,
        totalItems,
        pageCount,
        isLoading,
        isFetching,
        refetch: fetchAuditLogs
    } = usePaginatedQuery<AuditLogItem>({
        queryKey: [auditLogQueryKey, String(page), String(limit), debouncedSearch, selectedModule, selectedStatus],
        url: auditApiUrl,
        enabled: true,
        refetchOnWindowFocus: false
    });

    const handleRefreshAll = () => {
        fetchAuditLogs();
        loadStats();
    };

    const copyToClipboard = (text: string, fieldId: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(fieldId);
        setTimeout(() => setCopiedField(null), 2000);
    };

    const formatTimestamp = (dateStr: string) => {
        if (!dateStr) return "N/A";
        return new Date(dateStr).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true
        });
    };

    const getModuleBadgeColor = (moduleName: string) => {
        switch (moduleName) {
            case "AUTH":
                return "bg-purple-50 text-purple-700 border-purple-200";
            case "PRODUCT":
                return "bg-blue-50 text-blue-700 border-blue-200";
            case "INVENTORY":
                return "bg-cyan-50 text-cyan-700 border-cyan-200";
            case "ORDER":
                return "bg-emerald-50 text-emerald-700 border-emerald-200";
            case "CATEGORY":
                return "bg-indigo-50 text-indigo-700 border-indigo-200";
            case "COUPON":
                return "bg-pink-50 text-pink-700 border-pink-200";
            case "SETTINGS":
                return "bg-amber-50 text-amber-800 border-amber-200";
            case "RISK":
                return "bg-rose-50 text-rose-700 border-rose-200";
            case "PAYMENTS":
                return "bg-violet-50 text-violet-700 border-violet-200";
            case "CMS":
                return "bg-teal-50 text-teal-700 border-teal-200";
            default:
                return "bg-gray-50 text-gray-700 border-gray-200";
        }
    };

    const getActionBadgeColor = (action: string) => {
        if (action.includes("CREATE")) return "text-emerald-700 bg-emerald-50 border-emerald-200";
        if (action.includes("UPDATE") || action.includes("ADJUST") || action.includes("TOGGLE")) return "text-blue-700 bg-blue-50 border-blue-200";
        if (action.includes("DELETE") || action.includes("BLOCK")) return "text-red-700 bg-red-50 border-red-200";
        if (action.includes("LOGIN")) return "text-purple-700 bg-purple-50 border-purple-200";
        return "text-gray-700 bg-gray-50 border-gray-200";
    };

    // Calculate health percentage
    const healthPercentage = statsData?.total && statsData.total > 0
        ? Math.round((statsData.successCount / statsData.total) * 100)
        : 100;

    return (
        <div className="space-y-6">
            <PageHeader
                headerTitle="Audit Logs & Activity Trail"
                headerDescription="Comprehensive enterprise audit trail tracking administrative actions, configuration changes, stock movements, and system security events."
            />

            {/* KPI Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Audit Logs */}
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Total Audit Logs</p>
                        <h4 className="text-2xl font-black text-gray-900 mt-1">
                            {statsData?.total?.toLocaleString() ?? totalItems?.toLocaleString() ?? 0}
                        </h4>
                        <p className="text-[11px] text-gray-400 mt-0.5">Immutable audit trail</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl">
                        <FiActivity />
                    </div>
                </div>

                {/* Today's Activity */}
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Today's Actions</p>
                        <h4 className="text-2xl font-black text-gray-900 mt-1">
                            {statsData?.today?.toLocaleString() ?? 0}
                        </h4>
                        <p className="text-[11px] text-emerald-600 font-medium mt-0.5">Live monitoring</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl">
                        <FiClock />
                    </div>
                </div>

                {/* System Health / Success */}
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Success Health</p>
                        <h4 className="text-2xl font-black text-gray-900 mt-1">
                            {healthPercentage}%
                        </h4>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                            {statsData?.failedCount ?? 0} failed attempts
                        </p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-xl">
                        <FiShield />
                    </div>
                </div>

                {/* Active Admins */}
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Active Admins</p>
                        <h4 className="text-2xl font-black text-gray-900 mt-1">
                            {statsData?.topAdmins?.length ?? 1}
                        </h4>
                        <p className="text-[11px] text-gray-400 mt-0.5">Performing administrative tasks</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl">
                        <FiUser />
                    </div>
                </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
                    {/* Search Input */}
                    <div className="relative flex-1 min-w-[220px]">
                        <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by Admin, Email, Target ID, Route or IP..."
                            className="w-full pl-10 pr-8 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[var(--color-primary)] transition"
                        />
                        {search && (
                            <button
                                onClick={() => setSearch("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <RxCross2 size={14} />
                            </button>
                        )}
                    </div>

                    {/* Module Filter */}
                    <select
                        value={selectedModule}
                        onChange={(e) => {
                            setSelectedModule(e.target.value);
                            setPage(1);
                        }}
                        className="px-3.5 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-[var(--color-primary)] cursor-pointer text-gray-700 font-medium"
                    >
                        {MODULE_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>

                    {/* Status Filter */}
                    <select
                        value={selectedStatus}
                        onChange={(e) => {
                            setSelectedStatus(e.target.value);
                            setPage(1);
                        }}
                        className="px-3.5 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-[var(--color-primary)] cursor-pointer text-gray-700 font-medium"
                    >
                        {STATUS_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>

                    <RefreshButton onClick={handleRefreshAll} />
                </div>

                <div className="text-xs font-semibold text-gray-500">
                    Filtered Logs: <span className="text-gray-900 font-bold">{totalItems}</span>
                </div>
            </div>

            {/* Audit Logs Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/80 border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                                <th className="py-3.5 px-4">Timestamp</th>
                                <th className="py-3.5 px-4">Admin / Actor</th>
                                <th className="py-3.5 px-4">Module & Action</th>
                                <th className="py-3.5 px-4">Summary / Changes</th>
                                <th className="py-3.5 px-4">Target Entity</th>
                                <th className="py-3.5 px-4">IP Address</th>
                                <th className="py-3.5 px-4">Status</th>
                                <th className="py-3.5 px-4 text-center">Inspect</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {isLoading || isFetching ? (
                                <tr>
                                    <td colSpan={8} className="p-12 text-center text-gray-500 font-medium">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <FiActivity className="animate-spin text-2xl text-[var(--color-primary)]" />
                                            <span>Loading audit trails...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : !auditLogs || auditLogs.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="p-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <FiActivity className="text-3xl text-gray-300" />
                                            <span className="font-semibold text-gray-700">No audit records found</span>
                                            <span className="text-xs text-gray-400">Try adjusting your search criteria or filters</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                auditLogs.map((log) => {
                                    const changesObj = log.changes as any;
                                    const summaryText = changesObj?.summary || changesObj?.description || (
                                        changesObj?.changedFields
                                            ? `Updated fields: ${Object.keys(changesObj.changedFields).join(", ")}`
                                            : null
                                    );

                                    return (
                                        <tr key={log.id} className="hover:bg-gray-50/70 transition">
                                            <td className="py-3.5 px-4 whitespace-nowrap text-xs text-gray-600">
                                                <span className="font-medium text-gray-800 block">
                                                    {formatTimestamp(log.createdAt)}
                                                </span>
                                                {log.durationMs !== null && log.durationMs !== undefined && (
                                                    <span className="text-[10px] text-gray-400">
                                                        {log.durationMs}ms
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-gray-900 text-xs flex items-center gap-1.5">
                                                        <FiUser className="text-gray-400 text-[11px]" />
                                                        {log.actorName || "Unauthenticated"}
                                                    </span>
                                                    <span className="text-[11px] text-gray-500 truncate max-w-[150px]" title={log.actorEmail || ""}>
                                                        {log.actorEmail || "System/Guest"}
                                                    </span>
                                                    {log.actorRole && (
                                                        <span className="mt-0.5 inline-block text-[9px] uppercase font-bold text-[var(--color-primary)] tracking-wide">
                                                            {log.actorRole}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <div className="flex flex-col gap-1 items-start">
                                                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md border ${getModuleBadgeColor(log.module)}`}>
                                                        {log.module}
                                                    </span>
                                                    <span className={`px-2 py-0.5 text-[11px] font-mono font-bold rounded border ${getActionBadgeColor(log.action)}`}>
                                                        {log.action}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-4 max-w-[220px]">
                                                {summaryText ? (
                                                    <span className="text-xs text-gray-700 line-clamp-2" title={summaryText}>
                                                        {summaryText}
                                                    </span>
                                                ) : log.route ? (
                                                    <span className="font-mono text-[11px] text-gray-500 truncate block" title={log.route}>
                                                        {log.httpMethod} {log.route}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-gray-400 italic">No diff payload</span>
                                                )}
                                            </td>
                                            <td className="py-3.5 px-4 text-xs">
                                                {log.targetType ? (
                                                    <div>
                                                        <span className="font-bold text-gray-900 block">{log.targetType}</span>
                                                        {log.targetId && (
                                                            <button
                                                                onClick={() => copyToClipboard(log.targetId!, `target-${log.id}`)}
                                                                className="inline-flex items-center gap-1 font-mono text-[10px] text-gray-500 hover:text-[var(--color-primary)] transition mt-0.5"
                                                                title="Click to copy target ID"
                                                            >
                                                                <span className="truncate max-w-[100px]">{log.targetId}</span>
                                                                {copiedField === `target-${log.id}` ? (
                                                                    <FiCheck className="text-emerald-500" size={10} />
                                                                ) : (
                                                                    <FiCopy size={10} />
                                                                )}
                                                            </button>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="py-3.5 px-4 font-mono text-xs text-gray-600">
                                                {log.ipAddress ? (
                                                    <button
                                                        onClick={() => copyToClipboard(log.ipAddress!, `ip-${log.id}`)}
                                                        className="inline-flex items-center gap-1 hover:text-[var(--color-primary)] transition"
                                                        title="Click to copy IP"
                                                    >
                                                        <span>{log.ipAddress}</span>
                                                        {copiedField === `ip-${log.id}` ? (
                                                            <FiCheck className="text-emerald-500" size={11} />
                                                        ) : (
                                                            <FiCopy size={11} className="text-gray-400" />
                                                        )}
                                                    </button>
                                                ) : (
                                                    <span className="text-gray-400">N/A</span>
                                                )}
                                            </td>
                                            <td className="py-3.5 px-4">
                                                {log.status === "SUCCESS" ? (
                                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                                        <FiCheckCircle size={11} /> SUCCESS
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                                                        <FiXCircle size={11} /> FAILED
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3.5 px-4 text-center">
                                                <button
                                                    onClick={() => {
                                                        setSelectedLog(log);
                                                        setShowRawJson(false);
                                                    }}
                                                    className="p-1.5 text-gray-500 hover:text-[var(--color-primary)] hover:bg-gray-100 rounded-lg transition cursor-pointer"
                                                    title="Inspect Audit Event Details"
                                                >
                                                    <FiEye size={17} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pageCount > 1 && (
                    <div className="p-4 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                            Page <span className="font-bold text-gray-800">{page}</span> of <span className="font-bold text-gray-800">{pageCount}</span>
                        </span>
                        <div className="flex gap-2">
                            <button
                                disabled={page === 1}
                                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                                className="px-3.5 py-1.5 text-xs font-medium border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 cursor-pointer transition"
                            >
                                Previous
                            </button>
                            <button
                                disabled={page === pageCount}
                                onClick={() => setPage((prev) => Math.min(pageCount, prev + 1))}
                                className="px-3.5 py-1.5 text-xs font-medium border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 cursor-pointer transition"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Side Drawer Modal for Deep Inspection */}
            {selectedLog && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-end animate-fadeIn">
                    <div className="bg-white w-full max-w-2xl h-full shadow-2xl flex flex-col justify-between">
                        {/* Header */}
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-orange-50 text-[var(--color-primary)] flex items-center justify-center text-lg">
                                    <FiActivity />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-gray-900">Audit Event Details</h3>
                                    <p className="text-xs text-gray-500 font-mono">ID: {selectedLog.id}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedLog(null)}
                                className="p-2 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition cursor-pointer"
                            >
                                <RxCross2 size={20} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {/* Metadata Grid */}
                            <div className="grid grid-cols-2 gap-3 bg-gray-50/80 p-4 rounded-xl border border-gray-200/80 text-xs">
                                <div>
                                    <span className="text-gray-400 font-medium block">Timestamp:</span>
                                    <span className="font-semibold text-gray-800">{formatTimestamp(selectedLog.createdAt)}</span>
                                </div>
                                <div>
                                    <span className="text-gray-400 font-medium block">Execution Time:</span>
                                    <span className="font-semibold text-gray-800">{selectedLog.durationMs !== null ? `${selectedLog.durationMs}ms` : "N/A"}</span>
                                </div>
                                <div>
                                    <span className="text-gray-400 font-medium block">Module:</span>
                                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border mt-0.5 ${getModuleBadgeColor(selectedLog.module)}`}>
                                        {selectedLog.module}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-400 font-medium block">Action:</span>
                                    <span className="font-mono font-bold text-gray-800">{selectedLog.action}</span>
                                </div>
                                <div>
                                    <span className="text-gray-400 font-medium block">Actor:</span>
                                    <span className="font-bold text-gray-900">{selectedLog.actorName || "Unauthenticated"}</span>
                                    <span className="block text-[11px] text-gray-500">{selectedLog.actorEmail || "N/A"}</span>
                                </div>
                                <div>
                                    <span className="text-gray-400 font-medium block">Actor Role & IP:</span>
                                    <span className="font-bold text-[var(--color-primary)] uppercase">{selectedLog.actorRole || "N/A"}</span>
                                    <span className="block font-mono text-[11px] text-gray-600">{selectedLog.ipAddress || "N/A"}</span>
                                </div>
                                <div>
                                    <span className="text-gray-400 font-medium block">Target Entity:</span>
                                    <span className="font-bold text-gray-900">{selectedLog.targetType || "N/A"}</span>
                                    {selectedLog.targetId && (
                                        <span className="block font-mono text-[10px] text-gray-500 truncate" title={selectedLog.targetId}>
                                            ID: {selectedLog.targetId}
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <span className="text-gray-400 font-medium block">HTTP Request:</span>
                                    <span className="font-mono text-gray-800 font-semibold">{selectedLog.httpMethod || "POST"} {selectedLog.statusCode ? `(${selectedLog.statusCode})` : ""}</span>
                                    <span className="block font-mono text-[10px] text-gray-500 truncate" title={selectedLog.route || ""}>
                                        {selectedLog.route || "N/A"}
                                    </span>
                                </div>
                            </div>

                            {/* Human Summary Box if exists */}
                            {((selectedLog.changes as any)?.summary || (selectedLog.changes as any)?.description) && (
                                <div className="bg-amber-50/60 border border-amber-200 p-4 rounded-xl">
                                    <p className="text-xs font-semibold text-amber-900 uppercase tracking-wider mb-1">Activity Summary</p>
                                    <p className="text-sm text-amber-950 font-medium">
                                        {(selectedLog.changes as any)?.summary || (selectedLog.changes as any)?.description}
                                    </p>
                                </div>
                            )}

                            {/* Visual Changes or Field Diffs */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                                        <FiSliders className="text-gray-500" />
                                        <span>Changes & Payload Details</span>
                                    </h4>
                                    <button
                                        onClick={() => setShowRawJson(!showRawJson)}
                                        className="text-xs text-[var(--color-primary)] font-bold hover:underline cursor-pointer"
                                    >
                                        {showRawJson ? "Show Structured View" : "View Raw JSON"}
                                    </button>
                                </div>

                                {showRawJson ? (
                                    <pre className="bg-gray-900 text-emerald-400 p-4 rounded-xl text-xs font-mono overflow-x-auto border border-gray-800">
                                        {JSON.stringify(selectedLog, null, 2)}
                                    </pre>
                                ) : (selectedLog.changes as any)?.changedFields && Object.keys((selectedLog.changes as any).changedFields).length > 0 ? (
                                    <div className="border border-gray-200 rounded-xl overflow-hidden text-xs">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-gray-100 border-b border-gray-200 font-bold text-gray-700">
                                                    <th className="p-3">Field</th>
                                                    <th className="p-3">Previous Value</th>
                                                    <th className="p-3">New Value</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 font-mono">
                                                {Object.entries((selectedLog.changes as any).changedFields).map(([field, diff]: [string, any]) => (
                                                    <tr key={field} className="hover:bg-gray-50">
                                                        <td className="p-3 font-bold text-gray-900 font-sans">{field}</td>
                                                        <td className="p-3 text-red-600 bg-red-50/50 break-all">
                                                            {JSON.stringify(diff?.from ?? diff?.before ?? "—")}
                                                        </td>
                                                        <td className="p-3 text-emerald-600 bg-emerald-50/50 break-all">
                                                            {JSON.stringify(diff?.to ?? diff?.after ?? "—")}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (selectedLog.changes as any)?.payload ? (
                                    <div className="space-y-1.5 text-xs">
                                        <span className="font-semibold text-gray-600 block">Submitted Payload:</span>
                                        <pre className="bg-gray-50 border border-gray-200 p-3.5 rounded-xl text-gray-800 font-mono text-[11px] overflow-x-auto">
                                            {JSON.stringify((selectedLog.changes as any).payload, null, 2)}
                                        </pre>
                                    </div>
                                ) : (selectedLog.changes as any)?.after || (selectedLog.changes as any)?.before ? (
                                    <div className="space-y-1.5 text-xs">
                                        <span className="font-semibold text-gray-600 block">Snapshot Data:</span>
                                        <pre className="bg-gray-50 border border-gray-200 p-3.5 rounded-xl text-gray-800 font-mono text-[11px] overflow-x-auto">
                                            {JSON.stringify((selectedLog.changes as any).after || (selectedLog.changes as any).before, null, 2)}
                                        </pre>
                                    </div>
                                ) : (
                                    <div className="text-center p-6 bg-gray-50 rounded-xl border border-gray-200 text-gray-500 text-xs">
                                        No mutation changes or payload diff recorded for this event.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50">
                            <button
                                onClick={() => copyToClipboard(JSON.stringify(selectedLog, null, 2), "modal-json")}
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-100 transition cursor-pointer"
                            >
                                {copiedField === "modal-json" ? (
                                    <>
                                        <FiCheck className="text-emerald-500" /> Copied JSON
                                    </>
                                ) : (
                                    <>
                                        <FiCopy /> Copy JSON Data
                                    </>
                                )}
                            </button>
                            <button
                                onClick={() => setSelectedLog(null)}
                                className="px-4 py-2 text-xs font-semibold text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition cursor-pointer"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AuditLogs;
