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
	isFetching: _isFetching
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
                                        {data.name}
                                    </td>
                                    <td className="px-4 py-2.5 text-sm text-[var(--ui-text)] whitespace-nowrap">
                                        {data.email}
                                    </td>
                                    <td className="px-4 py-2.5 text-sm text-[var(--ui-text-muted)] font-mono whitespace-nowrap">
                                        {data.phone || "N/A"}
                                    </td>
                                    
                                    <td className="px-4 py-2.5 whitespace-nowrap">
                                        <div className="flex items-center justify-end gap-1.5 pr-2">
                                            <button
                                                onClick={() => openDeleteModal(data)}
                                                className="border border-[var(--ui-border)] text-[var(--ui-text-muted)] hover:text-red-500 hover:bg-red-500/10 cursor-pointer p-1.5 rounded-md transition duration-200"
                                                title="Delete User"
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
                                    <EmptyState title="No user available" description="No users found in database." />
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

export default UserTable;
