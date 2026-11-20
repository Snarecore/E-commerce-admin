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
        <div className="p-4 sm:p-5 bg-white rounded-lg border border-gray-200">
            <div className="mt-2.5 w-full overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[1000px]">
                    <thead className="bg-gray-100">
                        <tr className="text-gray-600 text-[13px] font-semibold border-b border-gray-200">
                            {tableHeaders.map(({ key, label }) => (
                                <th key={key} className={`px-4 py-2.5 font-semibold text-[#000000e0] ${key === "action" ? "text-right pr-6" : "text-left"}`}>{label}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 rounded-lg">
                        {dataList?.length > 0 ? (
                            dataList?.map((data, index) => (
                                <tr key={data.id} className="border-b border-gray-100 text-gray-700 hover:bg-gray-50 transition duration-300">
                                    <td className="px-4 py-2.5 font-medium text-gray-800">{index + 1}</td>
                                    <td className="px-4 py-2.5">
                                        {data.name}
                                    </td>
                                    <td className="px-4 py-2.5">
                                        {data.email}
                                    </td>
                                    <td className="px-4 py-2.5">
                                        {data.phone}
                                    </td>
                                    <td className="px-4 py-2.5">
                                        {data.message}
                                    </td>
                                    <td className="px-4 py-2.5">
                                        <div className="flex items-center justify-end gap-1.5 pr-2">
                                            <button onClick={() => openDeleteModal(data)} className="border border-gray-300 text-gray-700 hover:text-[var(--color-primary)] hover:bg-gray-200 cursor-pointer p-1.5 rounded-md transition duration-300">
                                                <FiTrash2 />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={tableHeaders.length} className="px-4 py-4 text-center italic">
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
