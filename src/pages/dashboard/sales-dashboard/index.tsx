import BestSeller from "../../../components/cards/BestSeller";
import RecentTransactions from "../../../components/cards/RecentTransactions";
import { IoMdRefresh } from "react-icons/io";
import WeeklyEarningCard from "../../../components/cards/WeeklyEarningCard";
import WelcomeCard from "../../../components/cards/welcomeCard/WelcomeCard";
import SalesCard from "../../../components/cards/SalesCard";

const SalesDashboard = () => {
	const transactionsData = [
		{
			id: 1,
			image: "./images/products/product1.png",
			name: "Lobar Handy",
			time: "15 Mins",
			payment: "PayPal",
			serialNumber: "#416645453773",
			status: "Success",
			statusBg: "#3EB780",
			amount: "$1,099.00",
		},
		{
			id: 2,
			image: "./images/products/product1.png",
			name: "Smart Watch",
			time: "5 hours ago",
			payment: "Credit Card",
			serialNumber: "#416645453774",
			status: "Cancelled",
			statusBg: "#FF0000",
			amount: "$600.55",
		},
		{
			id: 3,
			image: "./images/products/product1.png",
			name: "Gaming Mouse",
			time: "1 day ago",
			payment: "PayPal",
			serialNumber: "#416645453775",
			status: "Success",
			statusBg: "#3EB780",
			amount: "$1,099.00",
		},
	];

	return (
		<div className="flex flex-col gap-8">
			<WelcomeCard />

			<div className="grid grid-cols-12 gap-8">
				{/* Weekly Earnings */}
				<div className="col-span-12 lg:col-span-12 xl:col-span-6">
					<WeeklyEarningCard />
				</div>

				{/* Sales Cards */}
				<div className="col-span-12 sm:col-span-12 md:col-span-6 xl:col-span-3">
					<SalesCard
						bgColor="bg-[#FE9F43]"
						imageSrc="./images/total-sales.svg"
						mainText="10,000+"
						subText="No of Total Sales"
						icon={<IoMdRefresh />}
					/>
				</div>

				<div className="col-span-12 sm:col-span-12 md:col-span-6 xl:col-span-3">
					<SalesCard
						bgColor="bg-[#092C4C]"
						imageSrc="./images/total-sales.svg"
						mainText="10,000+"
						subText="No of Total Sales"
						icon={<IoMdRefresh />}
					/>
				</div>
			</div>

			<div className="grid grid-cols-12 gap-6">
				{/* Best Seller - 2 Columns */}
				<div className="col-span-12 xl:col-span-4">
					<BestSeller />
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
