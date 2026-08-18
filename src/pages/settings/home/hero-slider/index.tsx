import { useState, useEffect } from "react";
import { IoMdAddCircleOutline } from "react-icons/io";
import HeroSliderTable from "./components/HeroSliderTable";
import { useAPI } from "../../../../hooks/useApi";
import apiConfig from "../../../../config/api.json";
import { heroSliderQueryKey } from "../../../../config/query-key";
import HeroSliderForm from "./components/HeroSliderForm";
import PageHeader from "../../../../components/cards/PageHeader";
import Button from "../../../../components/buttons/ButtonStyleOne";

const HeroSlider = () => {
    const dataLimit = 10;
	const [currentPageNumber, setCurrentPageNumber] = useState(1);
    const { usePaginatedQuery } = useAPI();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editData, setEditData] = useState<any | null>(null);

    const getHeroSliderListApiUrl = () => {
		const apiUrl = `${apiConfig.setting.heroSliderUrl}?page=${currentPageNumber}&limit=${dataLimit}`;
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
        queryKey: [heroSliderQueryKey],
        url: getHeroSliderListApiUrl()
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
                <div className="flex items-center justify-between flex-wrap">
                    <PageHeader
                        headerTitle="Hero Slider"
                        headerDescription="Manage your hero slider"
                    />
                    <Button label="Add New Slider" onClick={() => openModal()} color="var(--color-primary)" hoverColor="var(--color-primary-hover)" icon={<IoMdAddCircleOutline size={18} />} />
                </div>
                <div className="grid grid-cols-12 gap-12">
                    <div className="col-span-12">
                        <HeroSliderTable
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
            <HeroSliderForm isOpen={isModalOpen} onClose={closeModal} fetchData={fetchData} editData={editData} />
        </>
    );
};

export default HeroSlider;
