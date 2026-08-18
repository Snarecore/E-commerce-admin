//@ts-ignore
import { useState, useEffect } from "react";
import PageHeader from "../../../components/cards/PageHeader";
import { IoMdAddCircleOutline } from "react-icons/io";
import { useAPI } from "../../../hooks/useApi";
//@ts-ignore
import apiConfig from "../../../config/api.json";
//@ts-ignore
import { faqQueryKey } from "../../../config/query-key";
import Button from "../../../components/buttons/ButtonStyleOne";
//@ts-ignore
import ReviewTable from "./component/ReviewTable";


const Faq = () => {
    //@ts-ignore
    const dataLimit = 10;
    //@ts-ignore
    const [currentPageNumber, setCurrentPageNumber] = useState(1);
    //@ts-ignore
    const { usePaginatedQuery } = useAPI();
    //@ts-ignore
    const [isModalOpen, setIsModalOpen] = useState(false);
    //@ts-ignore
    const [editData, setEditData] = useState<any | null>(null);

    // const getOrderListApiUrl = () => {
    // 	const apiUrl = `${apiConfig.setting.faqUrl}?page=${currentPageNumber}&limit=${dataLimit}`;
    // 	return apiUrl;
    // }
    //@ts-ignore
    const handlePagination = (paginationData: { selected: number }) => {
        const selectedPage = paginationData.selected + 1;
        setCurrentPageNumber(selectedPage);
    };

    // const {
    //     data: dataList,
    //     refetch: fetchData,
    //     pageCount,
    //     isFetching,
    //     isLoading
    // } = usePaginatedQuery({
    //     queryKey: [faqQueryKey],
    //     url: getOrderListApiUrl()
    // });

    // useEffect(() => {
    //     fetchData();
    // }, []);

    const openModal = (data?: any) => {
        setEditData(data || null);
        setIsModalOpen(true);
    };


    return (
        <div>
            <div className="flex flex-col gap-8">
                <div className="flex items-center justify-between flex-wrap">
                    <PageHeader
                        headerTitle="Review List"
                        headerDescription="Manage your reviews"
                    />
                    <Button label="Add New Category" onClick={() => openModal()} color="var(--color-primary)" hoverColor="var(--color-primary-hover)" icon={<IoMdAddCircleOutline size={18} />} />
                </div>
                <div className="grid grid-cols-12 gap-12">
                    {/* <div className="col-span-12">
                        <ReviewTable
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
                    </div> */}
                </div>
            </div>
        </div>
    );
};

export default Faq;
