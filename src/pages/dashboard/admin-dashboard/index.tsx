import { FaUserFriends } from "react-icons/fa";
import { BiCategory } from "react-icons/bi";
import OverViewCard from "../../../components/cards/OverViewCard";
import OrderListTable from "../../../components/tables/OrderLists";
import ProductListTable from "../../../components/tables/ProductLists";
import { IoCubeOutline } from "react-icons/io5";
import { FiShoppingCart } from "react-icons/fi";
import { useAPI } from "../../../hooks/useApi";
import apiConfig from "../../../config/api.json";
import { useEffect, useMemo, useState } from "react";
import DashboardSkeleton from "../../../components/skeleton/AdminDashboard";
import SalesPurchaseChart from "../../../components/charts/BarChart";
import DoughnutChart from "../../../components/charts/DoughnutChart";
import MonthlyReportsLine from "../../../components/charts/LineChart";
import NewAgentsBar from "../../../components/charts/HorizontalChart";

interface DashboardData {
	totalProducts: number;
	totalOrders: number;
	totalVendors: number;
	totalCustomers: number;
	totalCategories?: number;
	topCategories?: Array<{ category: string; sales: number }>;
	monthlySalesCommissionData?: Array<{ month: string; totalSales: string | number; totalCommission: string | number }>;
	customerMonthlyReports?: number[];
	newVendorMonthlyReports?: number[];
	recentProducts: any;
	recentOrders: any;
}

// Constants outside component — defined once, never recreated on re-render
const PRODUCT_LIST_HEADERS = [
	"Name",
	"Main Category",
	"Price",
	"Created At",
	"Action"
];

const ORDER_LIST_HEADERS = [
	"Order ID",
	"Customer",
	"Amount",
	"Status",
	"Created At",
	"Action"
];



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

	// useMemo: only recalculates when recentOrders/monthlySalesCommissionData changes
	const monthlySalesCommissionData = useMemo(() => {
		if (dashboardData?.monthlySalesCommissionData && dashboardData.monthlySalesCommissionData.length > 0) {
			return dashboardData.monthlySalesCommissionData;
		}
		const ordersList = Array.isArray(dashboardData?.recentOrders?.data)
			? dashboardData.recentOrders.data
			: (Array.isArray(dashboardData?.recentOrders) ? dashboardData.recentOrders : []);

		const monthlyMap: Record<string, { totalSales: number; totalCommission: number }> = {};

		(ordersList || []).forEach((order: any) => {
			if (order && (order.createdAt || order.created_at || order.date)) {
				const dateVal = order.createdAt || order.created_at || order.date;
				const month = String(dateVal).substring(0, 7);
				if (!monthlyMap[month]) {
					monthlyMap[month] = { totalSales: 0, totalCommission: 0 };
				}
				monthlyMap[month].totalSales += Number(order.totalAmount || order.grandTotal || 0) || 0;
				monthlyMap[month].totalCommission += Number(order.totalCommission || 0) || 0;
			}
		});

		const result = Object.keys(monthlyMap).map(m => ({
			month: m,
			totalSales: monthlyMap[m].totalSales,
			totalCommission: monthlyMap[m].totalCommission,
		}));

		return result;
	}, [dashboardData?.recentOrders, dashboardData?.monthlySalesCommissionData]);

	if (isLoading) return <DashboardSkeleton />;

	return (
		<div>
			<div className="flex flex-col gap-8">
				{/* Overview Cards */}
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
						title={dashboardData?.totalCategories?.toString() || "0"}
						subTitle="Total Categories"
					>
						<BiCategory />
					</OverViewCard>
					<OverViewCard
						bgColor="bg-[#28c76f]"
						title={dashboardData?.totalCustomers?.toString() || "0"}
						subTitle="Total Customer"
					>
						<FaUserFriends />
					</OverViewCard>
				</div>

				{/* Charts Grid 1: Sales vs Commissions (Bar) & Top Categories (Doughnut) */}
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
					<div className="lg:col-span-8">
						<SalesPurchaseChart
							monthlySalesCommissionData={monthlySalesCommissionData}
						/>
					</div>
					<div className="lg:col-span-4">
						<DoughnutChart
							totalProducts={dashboardData?.totalProducts || 0}
							totalCategories={dashboardData?.totalCategories || 0}
							topCategories={dashboardData?.topCategories}
						/>
					</div>
				</div>

				{/* Charts Grid 2: Customer Reports Line & New Added Vendors Horizontal Bar */}
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
					<div className="lg:col-span-8">
						<MonthlyReportsLine
							title="Customer Reports by Month"
							values={dashboardData?.customerMonthlyReports}
						/>
					</div>
					<div className="lg:col-span-4">
						<NewAgentsBar
							title="New Registered Customers"
							dataValues={dashboardData?.newVendorMonthlyReports}
						/>
					</div>
				</div>

				{/* Recent Products Table */}
				<ProductListTable
					title="Recent Products"
					headers={PRODUCT_LIST_HEADERS}
					data={Array.isArray(dashboardData?.recentProducts?.data) ? dashboardData.recentProducts.data : (Array.isArray(dashboardData?.recentProducts) ? dashboardData.recentProducts : [])}
				/>

				{/* Recent Orders Table */}
				<OrderListTable
					title="Recent Orders"
					headers={ORDER_LIST_HEADERS}
					data={Array.isArray(dashboardData?.recentOrders?.data) ? dashboardData.recentOrders.data : (Array.isArray(dashboardData?.recentOrders) ? dashboardData.recentOrders : [])}
				/>
			</div>
		</div>
	);
};

export default Dashboard;
