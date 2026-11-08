import { useState } from "react";
import { FaEdit } from "react-icons/fa";
import { FiTrash2 } from "react-icons/fi";
import DeleteModal from "../../../../../components/modals/DeleteModal";
import { useAPI } from "../../../../../hooks/useApi";
import apiConfig from "../../../../../config/api.json";
import TableSkeleton from "../../../../../components/skeleton/TableSkeleton";
import EmptyState from "../../../../../components/empty-state/EmptyState";
import Pagination from "../../../../../components/pagination";

interface HeroSliderDataProps {
	id: string;
	image: string;
	link: string;
	status: boolean;
}

interface HeroSliderTableProps {
	dataList: HeroSliderDataProps[];
	fetchData: () => void;
	isLoading?: boolean;
	isFetching?: boolean;
	pageCount: number;
	currentPageNumber: number;
	handlePagination: (paginationData: { selected: number }) => void;
	onEdit: (data?: HeroSliderDataProps) => void;
}

const HeroSliderTable = ({
	dataList,
	fetchData,
	isLoading,
	isFetching: _isFetching,
	pageCount, currentPageNumber, handlePagination,
	onEdit
}: HeroSliderTableProps) => {
	const { handleDeleteAPI } = useAPI();
	const apiUrl = apiConfig.setting.heroSliderUrl;

	const tableHeaders = [
		{ key: "sl", label: "Sl" },
		{ key: "image", label: "Image" },
		{ key: "link", label: "Link" },
		{ key: "status", label: "Status" },
		{ key: "action", label: "Action" }
	];

	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [selectedHeroSlider, setSelectedHeroSlider] = useState<HeroSliderDataProps | null>(null);

	const openDeleteModal = (data: HeroSliderDataProps) => {
		setSelectedHeroSlider(data);
		setIsDeleteModalOpen(true);
	};

	const closeDeleteModal = () => {
		setIsDeleteModalOpen(false);
		setSelectedHeroSlider(null);
	};

	const handleDelete = async () => {
		if (!selectedHeroSlider) return;
		const apiResponse = await handleDeleteAPI({
			url: `${apiUrl}/${selectedHeroSlider.id}`,
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
									<td className="px-4 py-2.5">
										<img
											src={data.image}
											alt="image"
											className="w-16 h-10 object-cover rounded-md shadow-sm border border-gray-200"
										/>
									</td>
									<td className="px-4 py-2.5 text-blue-500 hover:underline cursor-pointer">
										{data.link}
									</td>
									<td className="px-4 py-2.5">
										<span
											className={`px-2.5 py-0.5 text-xs font-semibold rounded-md flex items-center w-fit transition-all ${data.status
												? "bg-green-100 text-green-800"
												: "bg-red-100 text-red-800"
												}`}
										>
											{data.status ? "Active" : "Inactive"}
										</span>
									</td>
									<td className="px-4 py-2.5">
										<div className="flex items-center gap-1.5">
											<button
												onClick={() => onEdit(data)}
												className="border border-gray-300 text-gray-700 hover:text-[var(--color-primary)] hover:bg-gray-200 cursor-pointer p-1.5 rounded-md transition duration-300"
											>
												<FaEdit />
											</button>

											<button
												onClick={() => openDeleteModal(data)}
												className="border border-gray-300 text-gray-700 hover:text-[var(--color-primary)] hover:bg-gray-200 cursor-pointer p-1.5 rounded-md transition duration-300"
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
									className="px-4 py-4 text-center italic"
								>
									<EmptyState title="No slider available" description="Click below to add your first slider!" buttonText="+ Add New Slider" onButtonClick={() => onEdit()} />
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
			{selectedHeroSlider && (
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

export default HeroSliderTable;
