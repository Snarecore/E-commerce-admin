import { useEffect, useState } from "react";
import PageHeader from "../../../components/cards/PageHeader";
import { useAPI } from "../../../hooks/useApi";
import apiConfig from "../../../config/api.json";
import { Role } from "../../../enum/role.enum";
import { userQueryKey } from "../../../config/query-key";
import AdminTable from "./components/AdminTable";
import Button from "../../../components/buttons/ButtonStyleOne";
// import { useNavigate } from "react-router-dom";
import { IoMdAddCircleOutline } from "react-icons/io";
import CreateAdminForm from "./components/CreateAdminForm";

interface AdminDataProps {
    id: string;
    name: string;
    featuredImage: string;
    email: string;
    phone: string;
}

const Admins = () => {
    const dataLimit = 10;
	const [currentPageNumber, setCurrentPageNumber] = useState(1);
    const { usePaginatedQuery } = useAPI();
    // const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
	const [editData, setEditData] = useState<AdminDataProps | null>(null);

    const getOrderListApiUrl = () => {
		const queryParams = new URLSearchParams({
			role: Role.ADMIN,
			page: currentPageNumber.toString(),
			limit: dataLimit.toString(),
			sortBy: "createdAt",
			sortOrder: "DESC",
			sort_by: "createdAt",
			sort_order: "desc",
			sort: "-createdAt",
			orderBy: "createdAt",
			order: "DESC"
		});
		return `${apiConfig.people.user}?${queryParams.toString()}`;
	};

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
    } = usePaginatedQuery<AdminDataProps>({
        queryKey: [userQueryKey, Role.ADMIN, currentPageNumber.toString(), dataLimit.toString()],
        url: getOrderListApiUrl()
    });

    useEffect(() => {
        fetchData();
    }, [currentPageNumber]);

    const openModal = (data?: AdminDataProps) => {
		setEditData(data || null);
		setIsModalOpen(true);
	};

	const closeModal = () => {
		setIsModalOpen(false);
		setEditData(null);
	};

    return (
        <>
        <div>
            <div className="flex flex-col gap-8">
                <div className="flex items-center justify-between flex-wrap">
                    <PageHeader
                        headerTitle="Admin List"
                        headerDescription="Manage your admins"
                    />
                    <Button label="Add New Admin" onClick={() => openModal()} color="var(--color-primary)" hoverColor="var(--color-primary-hover)" icon={<IoMdAddCircleOutline size={18} />} />
                </div>
                <div className="grid grid-cols-12 gap-12">
                    <div className="col-span-12">
                        <AdminTable
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
        </div>

        <CreateAdminForm
				isOpen={isModalOpen}
				onClose={closeModal}
				editData={editData}
                fetchData={fetchData}
			/>
        </>
    );
};

export default Admins;
