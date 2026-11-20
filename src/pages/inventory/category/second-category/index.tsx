import { useEffect, useState } from "react";
import { IoMdAddCircleOutline } from "react-icons/io";
import SecondCategoryTable from "./components/SecondCategoryTable";
import { useAPI } from "../../../../hooks/useApi";
import apiConfig from "../../../../config/api.json";
import { secondCategoryQueryKey } from "../../../../config/query-key";
import SecondCategoryForm from "./components/SecondCategoryForm";
import Button from "../../../../components/buttons/ButtonStyleOne";
import PageHeader from "../../../../components/cards/PageHeader";
import RefreshButton from "../../../../components/table-components/RefreshButton";

interface SecondCategoryDataProps {
	id: string;
	name: string;
	bannerImage: string;
	mainCategoryId: string;
	mainCategoryName: string;
	firstCategoryId: string;
	firstCategoryName: string;
	status: boolean;
}

const SecondCategory = () => {
	const dataLimit = 10;
	const [currentPageNumber, setCurrentPageNumber] = useState(1);
	const { usePaginatedQuery } = useAPI();
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editData, setEditData] = useState<SecondCategoryDataProps | null>(null);

	const getSecondCategoryApiUrl = () => {
		const apiUrl = `${apiConfig.inventory.secondCategoryUrl}?page=${currentPageNumber}&limit=${dataLimit}`;
		return apiUrl;
	}

	const handlePagination = (paginationData: { selected: number }) => {
		const selectedPage = paginationData.selected + 1;
		setCurrentPageNumber(selectedPage);
	};

	const {
		data: dataList,
		refetch: fetchData,
		isFetching,
		pageCount,
		isLoading
	} = usePaginatedQuery({
		queryKey: [secondCategoryQueryKey],
		url: getSecondCategoryApiUrl()
	});

	useEffect(() => {
		fetchData();
	}, [currentPageNumber]);

	const openModal = (data?: SecondCategoryDataProps) => {
		setEditData(data || null);
		setIsModalOpen(true);
	};

	const closeModal = () => {
		setIsModalOpen(false);
		setEditData(null);
	};

	return (
		<>
			<div className="flex flex-col gap-3">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<PageHeader
						headerTitle="Second Category"
						headerDescription="Manage your second categories"
					/>
					<div className="flex items-center gap-2.5">
						<RefreshButton onClick={() => fetchData()} loading={isFetching} />
						<Button label="Add New Second Category" onClick={() => openModal()} color="var(--color-primary)" hoverColor="var(--color-primary-hover)" icon={<IoMdAddCircleOutline size={18} />} />
					</div>
				</div>
				<div className="grid grid-cols-12 gap-3">
					<div className="col-span-12 xl:col-span-12">
						<SecondCategoryTable
							// @ts-ignore
							dataList={dataList}
							fetchData={fetchData}
							isLoading={isLoading}
							isFetching={isFetching}
							pageCount={pageCount}
							currentPageNumber={currentPageNumber}
							handlePagination={handlePagination}
							onEdit={openModal}
						/>
					</div>
				</div>
			</div>

			<SecondCategoryForm
				isOpen={isModalOpen}
				onClose={closeModal}
				editData={editData}
			/>
		</>
	);
};

export default SecondCategory;
