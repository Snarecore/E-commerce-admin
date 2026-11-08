import { useState } from "react";
import { FaEdit } from "react-icons/fa";
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
    productName: string;
    productImage: string;
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

const ProductMetaTable = ({
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
        { key: "product", label: "Product Name" },
        // { key: "page", label: "Page" },
        { key: "metaTitle", label: "Meta Title" },
        { key: "metaKeywords", label: "Meta Keyords" },
        { key: "actions", label: "Actions" }
    ];

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<PageMetaDataProps | null>(null);

    // const openDeleteModal = (data: PageMetaDataProps) => {
    //     setSelectedItem(data);
    //     setIsDeleteModalOpen(true);
    // };

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
        <div className="p-6 bg-white rounded-lg border border-gray-200">
            <div className="mt-3 w-full overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[900px]">
                    <thead className="bg-gray-100">
                        <tr className="text-gray-600 text-[13px] border-b border-gray-200">
                            {tableHeaders.map(({ key, label }) => (
                                <th key={key} className="px-4 py-2.5 text-left font-semibold text-[#000000e0]">
                                    {label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 rounded-lg">
                        {dataList?.length > 0 ? (
                            dataList?.map((data, index) => (
                                <tr
                                    key={data.id}
                                    className="border-b border-gray-100 text-gray-700 hover:bg-gray-50 transition duration-300"
                                >
                                    <td className="px-4 py-2.5 font-medium text-gray-800">
                                        {index + 1}
                                    </td>
                                    <td className="px-4 py-2.5 flex items-center gap-2">
                                        <img
                                            src={data.productImage}
                                            alt={data.productName}
                                            className="w-9 h-9 rounded-md shadow-sm border border-gray-200 object-cover"
                                        />
                                        <span>
                                            {data.productName}
                                        </span>
                                    </td>
                                    {/* <td className="px-4 py-2.5 font-medium text-gray-800">
                                        {data.page}
                                    </td> */}
                                    <td className="px-4 py-2.5">
                                        {data.metaTitle}
                                    </td>
                                    <td className="px-4 py-2.5">
                                        {data.metaKeywords ? data.metaKeywords : "-"}
                                    </td>
                                    <td className="px-4 py-2.5">
                                        <div className="flex items-center gap-1.5">
                                            <button
                                                onClick={() => onEdit(data)}
                                                className="border border-gray-300 text-gray-700 hover:text-[var(--color-primary)] hover:bg-gray-200 cursor-pointer p-1.5 rounded-md transition duration-300"
                                            >
                                                <FaEdit />
                                            </button>

                                            {/* <button
                                                onClick={() => openDeleteModal(data)}
                                                className="border border-gray-300 text-gray-700 hover:text-[var(--color-primary)] hover:bg-gray-200 cursor-pointer p-1.5 rounded-md transition duration-300"
                                            >
                                                <FiTrash2 />
                                            </button> */}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={tableHeaders.length}
                                    className="px-4 py-4 text-center italic"
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
                <div className="flex justify-center">
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

export default ProductMetaTable;
