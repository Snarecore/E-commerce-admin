import { useState } from "react";
import DeleteModal from "../../../../../components/modals/DeleteModal";
import { useAPI } from "../../../../../hooks/useApi";
import apiConfig from "../../../../../config/api.json";
import TableSkeleton from "../../../../../components/skeleton/TableSkeleton";
import { FaEdit } from "react-icons/fa";
import { FiTrash2 } from "react-icons/fi";
import EmptyState from "../../../../../components/empty-state/EmptyState";
import Pagination from "../../../../../components/pagination";

interface SecondCategoryDataProps {
	id: string;
	name: string;
	bannerImage: string;
	mainCategoryId: string;
	mainCategoryName: string;
	firstCategoryId: string;
	firstCategoryName: string;
	status: boolean;
	position?: number;
}

interface SecondCategoryTableProps {
	// @ts-ignore
	dataList: SecondCategoryDataProps[];
	fetchData: () => void;
	isLoading?: boolean;
	pageCount: number;
	currentPageNumber: number;
	handlePagination: (paginationData: { selected: number }) => void;
	isFetching?: boolean;
	onEdit: (data?: SecondCategoryDataProps) => void;
}

const SecondCategoryTable = ({
	dataList,
	fetchData,
	isLoading,
	pageCount, currentPageNumber, handlePagination,
	isFetching: _isFetching,
	onEdit
}: SecondCategoryTableProps) => {
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [selectedSecondCategory, setSelectedSecondCategory] = useState<SecondCategoryDataProps | null>(null);

	const { handleDeleteAPI } = useAPI();
	const apiUrl = apiConfig.inventory.secondCategoryUrl;

	const tableHeaders = [
		{ key: "sl", label: "Sl" },
		{ key: "bannerImage", label: "Banner Image" },
		{ key: "name", label: "Name" },
		{ key: "mainCategoryName", label: "Main Category" },
		{ key: "firstCategoryName", label: "First Category" },
		{ key: "position", label: "Position" },
		{ key: "status", label: "Status" },
		{ key: "action", label: "Action" }
	];

	const openDeleteModal = (data: SecondCategoryDataProps) => {
		setSelectedSecondCategory(data);
		setIsDeleteModalOpen(true);
	};

	const closeDeleteModal = () => {
		setIsDeleteModalOpen(false);
		setSelectedSecondCategory(null);
	};

	const handleDelete = async () => {
		if (!selectedSecondCategory) return;

		const apiResponse = await handleDeleteAPI({
			url: `${apiUrl}/${selectedSecondCategory.id}`,
			showSuccessMessage: true
		});

		if (apiResponse) {
			fetchData();
			closeDeleteModal();
		}
	};

	if (isLoading) return <TableSkeleton />;

	return (
		<div className="p-6 bg-[var(--ui-surface)] rounded-md border border-[var(--ui-border)] shadow-sm transition-colors duration-200">
			<div className="mt-4 w-full overflow-x-auto">
				<table className="w-full text-left border-collapse min-w-[800px] cursor-pointer">
					<thead className="bg-[var(--ui-surface-muted)]">
						<tr className="text-[var(--ui-text-muted)] text-sm border-b border-[var(--ui-border)]">
							{tableHeaders.map(({ key, label }) => (
								<th key={key} className="px-6 py-4 text-left font-semibold text-[var(--ui-text)]">
									{label}
								</th>
							))}
						</tr>
					</thead>
					<tbody className="bg-[var(--ui-surface)] divide-y divide-[var(--ui-border)] rounded-md">
						{dataList?.length > 0 ? (
							dataList?.map((data, index) => (
								<tr key={data.id} className="border-b border-[var(--ui-border)] text-[var(--ui-text)] hover:bg-[var(--ui-surface-muted)] transition duration-200">
									<td className="px-6 py-4 font-medium text-[var(--ui-text-muted)]">
										{index + 1}
									</td>
									<td className="px-6 py-4">
										<img
											src={data.bannerImage}
											alt="image"
											height={70}
											width={70}
											className="rounded-md shadow-sm border border-[var(--ui-border)] hover:scale-105 transition-all ease-in-out duration-300"
										/>
									</td>
									<td className="px-6 py-4">{data.name}</td>
									<td className="px-6 py-4">{data.mainCategoryName}</td>
									<td className="px-6 py-4">{data.firstCategoryName}</td>
									<td className="px-6 py-4">
										{data.position !== undefined && data.position !== 9999 ? data.position : "N/A"}
									</td>
									<td className="px-6 py-4">
										<span className={`px-3 py-1 text-xs font-semibold rounded-md flex items-center w-fit transition-all ${data.status ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" : "bg-red-500/15 text-red-400 border border-red-500/30"}`}>
											{data.status ? "Active" : "Inactive"}
										</span>
									</td>
									<td className="px-6 py-4">
										<div className="flex items-center gap-2">
											<button onClick={() => onEdit(data)} className="border border-[var(--ui-border)] text-[var(--ui-text-muted)] hover:text-[var(--primary-color)] hover:bg-[var(--ui-surface-muted)] cursor-pointer p-2 rounded-md transition duration-200">
												<FaEdit />
											</button>
											<button onClick={() => openDeleteModal(data)} className="border border-[var(--ui-border)] text-[var(--ui-text-muted)] hover:text-red-500 hover:bg-red-500/10 cursor-pointer p-2 rounded-md transition duration-200">
												<FiTrash2 />
											</button>
										</div>
									</td>
								</tr>
							))
						) : (
							<tr>
								<td colSpan={tableHeaders.length} className="px-6 py-4 text-center italic text-[var(--ui-text-muted)]">
									<EmptyState title="No category available" description="Click below to add your first category!" buttonText="+ Add New Category" onButtonClick={() => onEdit()} />
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
			{selectedSecondCategory && (
				<DeleteModal
					isOpen={isDeleteModalOpen}
					title="Confirm Delete"
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

export default SecondCategoryTable;
