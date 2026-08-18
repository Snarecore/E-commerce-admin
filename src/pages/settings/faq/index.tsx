import { useState, useEffect } from "react";
import PageHeader from "../../../components/cards/PageHeader";
import { IoMdAddCircleOutline } from "react-icons/io";
import FaqTable from "./components/FaqTable";
import FaqForm from "./components/FaqForm";
import { useAPI } from "../../../hooks/useApi";
import apiConfig from "../../../config/api.json";
import { faqQueryKey } from "../../../config/query-key";
import Button from "../../../components/buttons/ButtonStyleOne";


const Faq = () => {
    const dataLimit = 10;
	const [currentPageNumber, setCurrentPageNumber] = useState(1);
    const { usePaginatedQuery } = useAPI();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editData, setEditData] = useState<any | null>(null);

    const getOrderListApiUrl = () => {
		const apiUrl = `${apiConfig.setting.faqUrl}?page=${currentPageNumber}&limit=${dataLimit}`;
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
        queryKey: [faqQueryKey],
        url: getOrderListApiUrl()
    });

    useEffect(() => {
        fetchData();
    }, []);

    const openModal = (data?: any) => {
        setEditData(data || null);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditData(null);
    };

    return (
        <div>
            <div className="flex flex-col gap-8">
                <div className="flex items-center justify-between flex-wrap">
                    <PageHeader
                        headerTitle="FAQ List"
                        headerDescription="Manage your faqs"
                    />
                    <Button label="Add New FAQ" onClick={() => openModal()} color="var(--color-primary)" hoverColor="var(--color-primary-hover)" icon={<IoMdAddCircleOutline size={18} />} />
                </div>
                <div className="grid grid-cols-12 gap-12">
                    <div className="col-span-12">
                        <FaqTable
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
            <FaqForm isOpen={isModalOpen} onClose={closeModal} editData={editData} />
        </div>
    );
};

export default Faq;
