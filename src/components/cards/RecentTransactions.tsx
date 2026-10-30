import { GoClock } from "react-icons/go";
import { LuDot } from "react-icons/lu";
import { Link } from "react-router-dom";

export interface Transaction {
	id: string | number;
	image?: string;
	name: string;
	time: string;
	payment: string;
	serialNumber: string;
	status: string;
	statusBg: string;
	amount: string;
}

interface RecentTransactionsProps {
	transactions?: Transaction[];
}

const RecentTransactions = ({ transactions = [] }: RecentTransactionsProps) => {
	return (
		<div className="bg-white p-5 rounded-lg border border-gray-200">
			{/* Header Section */}
			<div className="flex justify-between items-center pb-3 border-b border-gray-200">
				<h2 className="text-lg font-semibold text-gray-800">
					Recent Transactions
				</h2>
				<div className="border border-[#e6eaed] rounded-md py-[4px] px-[8px]">
					<Link to="/orders" className="text-sm hover:underline text-[12px]">
						View All
					</Link>
				</div>
			</div>

			{/* Table Section */}
			<div className="mt-4 overflow-x-auto">
				<table className="w-full text-left border-collapse min-w-[600px]">
					{/* Table Headers */}
					<thead>
						<tr className="text-[14px] text-[#1b2850] font-medium bg-[#F9FAFB]">
							<th className="p-3">#</th>
							<th className="p-3">Order Details</th>
							<th className="p-3">Payment</th>
							<th className="p-3">Status</th>
							<th className="p-3">Amount</th>
						</tr>
					</thead>

					{/* Table Body */}
					<tbody>
						{transactions.length === 0 ? (
							<tr>
								<td colSpan={5} className="p-6 text-center text-sm text-gray-400">
									No recent transactions recorded yet.
								</td>
							</tr>
						) : (
							transactions.map((transaction, index) => (
								<tr
									key={transaction.id}
									className="border-b border-gray-100 last:border-none text-gray-700"
								>
									{/* Serial Number */}
									<td className="p-3 text-sm text-gray-500">{index + 1}</td>

									{/* Order Details */}
									<td className="p-3 flex items-center gap-3">
										<img
											src={transaction.image || "./images/products/product1.png"}
											alt={transaction.name}
											className="w-10 h-10 rounded-md object-cover bg-gray-50"
											onError={(e) => {
												(e.currentTarget as HTMLImageElement).src = "./images/products/product1.png";
											}}
										/>
										<div>
											<p className="text-[14px] text-[#212b36] font-bold hover:text-[#fe9f43] transition-all ease-in duration-300 cursor-pointer">
												{transaction.name}
											</p>
											<p className="text-[14px] text-gray-500 flex items-center">
												<GoClock className="text-[#646B72] text-[14px] mr-1" />
												{transaction.time}
											</p>
										</div>
									</td>

									{/* Payment Method */}
									<td className="p-3 text-sm text-gray-500">
										<div className="flex flex-col">
											<p className="text-[14px] text-[#092c4c] font-medium">
												{transaction.payment}
											</p>
											<p className="text-[14px] text-[#3677F1]">
												{transaction.serialNumber}
											</p>
										</div>
									</td>

									{/* Status with Dynamic Colored Labels */}
									<td className="p-3">
										<span
											className="px-2 py-0.5 rounded-md text-[12px] font-semibold text-white flex items-center transition-all ease-in-out duration-300 w-fit"
											style={{ backgroundColor: transaction.statusBg || '#3EB780' }}
										>
											<LuDot className="text-[14px]" />
											{transaction.status}
										</span>
									</td>

									{/* Amount */}
									<td className="p-3 text-[16px] text-black font-bold">
										{transaction.amount}
									</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
};

export default RecentTransactions;
