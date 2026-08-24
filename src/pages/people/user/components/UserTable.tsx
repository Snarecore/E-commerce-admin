import { useState } from "react";
import { FiTrash2 } from "react-icons/fi";
import { useAPI } from "../../../../hooks/useApi";
import apiConfig from "../../../../config/api.json";
import TableSkeleton from "../../../../components/skeleton/TableSkeleton";
import DeleteModal from "../../../../components/modals/DeleteModal";
import EmptyState from "../../../../components/empty-state/EmptyState";
import Pagination from "../../../../components/pagination";

interface UserDataProps {
    id: string;
    name: string;
    featuredImage: string;
    email: string;
    phone: string;
}

interface UserTableProps {
    dataList: UserDataProps[];
    fetchData: () => void;
    isLoading?: boolean;
    isFetching?: boolean;
    pageCount: number;
    currentPageNumber: number;
    handlePagination: (paginationData: { selected: number }) => void;
}

const UserTable = ({
    dataList,
	fetchData,
	pageCount,
	currentPageNumber,
	handlePagination,
	isLoading,
	isFetching
}: UserTableProps) => {
    const { handleDeleteAPI } = useAPI();
    const apiUrl = apiConfig.people.user;

    const tableHeaders = [
        { key: "sl", label: "Sl" },
        { key: "name", label: "Name" },
        { key: "email", label: "Email" },
        { key: "phone", label: "Phone" },
        { key: "action", label: "Action" }
    ];

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedUserList, setSelectedUserList] = useState<UserDataProps | null>(null);

    const openDeleteModal = (data: UserDataProps) => {
        setSelectedUserList(data);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setSelectedUserList(null);
    };

    const handleDelete = async () => {
        if (!selectedUserList) return;
        const apiResponse = await handleDeleteAPI({
            url: `${apiUrl}/${selectedUserList.id}`,
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
                                        {data.name}
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-800">
                                        {data.email}
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-800">
                                        {data.phone}
                                    </td>
                                    
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
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
                                    <EmptyState title="No admin available" description="Can't find any admin? Invest more to the developers!" />
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {selectedUserList && (
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

export default UserTable;
