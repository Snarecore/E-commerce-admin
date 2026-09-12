import { useEffect, useState } from "react";
import PageHeader from "../../../components/cards/PageHeader";
import { useAPI } from "../../../hooks/useApi";
import apiConfig from "../../../config/api.json";
import { Role } from "../../../enum/role.enum";
import { userQueryKey } from "../../../config/query-key";
import UserTable from "./components/UserTable";

interface UserDataProps {
    id: string;
    name: string;
    featuredImage: string;
    email: string;
    phone: string;
}

const Users = () => {
    const dataLimit = 10;
	const [currentPageNumber, setCurrentPageNumber] = useState(1);
    const { usePaginatedQuery } = useAPI();

    const getOrderListApiUrl = () => {
		const queryParams = new URLSearchParams({
			role: Role.CUSTOMER,
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
    } = usePaginatedQuery<UserDataProps>({
        queryKey: [userQueryKey, Role.CUSTOMER, currentPageNumber.toString(), dataLimit.toString()],
        url: getOrderListApiUrl()
    });

    useEffect(() => {
        fetchData();
    }, [currentPageNumber]);

    return (
        <div>
            <div className="flex flex-col gap-8">
                <div className="flex items-center justify-between flex-wrap">
                    <PageHeader
                        headerTitle="User List"
                        headerDescription="Manage your users"
                    />
                </div>
                <div className="grid grid-cols-12 gap-12">
                    <div className="col-span-12">
                        <UserTable
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
    );
};

export default Users;
