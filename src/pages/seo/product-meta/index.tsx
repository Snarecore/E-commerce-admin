import { useState, useEffect } from "react";
import { useAPI } from "../../../hooks/useApi";
import apiConfig from "../../../config/api.json";
import { pageMetaQueryKey } from "../../../config/query-key";
import PageHeader from "../../../components/cards/PageHeader";
import Button from "../../../components/buttons/ButtonStyleOne";
import ProductMetaTable from "./component/ProductMetaTable";
import ProductMetaForm from "./component/ProductMetaForm";
import { MdOutlineSync } from "react-icons/md";

const ProductMeta = () => {
    const dataLimit = 10;
    const { usePaginatedQuery, fetchData } = useAPI();
    const [currentPageNumber, setCurrentPageNumber] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editData, setEditData] = useState<any | null>(null);
    const apiUrl = apiConfig.pageMeta.productSyncMetaUrl;

    const handleSync = async () => {
        try {
            await fetchData({ apiUrl: apiUrl });
        } catch (error) {
            console.error(error)
        }
    }

    const getMetaDataApiUrl = () => {
        const apiUrl = `${apiConfig.pageMeta.productMetaUrl}?page=${currentPageNumber}&limit=${dataLimit}`;
        return apiUrl;
    }

    const handlePagination = (paginationData: { selected: number }) => {
        const selectedPage = paginationData.selected + 1;
        setCurrentPageNumber(selectedPage);
    };

    const {
        data: dataList,
        refetch: fetchProductMetaData,
        isFetching,
        pageCount,
        isLoading
    } = usePaginatedQuery({
        queryKey: [pageMetaQueryKey],
        url: getMetaDataApiUrl()
    });

    useEffect(() => {
        fetchProductMetaData();
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
                        headerTitle="Product Meta Information"
                        headerDescription="Manage your product meta information"
                    />
                    <Button label="Product Synchronization" onClick={handleSync} color="var(--color-primary)" hoverColor="var(--color-primary-hover)" icon={<MdOutlineSync />}/>
                </div>
                <div className="grid grid-cols-12 gap-12">
                    <div className="col-span-12">
                        <ProductMetaTable
                            // @ts-ignore
                            dataList={dataList}
                            fetchData={fetchProductMetaData}
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
            {/* @ts-ignore */}
            <ProductMetaForm isOpen={isModalOpen} onClose={closeModal} fetchData={fetchData} editData={editData} />
        </>
    );
};

export default ProductMeta;
