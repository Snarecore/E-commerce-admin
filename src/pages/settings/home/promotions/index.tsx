import { useState, useEffect } from "react";
import { IoMdAddCircleOutline } from "react-icons/io";
import PromotionsTable from "./components/PromotionsTable";
import { useAPI } from "../../../../hooks/useApi";
import apiConfig from "../../../../config/api.json";
import { promotionsQueryKey } from "../../../../config/query-key";
import PromotionsForm from "./components/PromotionsForm";
import Button from "../../../../components/buttons/ButtonStyleOne";
import PageHeader from "../../../../components/cards/PageHeader";

// interface HeroSliderDataProps {
//     id: string;
//     image: string;
//     link: string;
//     status: boolean;
// }

const Promotions = () => {
    const dataLimit = 10;
    const [currentPageNumber, setCurrentPageNumber] = useState(1);
    const { usePaginatedQuery } = useAPI();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editData, setEditData] = useState<any | null>(null);

    const getPromotionListApiUrl = () => {
        const apiUrl = `${apiConfig.setting.promotionsUrl}?page=${currentPageNumber}&limit=${dataLimit}`;
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
        queryKey: [promotionsQueryKey],
        url: getPromotionListApiUrl()
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
                        headerTitle="Promotions"
                        headerDescription="Manage your promotions"
                    />
                    <Button label="Add New Promotion" onClick={() => openModal()} color="var(--color-primary)" hoverColor="var(--color-primary-hover)" icon={<IoMdAddCircleOutline size={18} />} />
                </div>
                <PromotionsTable
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
            <PromotionsForm isOpen={isModalOpen} onClose={closeModal} fetchData={fetchData} editData={editData} />
        </>
    );
};

export default Promotions;
