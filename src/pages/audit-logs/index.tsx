import React, { useState, useEffect } from "react";
import PageHeader from "../../components/cards/PageHeader";
import { useAPI } from "../../hooks/useApi";
import apiConfig from "../../config/api.json";
import { auditLogQueryKey } from "../../config/query-key";
import { AuditLogItem } from "../../models/audit-log-models";
import { FiSearch, FiEye, FiActivity, FiUser, FiCalendar, FiServer, FiShieldAlert, FiCheckCircle, FiXCircle } from "react-icons/fi";
import { RxCross2 } from "react-icons/rx";

const MODULE_OPTIONS = [
    { label: "All Modules", value: "" },
    { label: "Auth", value: "AUTH" },
    { label: "Product", value: "PRODUCT" },
    { label: "Order", value: "ORDER" },
    { label: "Category", value: "CATEGORY" },
    { label: "User", value: "USER" },
    { label: "Coupon", value: "COUPON" },
    { label: "Settings", value: "SETTINGS" },
];

const STATUS_OPTIONS = [
    { label: "All Status", value: "" },
    { label: "Success", value: "SUCCESS" },
    { label: "Failed", value: "FAILED" },
];

const AuditLogs = () => {
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [selectedModule, setSelectedModule] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("");
    const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);
    const [showRawJson, setShowRawJson] = useState(false);

    const { usePaginatedQuery } = useAPI();

    // 300ms debounce on search input
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 300);
        return () => clearTimeout(handler);
    }, [search]);

    const auditApiUrl = `${apiConfig.audit.auditLogsUrl}?page=${page}&limit=${limit}${
        debouncedSearch ? `&search=${encodeURIComponent(debouncedSearch)}` : ""
    }${selectedModule ? `&module=${selectedModule}` : ""}${selectedStatus ? `&status=${selectedStatus}` : ""}`;

    const {
        data: auditLogs,
        totalItems,
        pageCount,
        isLoading,
        isFetching
    } = usePaginatedQuery<AuditLogItem>({
        queryKey: [auditLogQueryKey, page, limit, debouncedSearch, selectedModule, selectedStatus],
        url: auditApiUrl,
        enabled: true,
        refetchOnWindowFocus: false
    });

    const formatTimestamp = (dateStr: string) => {
        if (!dateStr) return "N/A";
        return new Date(dateStr).toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        });
    };

    const getModuleBadgeColor = (moduleName: string) => {
        switch (moduleName) {
            case "AUTH":
                return "bg-purple-100 text-purple-800 border-purple-200";
            case "PRODUCT":
                return "bg-blue-100 text-blue-800 border-blue-200";
            case "ORDER":
                return "bg-emerald-100 text-emerald-800 border-emerald-200";
            case "USER":
                return "bg-amber-100 text-amber-800 border-amber-200";
            case "CATEGORY":
                return "bg-cyan-100 text-cyan-800 border-cyan-200";
            default:
                return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    return (
        <div className="space-y-6">
            <PageHeader
                headerTitle="Audit Logs"
                headerDescription="Track all administrative actions, authentication events, and system mutations with full audit history."
            />

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
                    {/* Debounced Search Input */}
                    <div className="relative flex-1 min-w-[220px]">
                        <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by Actor, IP, or Target ID..."
                            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[var(--color-primary)] transition"
                        />
                    </div>

                    {/* Module Filter */}
                    <select
                        value={selectedModule}
                        onChange={(e) => {
                            setSelectedModule(e.target.value);
                            setPage(1);
                        }}
                        className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-[var(--color-primary)] cursor-pointer"
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
                        className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-[var(--color-primary)] cursor-pointer"
                    >
                        {STATUS_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="text-xs font-semibold text-gray-500">
                    Total Records: <span className="text-black font-bold">{totalItems}</span>
                </div>
            </div>

            {/* Audit Logs Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-600 uppercase tracking-wider">
                                <th className="p-4">Timestamp</th>
                                <th className="p-4">Actor</th>
                                <th className="p-4">Module & Action</th>
                                <th className="p-4">Target Entity</th>
                                <th className="p-4">Client IP</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {isLoading || isFetching ? (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center text-gray-500 font-medium">
                                        Loading audit logs...
                                    </td>
                                </tr>
                            ) : !auditLogs || auditLogs.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center text-gray-500 font-medium">
                                        No audit records found matching your query.
                                    </td>
                                </tr>
                            ) : (
                                auditLogs.map((log) => (
                                    <tr key={log.id} className="hover:bg-gray-50/70 transition">
                                        <td className="p-4 font-medium text-gray-700 whitespace-nowrap text-xs">
                                            {formatTimestamp(log.createdAt)}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-900 text-xs">
                                                    {log.actorName || "Unauthenticated"}
                                                </span>
                                                <span className="text-[11px] text-gray-500">
                                                    {log.actorEmail || "System/Guest"}
                                                </span>
                                                {log.actorRole && (
                                                    <span className="mt-0.5 inline-block text-[10px] uppercase font-bold text-[var(--color-primary)]">
                                                        {log.actorRole}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col gap-1 items-start">
                                                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md border ${getModuleBadgeColor(log.module)}`}>
                                                    {log.module}
                                                </span>
                                                <span className="font-mono text-xs font-semibold text-gray-800">
                                                    {log.action}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-xs font-medium text-gray-700">
                                            {log.targetType ? (
                                                <div>
                                                    <span className="font-bold text-gray-900">{log.targetType}</span>
                                                    {log.targetId && (
                                                        <span className="block font-mono text-[11px] text-gray-500 truncate max-w-[140px]" title={log.targetId}>
                                                            ID: {log.targetId}
                                                        </span>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </td>
                                        <td className="p-4 font-mono text-xs text-gray-600">
                                            {log.ipAddress || "N/A"}
                                        </td>
                                        <td className="p-4">
                                            {log.status === "SUCCESS" ? (
                                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200">
                                                    <FiCheckCircle size={12} /> SUCCESS
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-700 bg-red-50 px-2 py-1 rounded-md border border-red-200">
                                                    <FiXCircle size={12} /> FAILED
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 text-center">
                                            <button
                                                onClick={() => {
                                                    setSelectedLog(log);
                                                    setShowRawJson(false);
                                                }}
                                                className="p-2 text-gray-600 hover:text-[var(--color-primary)] hover:bg-gray-100 rounded-lg transition cursor-pointer"
                                                title="View Audit Details"
                                            >
                                                <FiEye size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer */}
                {pageCount > 1 && (
                    <div className="p-4 border-t border-gray-200 flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                            Page <span className="font-bold">{page}</span> of <span className="font-bold">{pageCount}</span>
                        </span>
                        <div className="flex gap-2">
                            <button
                                disabled={page === 1}
                                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                                className="px-3 py-1 text-xs border rounded-lg hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
                            >
                                Previous
                            </button>
                            <button
                                disabled={page === pageCount}
                                onClick={() => setPage((prev) => Math.min(pageCount, prev + 1))}
                                className="px-3 py-1 text-xs border rounded-lg hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Visual Diff Detail Modal / Drawer */}
            {selectedLog && (
                <div className="fixed inset-0 bg-black/60 z-50 flex justify-end animate-fadeIn">
                    <div className="bg-white w-full max-w-2xl h-full shadow-2xl overflow-y-auto p-6 space-y-6">
                        <div className="flex items-center justify-between border-b pb-4">
                            <div className="flex items-center gap-2">
                                <FiActivity className="text-[var(--color-primary)] text-xl" />
                                <h3 className="text-lg font-bold text-gray-900">Audit Log Details</h3>
                            </div>
                            <button
                                onClick={() => setSelectedLog(null)}
                                className="p-2 text-gray-500 hover:text-black rounded-lg hover:bg-gray-100 cursor-pointer"
                            >
                                <RxCross2 size={20} />
                            </button>
                        </div>

                        {/* Metadata Grid */}
                        <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200 text-xs">
                            <div>
                                <span className="text-gray-500 font-medium block">Timestamp:</span>
                                <span className="font-bold text-gray-900">{formatTimestamp(selectedLog.createdAt)}</span>
                            </div>
                            <div>
                                <span className="text-gray-500 font-medium block">Module / Action:</span>
                                <span className="font-bold text-[var(--color-primary)]">{selectedLog.module} / {selectedLog.action}</span>
                            </div>
                            <div>
                                <span className="text-gray-500 font-medium block">Actor:</span>
                                <span className="font-bold text-gray-900">{selectedLog.actorName || "Guest/System"} ({selectedLog.actorRole || "N/A"})</span>
                            </div>
                            <div>
                                <span className="text-gray-500 font-medium block">Actor Email:</span>
                                <span className="font-mono text-gray-800">{selectedLog.actorEmail || "N/A"}</span>
                            </div>
                            <div>
                                <span className="text-gray-500 font-medium block">Client IP:</span>
                                <span className="font-mono text-gray-800">{selectedLog.ipAddress || "N/A"}</span>
                            </div>
                            <div>
                                <span className="text-gray-500 font-medium block">Target:</span>
                                <span className="font-bold text-gray-900">{selectedLog.targetType || "N/A"} {selectedLog.targetId ? `(#${selectedLog.targetId})` : ""}</span>
                            </div>
                        </div>

                        {/* Visual Field Changes View */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h4 className="text-sm font-bold text-gray-900">Recorded Changes</h4>
                                <button
                                    onClick={() => setShowRawJson(!showRawJson)}
                                    className="text-xs text-[var(--color-primary)] font-bold hover:underline cursor-pointer"
                                >
                                    {showRawJson ? "Show Visual View" : "View Raw JSON"}
                                </button>
                            </div>

                            {showRawJson ? (
                                <pre className="bg-gray-950 text-emerald-400 p-4 rounded-xl text-xs font-mono overflow-x-auto border border-gray-800">
                                    {JSON.stringify(selectedLog, null, 2)}
                                </pre>
                            ) : selectedLog.changes?.type === "FIELD_DIFF" && selectedLog.changes.changedFields ? (
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
                                            {Object.entries(selectedLog.changes.changedFields).map(([field, diff]) => (
                                                <tr key={field} className="hover:bg-gray-50">
                                                    <td className="p-3 font-bold text-gray-900">{field}</td>
                                                    <td className="p-3 text-red-600 bg-red-50/50">
                                                        {JSON.stringify(diff.from)}
                                                    </td>
                                                    <td className="p-3 text-emerald-600 bg-emerald-50/50">
                                                        {JSON.stringify(diff.to)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : selectedLog.changes?.type === "SNAPSHOT" ? (
                                <div className="space-y-2 text-xs">
                                    <span className="font-bold text-gray-700 block">Snapshot Data:</span>
                                    <pre className="bg-gray-50 border border-gray-200 p-3 rounded-lg text-gray-800 font-mono text-[11px] overflow-x-auto">
                                        {JSON.stringify(selectedLog.changes.after || selectedLog.changes.before, null, 2)}
                                    </pre>
                                </div>
                            ) : (
                                <p className="text-xs text-gray-500 italic p-3 bg-gray-50 rounded-lg">
                                    No detailed payload changes recorded for this action.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AuditLogs;
