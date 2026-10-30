import { useEffect, useState } from "react";
import BestSeller from "../../../components/cards/BestSeller";
import RecentTransactions from "../../../components/cards/RecentTransactions";
import { IoMdRefresh } from "react-icons/io";
import WeeklyEarningCard from "../../../components/cards/WeeklyEarningCard";
import WelcomeCard from "../../../components/cards/welcomeCard/WelcomeCard";
import SalesCard from "../../../components/cards/SalesCard";
import { useAPI } from "../../../hooks/useApi";
import apiConfig from "../../../config/api.json";
import { formatPrettyDateWithTime } from "../../../utils/date-utils";
import { getDisplayCustomerName } from "../../../utils/order-utils";

const SalesDashboard = () => {
	const { fetchData } = useAPI();
	const [dashboardData, setDashboardData] = useState<any>(null);
	const [isLoading, setIsLoading] = useState(true);

	const loadData = async () => {
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
		loadData();
	}, []);

	const transactionsData = (dashboardData?.recentOrders?.data || dashboardData?.recentOrders || []).map((order: any, idx: number) => {
		const isCompleted = order.status === "Completed" || order.status === "Delivered";
		const isFailed = order.status === "Failed" || order.status === "Rejected" || order.status === "Cancelled";
		const statusBg = isCompleted ? "#3EB780" : isFailed ? "#EF4444" : "#FE9F43";

		return {
			id: order.id || idx,
			image: order.orderSummaries?.[0]?.productImage || "./images/products/product1.png",
			name: getDisplayCustomerName(order) || "Customer",
			time: formatPrettyDateWithTime(order.createdAt),
			payment: order.paymentMethod || "COD",
			serialNumber: `#${order.orderId || order.id?.slice(0, 8)}`,
			status: order.status || "Pending",
			statusBg,
			amount: `৳${Number(order.totalAmount || 0).toLocaleString()}`,
		};
	});

	return (
		<div className="flex flex-col gap-8">
			<WelcomeCard />

			<div className="grid grid-cols-12 gap-8">
				{/* Weekly Earnings */}
				<div className="col-span-12 lg:col-span-12 xl:col-span-6">
					<WeeklyEarningCard
						amount={dashboardData?.weeklyEarnings?.amount || 0}
						percentageChange={dashboardData?.weeklyEarnings?.percentageChange || 0}
					/>
				</div>

				{/* Sales Cards */}
				<div className="col-span-12 sm:col-span-12 md:col-span-6 xl:col-span-3">
					<SalesCard
						bgColor="bg-[#FE9F43]"
						imageSrc="./images/total-sales.svg"
						mainText={String(dashboardData?.totalOrders ?? (isLoading ? "..." : 0))}
						subText="Total Orders Placed"
						icon={<IoMdRefresh onClick={loadData} title="Refresh" className="hover:rotate-180 transition-all duration-300" />}
					/>
				</div>

				<div className="col-span-12 sm:col-span-12 md:col-span-6 xl:col-span-3">
					<SalesCard
						bgColor="bg-[#092C4C]"
						imageSrc="./images/total-sales.svg"
						mainText={String(dashboardData?.totalProducts ?? (isLoading ? "..." : 0))}
						subText="Total Active Products"
						icon={<IoMdRefresh onClick={loadData} title="Refresh" className="hover:rotate-180 transition-all duration-300" />}
					/>
				</div>
			</div>

			<div className="grid grid-cols-12 gap-6">
				{/* Best Seller - 4 Columns */}
				<div className="col-span-12 xl:col-span-4">
					<BestSeller bestSellers={dashboardData?.bestSellers || []} />
				</div>

				{/* Recent Transactions - 8 Columns */}
				<div className="col-span-12 xl:col-span-8">
					<RecentTransactions transactions={transactionsData} />
				</div>
			</div>
		</div>
	);
};

export default SalesDashboard;
