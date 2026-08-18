import { useEffect, useState } from "react";
import { useAPI } from "../../../hooks/useApi";
import PageHeader from "../../../components/cards/PageHeader";
import ProductReviewTable from "./component/ProductReviewTable";
import apiConfig from "../../../config/api.json";

const ProductReview = () => {
    const dataLimit = 10;
    const [currentPageNumber, setCurrentPageNumber] = useState(1);
    const { usePaginatedQuery } = useAPI();

    const getProductRatingListApiUrl = () => {
        const apiUrl = `${apiConfig.inventory.productCommentsUrl}?page=${currentPageNumber}&limit=${dataLimit}`;
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
        queryKey: [],
        url: getProductRatingListApiUrl()
    });

    useEffect(() => {    
        fetchData();
    }, [currentPageNumber]);

    return (
        <>
            <div className="flex flex-col gap-8">
                <div className="flex items-center justify-between flex-wrap">
                    <PageHeader
                        headerTitle="Product Reviews"
                        headerDescription="Manage your product reviews"
                    />
                </div>

                <div className="grid grid-cols-12 gap-12">
                    <div className="col-span-12 xl:col-span-12">
                        <ProductReviewTable
                            //@ts-ignore
                            dataList={dataList}
                            fetchData={fetchData}
                            pageCount={pageCount}
                            currentPageNumber={currentPageNumber}
                            handlePagination={handlePagination}
                            isLoading={isLoading}
                            isFetching={isFetching}
                        />
                    </div>
                </div>
            </div>
        </>
    );
};

export default ProductReview;