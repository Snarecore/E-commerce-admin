import { FaStore, FaUserFriends } from "react-icons/fa";
import OverViewCard from "../../../components/cards/OverViewCard";
import OrderListTable from "../../../components/tables/OrderLists";
import ProductListTable from "../../../components/tables/ProductLists";
import { IoCubeOutline } from "react-icons/io5";
import { FiShoppingCart } from "react-icons/fi";
import { useAPI } from "../../../hooks/useApi";
import apiConfig from "../../../config/api.json";
import { useEffect, useState } from "react";
import DashboardSkeleton from "../../../components/skeleton/AdminDashboard";

interface DashboardData {
	totalProducts: number;
	totalOrders: number;
	totalVendors: number;
	totalCustomers: number;
	recentProducts: any;
	recentOrders: any;
}

const Dashboard = () => {
	const { fetchData } = useAPI();
	const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	const fetchDashboardData = async () => {
		try {
			setIsLoading(true);
			const response = await fetchData({
				apiUrl: `${apiConfig.dashboard.adminDashboardUrl}`
			});
			if (response) {
				setDashboardData(response);
			}
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchDashboardData();
	}, []);

	if (isLoading) return <DashboardSkeleton />;

	const ProductListHeaders = [
		"Name",
		"Main Category",
		"Price",
		"Created At",
		"Action"
	];

	const OrderListHeaders = [
		"Order ID",
		"Customer",
		"Amount",
		"Status",
		"Created At",
		"Action"
	];

	return (
		<div>
			<div className="flex flex-col gap-8">
				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full transition-all ease-in duration-300">
					<OverViewCard
						bgColor="bg-[var(--color-primary)]"
						title={dashboardData?.totalProducts?.toString() || "0"}
						subTitle="Total Products"
					>
						<IoCubeOutline />
					</OverViewCard>
					<OverViewCard
						bgColor="bg-[#00cfe8]"
						title={dashboardData?.totalOrders?.toString() || "0"}
						subTitle="Total Orders"
					>
						<FiShoppingCart />
					</OverViewCard>
					<OverViewCard
						bgColor="bg-[#1b2850]"
						title={dashboardData?.totalVendors?.toString() || "0"}
						subTitle="Total Vendor"
					>
						<FaStore />
					</OverViewCard>
					<OverViewCard
						bgColor="bg-[#28c76f]"
						title={dashboardData?.totalCustomers?.toString() || "0"}
						subTitle="Total Customer"
					>
						<FaUserFriends />
					</OverViewCard>
				</div>
				<ProductListTable
					title="Recent Products"
					headers={ProductListHeaders}
					data={dashboardData?.recentProducts?.data || []}
				/>
				<OrderListTable
					title="Recent Orders"
					headers={OrderListHeaders}
					data={dashboardData?.recentOrders || []}
				/>
			</div>
		</div>
	);
};

export default Dashboard;
