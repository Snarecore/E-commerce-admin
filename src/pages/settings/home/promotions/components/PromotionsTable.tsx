import { useState } from "react";
import { FaEdit } from "react-icons/fa";
import { FiTrash2 } from "react-icons/fi";
import DeleteModal from "../../../../../components/modals/DeleteModal";
import { useAPI } from "../../../../../hooks/useApi";
import apiConfig from "../../../../../config/api.json";
import TableSkeleton from "../../../../../components/skeleton/TableSkeleton";
import EmptyState from "../../../../../components/empty-state/EmptyState";
import Pagination from "../../../../../components/pagination";

interface PromotionsDataProps {
    id: string;
    image: string;
    link: string;
    status: boolean;
}

interface PromotionsTableProps {
    dataList: PromotionsDataProps[];
    fetchData: () => void;
    isLoading?: boolean;
    isFetching?: boolean;
    pageCount: number;
    currentPageNumber: number;
    handlePagination: (paginationData: { selected: number }) => void;
    onEdit: (data?: PromotionsDataProps) => void;
}

const PromotionsTable = ({ dataList, fetchData, isLoading, pageCount, currentPageNumber, handlePagination, isFetching: _isFetching, onEdit }: PromotionsTableProps) => {
    const { handleDeleteAPI } = useAPI();
    const apiUrl = apiConfig.setting.promotionsUrl;

    const tableHeaders = [
        { key: "sl", label: "Sl" },
        { key: "image", label: "Image" },
        { key: "link", label: "Link" },
        { key: "status", label: "Status" },
        { key: "action", label: "Action" }
    ];

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedPromotion, setSelectedPromotion] = useState<PromotionsDataProps | null>(null);

    const openDeleteModal = (data: PromotionsDataProps) => {
        setSelectedPromotion(data);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setSelectedPromotion(null);
    };

    const handleDelete = async () => {
        if (!selectedPromotion) return;
        const apiResponse = await handleDeleteAPI({
            url: `${apiUrl}/${selectedPromotion.id}`,
            showSuccessMessage: true
        });
        if (apiResponse) {
            fetchData();
            closeDeleteModal();
        }
    };

    if (isLoading) return <TableSkeleton />;

    return (
        <div className="p-3.5 sm:p-4 bg-[var(--ui-surface)] rounded-md border border-[var(--ui-border)] shadow-sm transition-colors duration-200">
            <div className="mt-2 w-full overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[1000px] cursor-pointer">
                    <thead className="bg-[var(--ui-surface-muted)]">
                        <tr className="text-[13px] font-semibold border-b border-[var(--ui-border)] text-[var(--ui-text-muted)]">
                            {tableHeaders.map(({ key, label }) => (
                                <th key={key} className={`px-4 py-2.5 font-semibold text-[var(--ui-text)] whitespace-nowrap ${key === "action" ? "text-right pr-6" : "text-left"}`}>{label}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-[var(--ui-surface)] divide-y divide-[var(--ui-border)] rounded-md">
                        {dataList?.length > 0 ? (
                            dataList?.map((data, index) => (
                                <tr key={data.id} className="border-b border-[var(--ui-border)] text-[var(--ui-text)] hover:bg-[var(--ui-surface-muted)] transition duration-200">
                                    <td className="px-4 py-2.5 font-medium text-[var(--ui-text-muted)] whitespace-nowrap">{(currentPageNumber - 1) * 10 + index + 1}</td>
                                    <td className="px-4 py-2.5 whitespace-nowrap">
                                        <img
                                            src={data.image}
                                            alt="promo image"
                                            className="w-12 h-12 object-cover rounded-md shadow-sm border border-[var(--ui-border)]"
                                        />
                                    </td>
                                    <td className="px-4 py-2.5 text-[var(--color-primary)] hover:underline cursor-pointer whitespace-nowrap">
                                        {data.link || "N/A"}
                                    </td>
                                    <td className="px-4 py-2.5 whitespace-nowrap">
                                        <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-md flex items-center w-fit transition-all ${data.status ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" : "bg-red-500/15 text-red-400 border border-red-500/30"}`}>
                                            {data.status ? "Active" : "Inactive"}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2.5 whitespace-nowrap">
                                        <div className="flex items-center justify-end gap-1.5 pr-2">
                                            <button onClick={() => onEdit(data)} className="border border-[var(--ui-border)] text-[var(--ui-text-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--ui-surface-muted)] cursor-pointer p-1.5 rounded-md transition duration-200" title="Edit Promotion">
                                                <FaEdit />
                                            </button>
                                            <button onClick={() => openDeleteModal(data)} className="border border-[var(--ui-border)] text-[var(--ui-text-muted)] hover:text-red-500 hover:bg-red-500/10 cursor-pointer p-1.5 rounded-md transition duration-200" title="Delete Promotion">
                                                <FiTrash2 />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={tableHeaders.length} className="px-4 py-4 text-center italic text-[var(--ui-text-muted)]">
                                    <EmptyState title="No promotions available" description="Click below to add your first promotion!" buttonText="+ Add New Promotion" onButtonClick={() => onEdit()} />
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {selectedPromotion && (
                <DeleteModal
                    isOpen={isDeleteModalOpen}
                    title="Delete?"
                    message={`Are you sure you want to delete?`}
                    onClose={closeDeleteModal}
                    onDelete={handleDelete}
                />
            )}
            {pageCount > 1 && (
                <div className="flex justify-end">
                    <Pagination
                        pageCount={pageCount}
                        currentPageNumber={currentPageNumber}
                        handlePagination={handlePagination}
                    />
                </div>
            )}
        </div>
    );
};

export default PromotionsTable;
