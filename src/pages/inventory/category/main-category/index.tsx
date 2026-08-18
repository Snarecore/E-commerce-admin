import { useEffect, useState } from "react";
import { IoMdAddCircleOutline } from "react-icons/io";
import CategoryTable from "./components/MainCategoryTable";
import MainCategoryForm from "./components/MainCategoryForm";
import apiConfig from "../../../../config/api.json";
import { useAPI } from "../../../../hooks/useApi";
import { mainCategoryQueryKey } from "../../../../config/query-key";
import PageHeader from "../../../../components/cards/PageHeader";
import Button from "../../../../components/buttons/ButtonStyleOne";

const MainCategory = () => {
	const dataLimit = 10;
	const [currentPageNumber, setCurrentPageNumber] = useState(1);
	const { usePaginatedQuery } = useAPI();
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editData, setEditData] = useState<any | null>(null);

	const mainCategoryListApiUrl = () => {
		const apiUrl = `${apiConfig.inventory.mainCategoryUrl}?page=${currentPageNumber}&limit=${dataLimit}`;
		return apiUrl;
	}

	const handlePagination = (paginationData: { selected: number }) => {
		const selectedPage = paginationData.selected + 1;
		setCurrentPageNumber(selectedPage);
	};

	const {
		data: dataList,
		refetch: fetchData,
		pageCount,
		isFetching,
		isLoading
	} = usePaginatedQuery({
		queryKey: [mainCategoryQueryKey],
		url: mainCategoryListApiUrl()
	});

	useEffect(() => {
		fetchData();
	}, [currentPageNumber]);

	const openModal = (data?: any) => {
		setEditData(data || null);
		setIsModalOpen(true);
	};

	const closeModal = () => {
		setIsModalOpen(false);
		setEditData(null);
	};

	return (
		<>
			<div className="flex flex-col gap-8">
				<div className="flex flex-wrap items-center justify-between">
					<PageHeader
						headerTitle="Main Category"
						headerDescription="Manage your main categories"
					/>
					<Button label="Add New Category" onClick={() => openModal()} color="var(--color-primary)" hoverColor="var(--color-primary-hover)" icon={<IoMdAddCircleOutline size={18} />} />
				</div>
				<div className="grid grid-cols-12 gap-12">
					<div className="col-span-12 xl:col-span-12">
						<CategoryTable
							// @ts-ignore
							dataList={dataList}
							fetchData={fetchData}
							pageCount={pageCount}
							currentPageNumber={currentPageNumber}
							handlePagination={handlePagination}
							isLoading={isLoading}
							isFetching={isFetching}
							onEdit={openModal}
						/>
					</div>
				</div>
			</div>

			<MainCategoryForm
				isOpen={isModalOpen}
				onClose={closeModal}
				editData={editData}
			/>
		</>
	);
};

export default MainCategory;
