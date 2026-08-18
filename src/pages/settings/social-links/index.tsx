import { useState, useEffect } from "react";
import { IoMdAddCircleOutline } from "react-icons/io";
import { useAPI } from "../../../hooks/useApi";
import apiConfig from "../../../config/api.json";
import { socialLinksQueryKey } from "../../../config/query-key";
import PageHeader from "../../../components/cards/PageHeader";
import Button from "../../../components/buttons/ButtonStyleOne";
import SocialLinksTable from "./components/SocialLinksTable";
import SocialLinksForm from "./components/SocialLinksForm";

const SocialLinks = () => {
    const dataLimit = 10;
	const [currentPageNumber, setCurrentPageNumber] = useState(1);
    const { usePaginatedQuery } = useAPI();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editData, setEditData] = useState<any | null>(null);

    const getSocialLinksApiUrl = () => {
		const apiUrl = `${apiConfig.socialLinks.socialLinks}?page=${currentPageNumber}&limit=${dataLimit}`;
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
        queryKey: [socialLinksQueryKey],
        url: getSocialLinksApiUrl()
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
                        headerTitle="Social Links"
                        headerDescription="Manage your social links"
                    />
                    <Button label="Add New Social Links" onClick={() => openModal()} color="var(--color-primary)" hoverColor="var(--color-primary-hover)" icon={<IoMdAddCircleOutline size={18} />} />
                </div>
                <div className="grid grid-cols-12 gap-12">
                    <div className="col-span-12">
                        <SocialLinksTable
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
            <SocialLinksForm isOpen={isModalOpen} onClose={closeModal} fetchData={fetchData} editData={editData} />
        </>
    );
};

export default SocialLinks;
 