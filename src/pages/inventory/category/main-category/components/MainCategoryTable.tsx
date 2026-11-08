import { useState } from "react";
import DeleteModal from "../../../../../components/modals/DeleteModal";
import TableSkeleton from "../../../../../components/skeleton/TableSkeleton";
import { FaEdit } from "react-icons/fa";
import { FiTrash2 } from "react-icons/fi";
import { useAPI } from "../../../../../hooks/useApi";
import apiConfig from "../../../../../config/api.json";
import EmptyState from "../../../../../components/empty-state/EmptyState";
import Pagination from "../../../../../components/pagination";

interface CategoryDataProps {
	id: string;
	name: string;
	slug: string;
	image: string;
	bannerImage: string;
	status: boolean;
	position?: number;
}

interface CategoryTableProps {
	// @ts-ignore
	dataList: CategoryDataProps[];
	fetchData: () => void;
	pageCount: number;
	currentPageNumber: number;
	handlePagination: (paginationData: { selected: number }) => void;
	isLoading: boolean;
	isFetching: boolean;
	onEdit: (data?: CategoryDataProps) => void;
}

const CategoryTable = ({ dataList, fetchData, pageCount, currentPageNumber, handlePagination, isLoading, isFetching: _isFetching, onEdit }: CategoryTableProps) => {
	const { handleDeleteAPI } = useAPI();
	const apiUrl = apiConfig.inventory.mainCategoryUrl;
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [selectedCategory, setSelectedCategory] = useState<CategoryDataProps | null>(null);

	const tableHeaders = [
		{ key: "sl", label: "Sl" },
		{ key: "image", label: "Image" },
		{ key: "bannerImage", label: "Banner Image" },
		{ key: "name", label: "Name" },
		{ key: "position", label: "Position" },
		{ key: "status", label: "Status" },
		{ key: "action", label: "Action" }
	];

	const openDeleteModal = (category: CategoryDataProps) => {
		setSelectedCategory(category);
		setIsDeleteModalOpen(true);
	};

	const closeDeleteModal = () => {
		setSelectedCategory(null);
		setIsDeleteModalOpen(false);
	};

	const handleDelete = async () => {
		if (!selectedCategory) return;

		const response = await handleDeleteAPI({
			url: `${apiUrl}/${selectedCategory.id}`,
			showSuccessMessage: true
		});
		if (response) {
			fetchData();
			closeDeleteModal();
		}
	};

	if (isLoading) return <TableSkeleton />;

	return (
		<div className="p-4 sm:p-5 bg-[var(--ui-surface)] rounded-md border border-[var(--ui-border)] shadow-sm transition-colors duration-200">
			<div className="mt-3 w-full overflow-x-auto">
				<table className="w-full text-left border-collapse min-w-[900px] cursor-pointer">
					<thead className="bg-[var(--ui-surface-muted)]">
						<tr className="text-[var(--ui-text-muted)] text-[13px] border-b border-[var(--ui-border)]">
							{tableHeaders.map(({ key, label }) => (
								<th key={key} className="px-4 py-2.5 text-left font-semibold text-[var(--ui-text)]">
									{label}
								</th>
							))}
						</tr>
					</thead>
					<tbody className="bg-[var(--ui-surface)] divide-y divide-[var(--ui-border)] rounded-md">
						{dataList?.length > 0 ? (
							dataList?.map((data, index) => (
								<tr key={data.id} className="border-b border-[var(--ui-border)] text-[var(--ui-text)] hover:bg-[var(--ui-surface-muted)] transition duration-200">
									<td className="px-4 py-2.5 font-medium text-[var(--ui-text-muted)]">
										{index + 1}
									</td>
									<td className="px-4 py-2.5">
										<img
											src={data.image}
											alt="image"
											className="w-12 h-12 object-cover rounded-md p-0.5 border border-[var(--ui-border)] hover:scale-105 transition-all ease-in-out duration-300"
										/>
									</td>
									<td className="px-4 py-2.5">
										<img
											src={data.bannerImage}
											alt="banner image"
											className="w-20 h-11 object-cover rounded-md shadow-sm border border-[var(--ui-border)] hover:scale-105 transition-all ease-in-out duration-300"
										/>
									</td>
									<td className="px-4 py-2.5">{data.name}</td>
									<td className="px-4 py-2.5">
										{data.position !== undefined && data.position !== 9999 ? data.position : "N/A"}
									</td>
									<td className="px-4 py-2.5">
										<span className={`px-2.5 py-0.5 text-xs font-semibold rounded-md flex items-center w-fit transition-all ${data.status ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" : "bg-red-500/15 text-red-400 border border-red-500/30"}`}>
											{data.status ? "Active" : "Inactive"}
										</span>
									</td>
									<td className="px-4 py-2.5">
										<div className="flex items-center gap-1.5">
											<button onClick={() => onEdit(data)} className="border border-[var(--ui-border)] text-[var(--ui-text-muted)] hover:text-[var(--primary-color)] hover:bg-[var(--ui-surface-muted)] cursor-pointer p-1.5 rounded-md transition duration-200">
												<FaEdit />
											</button>
											<button onClick={() => openDeleteModal(data)} className="border border-[var(--ui-border)] text-[var(--ui-text-muted)] hover:text-red-500 hover:bg-red-500/10 cursor-pointer p-1.5 rounded-md transition duration-200">
												<FiTrash2 />
											</button>
										</div>
									</td>
								</tr>
							))
						) : (
							<tr>
								<td colSpan={tableHeaders.length} className="px-4 py-4 text-center italic text-[var(--ui-text-muted)]">
									<EmptyState title="No category available" description="Click below to add your first category!" buttonText="+ Add New Category" onButtonClick={() => onEdit()} />
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
			{selectedCategory && (
				<DeleteModal
					isOpen={isDeleteModalOpen}
					title="Delete Category?"
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

export default CategoryTable;
