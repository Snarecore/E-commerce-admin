import { useEffect, useState } from "react";
import { IoMdAddCircleOutline } from "react-icons/io";
import FirstCategoryTable from "./components/FirstCategoryTable";
import { useAPI } from "../../../../hooks/useApi";
import apiConfig from "../../../../config/api.json";
import { firstCategoryQueryKey } from "../../../../config/query-key";
import FirstCategoryForm from "./components/FirstCategoryForm";
import Button from "../../../../components/buttons/ButtonStyleOne";
import PageHeader from "../../../../components/cards/PageHeader";

interface FirstCategoryDataProps {
	id: string;
	name: string;
	bannerImage: string;
	mainCategoryId: string;
	mainCategoryName: string;
	status: boolean;
}

const FirstCategory = () => {
	const dataLimit = 10;
	const [currentPageNumber, setCurrentPageNumber] = useState(1);
	const { usePaginatedQuery } = useAPI();
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editData, setEditData] = useState<FirstCategoryDataProps | null>(null);

	const getFirstCategoryListApiUrl = () => {
		const apiUrl = `${apiConfig.inventory.firstCategoryUrl}?page=${currentPageNumber}&limit=${dataLimit}`;
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
		queryKey: [firstCategoryQueryKey],
		url: getFirstCategoryListApiUrl()
	});

	useEffect(() => {
		fetchData();
	}, [currentPageNumber]);

	const openModal = (data?: FirstCategoryDataProps) => {
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
						headerTitle="First Category"
						headerDescription="Manage your first categories"
					/>
					<Button label="Add New First Category" onClick={() => openModal()} color="var(--color-primary)" hoverColor="var(--color-primary-hover)" icon={<IoMdAddCircleOutline size={18} />} />
				</div>
				<div className="grid grid-cols-12 gap-12">
					<div className="col-span-12 xl:col-span-12">
						<FirstCategoryTable
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

			<FirstCategoryForm
				isOpen={isModalOpen}
				onClose={closeModal}
				editData={editData}
			/>
		</>
	);
};

export default FirstCategory;
