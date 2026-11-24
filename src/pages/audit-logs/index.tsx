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
import Pagination from "../../components/pagination";
import EmptyState from "../../components/empty-state/EmptyState";
import TableSkeleton from "../../components/skeleton/TableSkeleton";

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
        if (action.includes("DELETE") || action.includes("BLOCK")) return "text-rose-700 bg-rose-50 border-rose-200";
        if (action.includes("LOGIN")) return "text-purple-700 bg-purple-50 border-purple-200";
        return "text-gray-700 bg-gray-50 border-gray-200";
    };

    // Calculate health percentage
    const healthPercentage = statsData?.total && statsData.total > 0
        ? Math.round((statsData.successCount / statsData.total) * 100)
        : 100;

    return (
        <div className="space-y-4">
            <PageHeader
                headerTitle="Audit Logs"
                headerDescription="Track all administrative actions, configuration changes, stock movements, and system security events."
            />

            {/* KPI Stats Cards - Matching Incomplete Checkouts spacing & design */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {/* 1. TOTAL LOGS */}
                <div className="bg-white rounded-xl p-4 sm:p-4.5 border border-gray-200 shadow-2xs flex items-center justify-between transition-all duration-200 hover:shadow-xs">
                    <div>
                        <p className="text-[11px] font-semibold tracking-wider text-gray-500 uppercase">TOTAL AUDIT LOGS</p>
                        <h3 className="text-2xl font-bold text-gray-900 mt-1 tracking-tight">
                            {statsData?.total?.toLocaleString() ?? totalItems?.toLocaleString() ?? 0}
                        </h3>
                    </div>
                    <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500 text-xl shadow-2xs">
                        <FiActivity />
                    </div>
                </div>

                {/* 2. TODAY'S ACTIONS */}
                <div className="bg-white rounded-xl p-4 sm:p-4.5 border border-gray-200 shadow-2xs flex items-center justify-between transition-all duration-200 hover:shadow-xs">
                    <div>
                        <p className="text-[11px] font-semibold tracking-wider text-gray-500 uppercase">TODAY'S ACTIONS</p>
                        <h3 className="text-2xl font-bold text-gray-900 mt-1 tracking-tight">
                            {statsData?.today?.toLocaleString() ?? 0}
                        </h3>
                    </div>
                    <div className="w-11 h-11 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-500 text-xl shadow-2xs">
                        <FiClock />
                    </div>
                </div>

                {/* 3. SUCCESS HEALTH */}
                <div className="bg-white rounded-xl p-4 sm:p-4.5 border border-gray-200 shadow-2xs flex items-center justify-between transition-all duration-200 hover:shadow-xs">
                    <div>
                        <p className="text-[11px] font-semibold tracking-wider text-gray-500 uppercase">SUCCESS RATE</p>
                        <h3 className="text-2xl font-bold text-gray-900 mt-1 tracking-tight">
                            {healthPercentage}%
                        </h3>
                    </div>
                    <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500 text-xl shadow-2xs">
                        <FiShield />
                    </div>
                </div>

                {/* 4. ACTIVE ADMINS */}
                <div className="bg-white rounded-xl p-4 sm:p-4.5 border border-gray-200 shadow-2xs flex items-center justify-between transition-all duration-200 hover:shadow-xs">
                    <div>
                        <p className="text-[11px] font-semibold tracking-wider text-gray-500 uppercase">ACTIVE ADMINS</p>
                        <h3 className="text-2xl font-bold text-gray-900 mt-1 tracking-tight">
                            {statsData?.topAdmins?.length ?? 1}
                        </h3>
                    </div>
                    <div className="w-11 h-11 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-500 text-xl shadow-2xs">
                        <FiUser />
                    </div>
                </div>
            </div>

            {/* Filter & Search Bar - Sleek and compact */}
            <div className="bg-white rounded-xl p-3 sm:p-3.5 border border-gray-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
                <div className="flex flex-1 flex-wrap items-center gap-2.5 w-full">
                    {/* Search Input */}
                    <div className="relative flex-1 min-w-[240px] w-full">
                        <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by Admin, Email, Target ID, Route or IP..."
                            className="w-full h-10 pl-9.5 pr-8 bg-gray-50/60 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                        />
                        {search && (
                            <button
                                onClick={() => setSearch("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
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
                        className="h-10 px-3 bg-gray-50/60 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 cursor-pointer"
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
                        className="h-10 px-3 bg-gray-50/60 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 cursor-pointer"
                    >
                        {STATUS_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>

                    <RefreshButton onClick={handleRefreshAll} />
                </div>

                <div className="text-xs font-semibold text-gray-500 whitespace-nowrap self-end md:self-center">
                    Total: <span className="text-gray-900 font-bold">{totalItems}</span>
                </div>
            </div>

            {/* Audit Logs Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                    {isLoading || isFetching ? (
                        <TableSkeleton />
                    ) : !auditLogs || auditLogs.length === 0 ? (
                        <div className="p-6 sm:p-10">
                            <EmptyState
                                title="No Audit Records Found"
                                description="Try adjusting your search criteria, module filter, or status."
                            />
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="border-b border-gray-200 bg-gray-50/80 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                                    <th className="py-3 px-3.5 sm:px-4 whitespace-nowrap">TIMESTAMP</th>
                                    <th className="py-3 px-3.5 sm:px-4 whitespace-nowrap">ADMIN / ACTOR</th>
                                    <th className="py-3 px-3.5 sm:px-4 whitespace-nowrap">MODULE & ACTION</th>
                                    <th className="py-3 px-3.5 sm:px-4">ACTIVITY SUMMARY</th>
                                    <th className="py-3 px-3.5 sm:px-4 whitespace-nowrap">TARGET</th>
                                    <th className="py-3 px-3.5 sm:px-4 whitespace-nowrap">IP ADDRESS</th>
                                    <th className="py-3 px-3.5 sm:px-4 whitespace-nowrap">STATUS</th>
                                    <th className="py-3 px-3.5 sm:px-4 text-center whitespace-nowrap">ACTION</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-gray-700">
                                {auditLogs.map((log) => {
                                    const changesObj = log.changes as any;
                                    const summaryText = changesObj?.summary || changesObj?.description || (
                                        changesObj?.changedFields
                                            ? `Updated: ${Object.keys(changesObj.changedFields).join(", ")}`
                                            : null
                                    );

                                    return (
                                        <tr key={log.id} className="hover:bg-orange-50/20 transition-colors">
                                            {/* TIMESTAMP */}
                                            <td className="py-3 px-3.5 sm:px-4 whitespace-nowrap text-xs text-gray-600 font-mono">
                                                <span>{formatTimestamp(log.createdAt)}</span>
                                                {log.durationMs !== null && log.durationMs !== undefined && (
                                                    <span className="text-[10px] text-gray-400 ml-1.5 font-sans">
                                                        ({log.durationMs}ms)
                                                    </span>
                                                )}
                                            </td>

                                            {/* ADMIN / ACTOR - SINGLE LINE as requested */}
                                            <td className="py-3 px-3.5 sm:px-4 whitespace-nowrap">
                                                <div className="flex items-center gap-1.5 max-w-[280px]">
                                                    <span className="font-semibold text-gray-900 text-xs truncate" title={log.actorName || "Unauthenticated"}>
                                                        {log.actorName || "Unauthenticated"}
                                                    </span>
                                                    {log.actorEmail && (
                                                        <span className="text-[11px] text-gray-400 truncate" title={log.actorEmail}>
                                                            ({log.actorEmail})
                                                        </span>
                                                    )}
                                                    {log.actorRole && (
                                                        <span className="shrink-0 px-1.5 py-0.5 text-[9px] uppercase font-bold text-orange-600 bg-orange-50 border border-orange-200 rounded">
                                                            {log.actorRole}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* MODULE & ACTION */}
                                            <td className="py-3 px-3.5 sm:px-4 whitespace-nowrap">
                                                <div className="flex items-center gap-1.5">
                                                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded border ${getModuleBadgeColor(log.module)}`}>
                                                        {log.module}
                                                    </span>
                                                    <span className={`px-2 py-0.5 text-[11px] font-mono font-medium rounded border ${getActionBadgeColor(log.action)}`}>
                                                        {log.action}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* ACTIVITY SUMMARY */}
                                            <td className="py-3 px-3.5 sm:px-4 max-w-[280px]">
                                                <span className="text-xs text-gray-700 truncate block font-medium" title={summaryText || log.route || ""}>
                                                    {summaryText || (log.route ? `${log.httpMethod} ${log.route}` : "—")}
                                                </span>
                                            </td>

                                            {/* TARGET */}
                                            <td className="py-3 px-3.5 sm:px-4 whitespace-nowrap text-xs">
                                                {log.targetType ? (
                                                    <div className="flex items-center gap-1.5 font-mono">
                                                        <span className="font-semibold text-gray-800 text-[11px]">{log.targetType}</span>
                                                        {log.targetId && (
                                                            <button
                                                                onClick={() => copyToClipboard(log.targetId!, `target-${log.id}`)}
                                                                className="inline-flex items-center gap-1 text-[10px] text-gray-500 hover:text-orange-600 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-200 transition cursor-pointer"
                                                                title="Click to copy target ID"
                                                            >
                                                                <span>#{log.targetId.length > 8 ? `${log.targetId.slice(0, 8)}...` : log.targetId}</span>
                                                                {copiedField === `target-${log.id}` ? (
                                                                    <FiCheck className="text-emerald-500" size={10} />
                                                                ) : (
                                                                    <FiCopy size={10} />
                                                                )}
                                                            </button>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400">—</span>
                                                )}
                                            </td>

                                            {/* IP ADDRESS */}
                                            <td className="py-3 px-3.5 sm:px-4 whitespace-nowrap font-mono text-xs text-gray-600">
                                                {log.ipAddress ? (
                                                    <button
                                                        onClick={() => copyToClipboard(log.ipAddress!, `ip-${log.id}`)}
                                                        className="inline-flex items-center gap-1 hover:text-orange-600 transition cursor-pointer"
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

                                            {/* STATUS */}
                                            <td className="py-3 px-3.5 sm:px-4 whitespace-nowrap">
                                                {log.status === "SUCCESS" ? (
                                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                                        <FiCheckCircle size={11} /> SUCCESS
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                                                        <FiXCircle size={11} /> FAILED
                                                    </span>
                                                )}
                                            </td>

                                            {/* ACTION */}
                                            <td className="py-3 px-3.5 sm:px-4 whitespace-nowrap text-center">
                                                <button
                                                    onClick={() => {
                                                        setSelectedLog(log);
                                                        setShowRawJson(false);
                                                    }}
                                                    className="p-1.5 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition cursor-pointer"
                                                    title="Inspect Event"
                                                >
                                                    <FiEye size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Unified Pagination */}
                {pageCount > 1 && (
                    <div className="p-3.5 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <span className="text-xs text-gray-500">
                            Page <span className="font-bold text-gray-800">{page}</span> of <span className="font-bold text-gray-800">{pageCount}</span> ({totalItems} total logs)
                        </span>
                        <Pagination
                            pageCount={pageCount}
                            currentPageNumber={page}
                            handlePagination={({ selected }) => setPage(selected + 1)}
                        />
                    </div>
                )}
            </div>

            {/* Side Drawer Modal for Deep Inspection */}
            {selectedLog && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex justify-end animate-fadeIn">
                    <div className="bg-white w-full max-w-2xl h-full shadow-2xl flex flex-col justify-between">
                        {/* Header */}
                        <div className="p-4 sm:p-5 border-b border-gray-200 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 text-orange-600 flex items-center justify-center text-lg">
                                    <FiActivity />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900">Audit Event Details</h3>
                                    <p className="text-[11px] text-gray-400 font-mono">ID: {selectedLog.id}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedLog(null)}
                                className="p-2 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition cursor-pointer"
                            >
                                <RxCross2 size={18} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
                            {/* Metadata Grid */}
                            <div className="grid grid-cols-2 gap-3 bg-gray-50/80 p-3.5 rounded-xl border border-gray-200 text-xs">
                                <div>
                                    <span className="text-gray-400 font-medium block text-[11px]">Timestamp:</span>
                                    <span className="font-semibold text-gray-800">{formatTimestamp(selectedLog.createdAt)}</span>
                                </div>
                                <div>
                                    <span className="text-gray-400 font-medium block text-[11px]">Execution Time:</span>
                                    <span className="font-semibold text-gray-800">{selectedLog.durationMs !== null ? `${selectedLog.durationMs}ms` : "N/A"}</span>
                                </div>
                                <div>
                                    <span className="text-gray-400 font-medium block text-[11px]">Module:</span>
                                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border mt-0.5 ${getModuleBadgeColor(selectedLog.module)}`}>
                                        {selectedLog.module}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-400 font-medium block text-[11px]">Action:</span>
                                    <span className="font-mono font-bold text-gray-800 text-[11px]">{selectedLog.action}</span>
                                </div>
                                <div>
                                    <span className="text-gray-400 font-medium block text-[11px]">Actor:</span>
                                    <span className="font-bold text-gray-900">{selectedLog.actorName || "Unauthenticated"}</span>
                                    <span className="block text-[11px] text-gray-500 truncate">{selectedLog.actorEmail || "N/A"}</span>
                                </div>
                                <div>
                                    <span className="text-gray-400 font-medium block text-[11px]">Actor Role & IP:</span>
                                    <span className="font-bold text-orange-600 uppercase">{selectedLog.actorRole || "N/A"}</span>
                                    <span className="block font-mono text-[11px] text-gray-600">{selectedLog.ipAddress || "N/A"}</span>
                                </div>
                                <div>
                                    <span className="text-gray-400 font-medium block text-[11px]">Target Entity:</span>
                                    <span className="font-bold text-gray-900">{selectedLog.targetType || "N/A"}</span>
                                    {selectedLog.targetId && (
                                        <span className="block font-mono text-[10px] text-gray-500 truncate" title={selectedLog.targetId}>
                                            ID: {selectedLog.targetId}
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <span className="text-gray-400 font-medium block text-[11px]">HTTP Request:</span>
                                    <span className="font-mono text-gray-800 font-semibold">{selectedLog.httpMethod || "POST"} {selectedLog.statusCode ? `(${selectedLog.statusCode})` : ""}</span>
                                    <span className="block font-mono text-[10px] text-gray-500 truncate" title={selectedLog.route || ""}>
                                        {selectedLog.route || "N/A"}
                                    </span>
                                </div>
                            </div>

                            {/* Human Summary Box if exists */}
                            {((selectedLog.changes as any)?.summary || (selectedLog.changes as any)?.description) && (
                                <div className="bg-amber-50/60 border border-amber-200 p-3.5 rounded-xl">
                                    <p className="text-[10px] font-semibold text-amber-900 uppercase tracking-wider mb-0.5">Activity Summary</p>
                                    <p className="text-xs text-amber-950 font-medium">
                                        {(selectedLog.changes as any)?.summary || (selectedLog.changes as any)?.description}
                                    </p>
                                </div>
                            )}

                            {/* Visual Changes or Field Diffs */}
                            <div className="space-y-2.5">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                                        <FiSliders className="text-gray-500" />
                                        <span>Changes & Payload Details</span>
                                    </h4>
                                    <button
                                        onClick={() => setShowRawJson(!showRawJson)}
                                        className="text-xs text-orange-600 font-semibold hover:underline cursor-pointer"
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
                                                <tr className="bg-gray-50 border-b border-gray-200 font-bold text-gray-700 text-[11px]">
                                                    <th className="p-2.5">Field</th>
                                                    <th className="p-2.5">Previous Value</th>
                                                    <th className="p-2.5">New Value</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 font-mono text-[11px]">
                                                {Object.entries((selectedLog.changes as any).changedFields).map(([field, diff]: [string, any]) => (
                                                    <tr key={field} className="hover:bg-gray-50">
                                                        <td className="p-2.5 font-bold text-gray-900 font-sans">{field}</td>
                                                        <td className="p-2.5 text-rose-600 bg-rose-50/50 break-all">
                                                            {JSON.stringify(diff?.from ?? diff?.before ?? "—")}
                                                        </td>
                                                        <td className="p-2.5 text-emerald-600 bg-emerald-50/50 break-all">
                                                            {JSON.stringify(diff?.to ?? diff?.after ?? "—")}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (selectedLog.changes as any)?.payload ? (
                                    <div className="space-y-1 text-xs">
                                        <span className="font-semibold text-gray-600 block text-[11px]">Submitted Payload:</span>
                                        <pre className="bg-gray-50 border border-gray-200 p-3 rounded-xl text-gray-800 font-mono text-[11px] overflow-x-auto">
                                            {JSON.stringify((selectedLog.changes as any).payload, null, 2)}
                                        </pre>
                                    </div>
                                ) : (selectedLog.changes as any)?.after || (selectedLog.changes as any)?.before ? (
                                    <div className="space-y-1 text-xs">
                                        <span className="font-semibold text-gray-600 block text-[11px]">Snapshot Data:</span>
                                        <pre className="bg-gray-50 border border-gray-200 p-3 rounded-xl text-gray-800 font-mono text-[11px] overflow-x-auto">
                                            {JSON.stringify((selectedLog.changes as any).after || (selectedLog.changes as any).before, null, 2)}
                                        </pre>
                                    </div>
                                ) : (
                                    <div className="text-center p-5 bg-gray-50 rounded-xl border border-gray-200 text-gray-500 text-xs">
                                        No mutation changes or payload diff recorded for this event.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-3.5 sm:p-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
                            <button
                                onClick={() => copyToClipboard(JSON.stringify(selectedLog, null, 2), "modal-json")}
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition cursor-pointer"
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
                                className="px-4 py-1.5 text-xs font-semibold text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition cursor-pointer"
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
