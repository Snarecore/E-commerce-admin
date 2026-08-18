import { useState } from "react";
import { FiTrash2 } from "react-icons/fi";
import { useAPI } from "../../../../hooks/useApi";
import apiConfig from "../../../../config/api.json";
import TableSkeleton from "../../../../components/skeleton/TableSkeleton";
import DeleteModal from "../../../../components/modals/DeleteModal";
import EmptyState from "../../../../components/empty-state/EmptyState";
import { FaEdit } from "react-icons/fa";
import Pagination from "../../../../components/pagination";

interface FaqDataProps {
    id: string;
    question: string;
    answer: string;
}

interface FaqTableProps {
    // @ts-ignore
    dataList: FaqDataProps[];
    fetchData: () => void;
    pageCount: number;
	currentPageNumber: number;
	handlePagination: (paginationData: { selected: number }) => void;
    isLoading?: boolean;
    isFetching?: boolean;
    onEdit: (data?: FaqDataProps) => void;
}

const FaqTable = ({
    // @ts-ignore
    dataList,
    fetchData,
    pageCount,
	currentPageNumber,
	handlePagination,
    isLoading,
    isFetching,
    onEdit
}: FaqTableProps) => {
    const { handleDeleteAPI } = useAPI();
    const apiUrl = apiConfig.setting.faqUrl;

    const tableHeaders = [
        { key: "sl", label: "Sl" },
        { key: "question", label: "Question" },
        { key: "answer", label: "Answer" },
        { key: "action", label: "Action" }
    ];

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedFaq, setSelectedFaq] = useState<FaqDataProps | null>(null);

    const openDeleteModal = (data: FaqDataProps) => {
        setSelectedFaq(data);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setSelectedFaq(null);
    };

    const handleDelete = async () => {
        if (!selectedFaq) return;
        const apiResponse = await handleDeleteAPI({
            url: `${apiUrl}/${selectedFaq.id}`,
            showSuccessMessage: true
        });
        if (apiResponse) {
            fetchData();
            closeDeleteModal();
        }
    };

    if (isFetching || isLoading) return <TableSkeleton />;

    return (
        <div className="p-6 bg-white rounded-lg border border-gray-200">
            <div className="mt-4 w-full overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[900px]">
                    <thead className="bg-gray-100">
                        <tr className="text-gray-600 text-sm border-b border-gray-200">
                            {tableHeaders.map(({ key, label }) => (
                                <th key={key} className="px-6 py-4 text-left text-[#000000e0]">
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
                                    <td className="px-6 py-4 font-medium text-gray-800">
                                        {index + 1}
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-800">
                                        {data.question}
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-800">
                                        {data.answer}
                                    </td>
                                    
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => onEdit(data)}
                                                className="border border-gray-300 text-gray-700 hover:text-[var(--color-primary)] hover:bg-gray-200 cursor-pointer p-2 rounded-md transition duration-300">
                                                <FaEdit />
                                            </button>

                                            <button
                                                onClick={() => openDeleteModal(data)}
                                                className="border border-gray-300 text-gray-700 hover:text-[var(--color-primary)] hover:bg-gray-200 cursor-pointer p-2 rounded-md transition duration-300">
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
                                    className="px-6 py-4 text-center italic"
                                >
                                    <EmptyState title="No Faq available" description="Add new faq!" buttonText="+ Add New Faq" onButtonClick={() => onEdit()} />
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {selectedFaq && (
                <DeleteModal
                    isOpen={isDeleteModalOpen}
                    title="Delete?"
                    message={`Are you sure you want to delete?`}
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

export default FaqTable;
