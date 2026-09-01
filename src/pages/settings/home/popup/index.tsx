import { useState, useEffect } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiClock, FiCalendar } from "react-icons/fi";
import { useAPI } from "../../../../hooks/useApi";
import apiConfig from "../../../../config/api.json";
import { popupQueryKey } from "../../../../config/query-key";
import PageHeader from "../../../../components/cards/PageHeader";
import TableSkeleton from "../../../../components/skeleton/TableSkeleton";
import EmptyState from "../../../../components/empty-state/EmptyState";
import DeleteModal from "../../../../components/modals/DeleteModal";
import ToggleButton from "../../../../components/Inputs/ToggleButton";
import Pagination from "../../../../components/pagination";
import PopupModal from "./components/PopupModal";

interface PopupItem {
    id: string;
    title?: string;
    description?: string;
    image: string;
    startDate?: string;
    endDate?: string;
    isActive: boolean;
    createdAt?: string;
}

const PopupPage = () => {
    const dataLimit = 10;
    const [currentPageNumber, setCurrentPageNumber] = useState(1);
    const { usePaginatedQuery, handleApiMutation, patchMutation, handleDeleteAPI } = useAPI();
    const apiUrl = apiConfig.setting.popupUrl;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPopup, setSelectedPopup] = useState<PopupItem | null>(null);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [popupToDelete, setPopupToDelete] = useState<PopupItem | null>(null);

    const getPopupListApiUrl = () => {
        return `${apiUrl}?page=${currentPageNumber}&limit=${dataLimit}`;
    };

    const {
        data: dataList,
        refetch: fetchData,
        isFetching,
        isLoading,
        pageCount
    } = usePaginatedQuery({
        queryKey: [popupQueryKey],
        url: getPopupListApiUrl()
    });

    useEffect(() => {
        fetchData();
    }, [currentPageNumber]);

    const handlePagination = (paginationData: { selected: number }) => {
        const selectedPage = paginationData.selected + 1;
        setCurrentPageNumber(selectedPage);
    };

    const popups: PopupItem[] = Array.isArray(dataList) ? (dataList as unknown as PopupItem[]) : [];

    const handleToggleActive = async (popup: PopupItem) => {
        try {
            await handleApiMutation({
                // @ts-ignore
                mutation: patchMutation,
                url: `${apiUrl}/${popup.id}`,
                body: { isActive: !popup.isActive },
                invalidateQueryKey: [popupQueryKey],
                showSuccessMessage: false,
                showErrorMessage: true,
                requiredFields: []
            });
            fetchData();
        } catch (err) {
            console.error("Status toggle error:", err);
        }
    };

    const handleDeleteConfirm = async () => {
        if (!popupToDelete) return;
        try {
            await (handleDeleteAPI as any)({
                apiUrl: `${apiUrl}/${popupToDelete.id}`,
                refetchData: fetchData
            });
        } catch (err) {
            console.error("Delete error:", err);
        } finally {
            setIsDeleteModalOpen(false);
            setPopupToDelete(null);
        }
    };

    const getStatusBadge = (popup: PopupItem) => {
        if (!popup.isActive) {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                    Inactive
                </span>
            );
        }

        const now = new Date().getTime();
        const start = popup.startDate && popup.startDate !== "undefined" ? new Date(popup.startDate).getTime() : null;
        const end = popup.endDate && popup.endDate !== "undefined" ? new Date(popup.endDate).getTime() : null;

        if (start && now < start) {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                    <FiClock className="w-3 h-3" /> Scheduled
                </span>
            );
        }

        if (end && now > end) {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                    Expired
                </span>
            );
        }

        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                Active Now
            </span>
        );
    };

    const formatText = (text?: string) => {
        if (!text || text === "undefined" || text === "null" || text.trim() === "") return "";
        return text;
    };

    return (
        <div className="flex flex-col gap-6 p-6">
            <PageHeader
                headerTitle="Popup Banner Management"
                headerDescription="Create, schedule and manage promotional and announcement popups displayed to visitors."
            >
                <button
                    onClick={() => {
                        setSelectedPopup(null);
                        setIsModalOpen(true);
                    }}
                    className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-md transition cursor-pointer"
                >
                    <FiPlus className="w-4 h-4" />
                    Add Popup Banner
                </button>
            </PageHeader>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                {isLoading || isFetching ? (
                    // @ts-ignore
                    <TableSkeleton rows={5} columns={5} />
                ) : popups.length === 0 ? (
                    <EmptyState
                        title="No Popup Banners Found"
                        description="Create your first promotional modal popup banner to greet website visitors!"
                    />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-gray-600">
                            <thead className="bg-gray-50 border-b border-gray-200 text-gray-700 font-semibold">
                                <tr>
                                    <th className="py-3.5 px-4">Banner Preview</th>
                                    <th className="py-3.5 px-4">Title & Description</th>
                                    <th className="py-3.5 px-4">Schedule Period</th>
                                    <th className="py-3.5 px-4">Live Status</th>
                                    <th className="py-3.5 px-4">Enabled</th>
                                    <th className="py-3.5 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {popups.map((popup) => (
                                    <tr key={popup.id} className="hover:bg-gray-50/60 transition">
                                        {/* Banner Image Preview */}
                                        <td className="py-3.5 px-4">
                                            <div className="w-16 h-12 rounded-lg overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center shadow-xs">
                                                <img
                                                    src={popup.image}
                                                    alt={popup.title || "Popup Banner"}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        </td>

                                        {/* Title & Description */}
                                        <td className="py-3.5 px-4 max-w-xs">
                                            <p className="font-bold text-gray-900 line-clamp-1">
                                                {formatText(popup.title) || "Untitled Announcement"}
                                            </p>
                                            {formatText(popup.description) ? (
                                                <p className="text-[11px] text-gray-400 font-normal line-clamp-2 mt-0.5">
                                                    {formatText(popup.description)}
                                                </p>
                                            ) : (
                                                <span className="text-[10px] text-gray-300 italic">No description</span>
                                            )}
                                        </td>

                                        {/* Schedule Period */}
                                        <td className="py-3.5 px-4 text-[11px] text-gray-600">
                                            {(popup.startDate && popup.startDate !== "undefined") || (popup.endDate && popup.endDate !== "undefined") ? (
                                                <div className="space-y-0.5">
                                                    <div className="flex items-center gap-1 text-gray-500">
                                                        <FiCalendar className="w-3 h-3 text-gray-400" />
                                                        <span>From: {popup.startDate && popup.startDate !== "undefined" ? new Date(popup.startDate).toLocaleString() : "Anytime"}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1 text-gray-500">
                                                        <FiClock className="w-3 h-3 text-gray-400" />
                                                        <span>Until: {popup.endDate && popup.endDate !== "undefined" ? new Date(popup.endDate).toLocaleString() : "Always Active"}</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 font-medium">Always Active</span>
                                            )}
                                        </td>

                                        {/* Live Status Badge */}
                                        <td className="py-3.5 px-4">
                                            {getStatusBadge(popup)}
                                        </td>

                                        {/* Enabled / Active Toggle */}
                                        <td className="py-3.5 px-4">
                                            <ToggleButton
                                                label=""
                                                name={`toggle-${popup.id}`}
                                                checked={popup.isActive}
                                                onChange={() => handleToggleActive(popup)}
                                            />
                                        </td>

                                        {/* Actions */}
                                        <td className="py-3.5 px-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => {
                                                        setSelectedPopup(popup);
                                                        setIsModalOpen(true);
                                                    }}
                                                    className="p-1.5 text-gray-500 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition cursor-pointer"
                                                    title="Edit Popup Banner"
                                                >
                                                    <FiEdit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setPopupToDelete(popup);
                                                        setIsDeleteModalOpen(true);
                                                    }}
                                                    className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition cursor-pointer"
                                                    title="Delete Popup Banner"
                                                >
                                                    <FiTrash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {pageCount > 1 && (
                <Pagination
                    pageCount={pageCount}
                    currentPageNumber={currentPageNumber}
                    handlePagination={handlePagination}
                />
            )}

            {/* Create / Edit Modal */}
            <PopupModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedPopup(null);
                }}
                editData={selectedPopup}
                fetchData={fetchData}
            />

            {/* Delete Modal */}
            {/* @ts-ignore */}
            <DeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setPopupToDelete(null);
                }}
                onDelete={handleDeleteConfirm}
                title="Delete Popup Banner"
                message={`Are you sure you want to delete popup banner "${popupToDelete?.title || "Untitled"}"? This action cannot be undone.`}
            />
        </div>
    );
};

export default PopupPage;
