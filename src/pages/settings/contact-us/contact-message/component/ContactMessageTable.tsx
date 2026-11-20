import { useState } from "react";
import { FiTrash2 } from "react-icons/fi";
import DeleteModal from "../../../../../components/modals/DeleteModal";
import { useAPI } from "../../../../../hooks/useApi";
import apiConfig from "../../../../../config/api.json";
import TableSkeleton from "../../../../../components/skeleton/TableSkeleton";
import EmptyState from "../../../../../components/empty-state/EmptyState";

interface ContactMessageDataProps {
    id: string;
    name: string;
    email: string;
    phone: string;
    message: string;
}

interface ContactMessageTableProps {
    dataList: ContactMessageDataProps[];
    fetchData: () => void;
    isLoading?: boolean;
    isFetching?: boolean;
}

const ContactMessageTable = ({ dataList, fetchData, isLoading, isFetching: _isFetching }: ContactMessageTableProps) => {
    const { handleDeleteAPI } = useAPI();
    const apiUrl = apiConfig.setting.contactUs.contactMessageUrl;

    const tableHeaders = [
        { key: "sl", label: "Sl" },
        { key: "name", label: "Name" },
        { key: "email", label: "Email" },
        { key: "phone", label: "Phone" },
        { key: "message", label: "Message" },
        { key: "action", label: "Action" }
    ];

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedContactMessage, setSelectedContactMessage] = useState<ContactMessageDataProps | null>(null);

    const openDeleteModal = (data: ContactMessageDataProps) => {
        setSelectedContactMessage(data);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setSelectedContactMessage(null);
    };

    const handleDelete = async () => {
        if (!selectedContactMessage) return;
        const apiResponse = await handleDeleteAPI({
            url: `${apiUrl}/${selectedContactMessage.id}`,
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
                                    <td className="px-4 py-2.5 font-medium text-[var(--ui-text-muted)] whitespace-nowrap">{index + 1}</td>
                                    <td className="px-4 py-2.5 font-medium text-[var(--ui-text)] whitespace-nowrap">
                                        {data.name}
                                    </td>
                                    <td className="px-4 py-2.5 text-sm text-[var(--ui-text)] whitespace-nowrap">
                                        {data.email}
                                    </td>
                                    <td className="px-4 py-2.5 text-sm text-[var(--ui-text-muted)] font-mono whitespace-nowrap">
                                        {data.phone || "N/A"}
                                    </td>
                                    <td className="px-4 py-2.5 text-sm text-[var(--ui-text-muted)] max-w-xs truncate">
                                        {data.message}
                                    </td>
                                    <td className="px-4 py-2.5 whitespace-nowrap">
                                        <div className="flex items-center justify-end gap-1.5 pr-2">
                                            <button onClick={() => openDeleteModal(data)} className="border border-[var(--ui-border)] text-[var(--ui-text-muted)] hover:text-red-500 hover:bg-red-500/10 cursor-pointer p-1.5 rounded-md transition duration-200" title="Delete Message">
                                                <FiTrash2 />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={tableHeaders.length} className="px-4 py-4 text-center italic text-[var(--ui-text-muted)]">
                                    <EmptyState title="No contact messages found." />
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {selectedContactMessage && (
                <DeleteModal
                    isOpen={isDeleteModalOpen}
                    title="Delete Contact Message"
                    message={`Are you sure you want to delete contact message?`}
                    onClose={closeDeleteModal}
                    onDelete={handleDelete}
                />
            )}
        </div>
    );
};

export default ContactMessageTable;
