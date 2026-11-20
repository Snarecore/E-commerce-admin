import { useState } from "react";
import { FaEdit } from "react-icons/fa";
import { FiTrash2 } from "react-icons/fi";
import { useAPI } from "../../../../hooks/useApi";
import apiConfig from "../../../../config/api.json";
import TableSkeleton from "../../../../components/skeleton/TableSkeleton";
import EmptyState from "../../../../components/empty-state/EmptyState";
import DeleteModal from "../../../../components/modals/DeleteModal";
import Pagination from "../../../../components/pagination";

interface PageMetaDataProps {
    id: string;
    page: string;
    metaTitle: string;
    metaDescription: string;
    metaKeywords: string;
}

interface PageMetaTableProps {
    dataList: PageMetaDataProps[];
    fetchData: () => void;
    isLoading?: boolean;
    isFetching?: boolean;
    pageCount: number;
    currentPageNumber: number;
    handlePagination: (paginationData: { selected: number }) => void;
    onEdit: (data?: PageMetaDataProps) => void;
}

const PageMetaTable = ({
    dataList,
    fetchData,
    isLoading,
    isFetching: _isFetching,
    pageCount, currentPageNumber, handlePagination,
    onEdit
}: PageMetaTableProps) => {
    const { handleDeleteAPI } = useAPI();
    const apiUrl = apiConfig.pageMeta.pageMetaUrl;

    const tableHeaders = [
        { key: "serial", label: "SL" },
        { key: "page", label: "Page" },
        { key: "metaTitle", label: "Meta Title" },
        { key: "metaKeywords", label: "Meta Keyords" },
        { key: "actions", label: "Actions" }
    ];

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<PageMetaDataProps | null>(null);

    const openDeleteModal = (data: PageMetaDataProps) => {
        setSelectedItem(data);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setSelectedItem(null);
    };

    const handleDelete = async () => {
        if (!selectedItem) return;
        const apiResponse = await handleDeleteAPI({
            url: `${apiUrl}/${selectedItem.id}`,
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
                <table className="w-full text-left border-collapse min-w-[900px] cursor-pointer">
                    <thead className="bg-[var(--ui-surface-muted)]">
                        <tr className="text-[13px] font-semibold border-b border-[var(--ui-border)] text-[var(--ui-text-muted)]">
                            {tableHeaders.map(({ key, label }) => (
                                <th key={key} className={`px-4 py-2.5 font-semibold text-[var(--ui-text)] whitespace-nowrap ${key === "action" ? "text-right pr-6" : "text-left"}`}>
                                    <span>{label}</span>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-[var(--ui-surface)] divide-y divide-[var(--ui-border)] rounded-md">
                        {dataList?.length > 0 ? (
                            dataList?.map((data, index) => (
                                <tr
                                    key={data.id}
                                    className="border-b border-[var(--ui-border)] text-[var(--ui-text)] hover:bg-[var(--ui-surface-muted)] transition duration-200"
                                >
                                    <td className="px-4 py-2.5 font-medium text-[var(--ui-text-muted)] whitespace-nowrap">
                                        {(currentPageNumber - 1) * 10 + index + 1}
                                    </td>
                                    <td className="px-4 py-2.5 font-medium text-[var(--ui-text)] whitespace-nowrap">
                                        {data.page}
                                    </td>
                                    <td className="px-4 py-2.5 text-sm text-[var(--ui-text)]">
                                        {data.metaTitle}
                                    </td>
                                    <td className="px-4 py-2.5 text-sm text-[var(--ui-text-muted)]">
                                        {data.metaKeywords}
                                    </td>
                                    <td className="px-4 py-2.5 whitespace-nowrap">
                                        <div className="flex items-center justify-end gap-1.5 pr-2">
                                            <button
                                                onClick={() => onEdit(data)}
                                                className="border border-[var(--ui-border)] text-[var(--ui-text-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--ui-surface-muted)] cursor-pointer p-1.5 rounded-md transition duration-200"
                                                title="Edit Meta"
                                            >
                                                <FaEdit />
                                            </button>

                                            <button
                                                onClick={() => openDeleteModal(data)}
                                                className="border border-[var(--ui-border)] text-[var(--ui-text-muted)] hover:text-red-500 hover:bg-red-500/10 cursor-pointer p-1.5 rounded-md transition duration-200"
                                                title="Delete Meta"
                                            >
                                                <FiTrash2 />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={tableHeaders.length}
                                    className="px-4 py-4 text-center italic text-[var(--ui-text-muted)]"
                                >
                                    <EmptyState title="No page meta available" description="Click below to add your first page meta!" buttonText="+ Add New Page Meta" onButtonClick={() => onEdit()} />
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {selectedItem && (
                <DeleteModal
                    isOpen={isDeleteModalOpen}
                    title="Delete?"
                    message={`Are you sure you want to delete this page meta?`}
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

export default PageMetaTable;
