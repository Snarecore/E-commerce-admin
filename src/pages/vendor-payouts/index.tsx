import { useState, useEffect } from "react";
import apiConfig from "../../config/api.json";
import { useAPI } from "../../hooks/useApi";
import { Role } from "../../enum/role.enum";
import PageHeader from "../../components/cards/PageHeader";
import VendorSubscriptionPayoutTable from "./components/PayoutTable";
import PayoutForm from "./components/PayoutForm";
import { vendorsubscriptionQueryKey } from "../../config/query-key";

const VendorPayouts = () => {
    const dataLimit = 10;
    const { usePaginatedQuery } = useAPI();
    const [currentPageNumber, setCurrentPageNumber] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editData, setEditData] = useState<any | null>(null);

    const [selectedFilters, setSelectedFilters] = useState<{
        vendorId: { label: string; value: string } | null;
    }>({
        vendorId: null,
    });

    const getVendorSubscriptionPayoutUrl = () => {
        const queryParams = new URLSearchParams({
            role: Role.ADMIN,
            page: currentPageNumber.toString(),
            limit: dataLimit.toString(),
            ...(selectedFilters.vendorId?.value && { vendorId: selectedFilters.vendorId.value })
        });
        // const apiUrl = `${apiConfig.subscription.vendorPayoutSubscriptionUrl}?role=${Role.ADMIN}&page=${currentPageNumber}&limit=${dataLimit}`;

        return `${apiConfig.subscription.vendorPayoutSubscriptionUrl}?${queryParams.toString()}`;
    }

    const handlePagination = (paginationData: { selected: number }) => {
        const selectedPage = paginationData.selected + 1;
        setCurrentPageNumber(selectedPage);
    };

    const {
        data: dataList,
        refetch: fetchPayoutList,
        isFetching,
        pageCount,
        isLoading
    } = usePaginatedQuery({
        queryKey: [vendorsubscriptionQueryKey, selectedFilters.vendorId?.value || ""],
        url: getVendorSubscriptionPayoutUrl()
    });

    useEffect(() => {
        fetchPayoutList();
    }, [currentPageNumber, selectedFilters]);


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
                        headerTitle="Vendor Payouts"
                        headerDescription="Manage your vendor payouts"
                    />
                </div>
                <div className="grid grid-cols-12 gap-12">
                    <div className="col-span-12">
                        <VendorSubscriptionPayoutTable
                            // @ts-ignore
                            dataList={dataList}
                            fetchPayoutList={fetchPayoutList}
                            isLoading={isLoading}
                            isFetching={isFetching}
                            pageCount={pageCount}
                            currentPageNumber={currentPageNumber}
                            setCurrentPageNumber={setCurrentPageNumber}
                            handlePagination={handlePagination}
                            onEdit={openModal}
                            selectedFilters={selectedFilters}
                            setSelectedFilters={setSelectedFilters}
                        />
                    </div>
                </div>
            </div>
            {/* @ts-ignore */}
            <PayoutForm isOpen={isModalOpen} onClose={closeModal} fetchData={fetchPayoutList} editData={editData} />
        </>
    );
};

export default VendorPayouts;
