import { useState, useEffect } from "react";
import { useAPI } from "../../../hooks/useApi";
import apiConfig from "../../../config/api.json";
import { vendorsubscriptionQueryKey } from "../../../config/query-key";
import PageHeader from "../../../components/cards/PageHeader";
import VendorSubscriptionTable from "./component/VendorSubscriptionTable";


const VendorSubscription = () => {
    const dataLimit = 10;
    const { usePaginatedQuery } = useAPI();
    const [currentPageNumber, setCurrentPageNumber] = useState(1);

    const getVendorSubscriptionUrl = () => {
        const apiUrl = `${apiConfig.subscription.vendorSubscriptionUrl}?page=${currentPageNumber}&limit=${dataLimit}`;
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
        queryKey: [vendorsubscriptionQueryKey],
        url: getVendorSubscriptionUrl()
    });

    useEffect(() => {
        fetchData();
    }, [currentPageNumber]);


    return (
        <>
            <div className="flex flex-col gap-8">
                <div className="flex items-center justify-between flex-wrap">
                    <PageHeader
                        headerTitle="Vendor Subscriptions Information"
                        headerDescription="Manage your vendor subscriptions information"
                    />
                </div>
                <div className="grid grid-cols-12 gap-12">
                    <div className="col-span-12">
                        <VendorSubscriptionTable
                            // @ts-ignore
                            dataList={dataList}
                            fetchData={fetchData}
                            isLoading={isLoading}
                            isFetching={isFetching}
                            pageCount={pageCount}
                            currentPageNumber={currentPageNumber}
                            handlePagination={handlePagination}
                        />
                    </div>
                </div>
            </div>
        </>
    );
};

export default VendorSubscription;
