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
		<div className="bg-[var(--ui-surface)] p-5 rounded-md border border-[var(--ui-border)] shadow-sm transition-colors duration-200">
			{/* Header Section */}
			<div className="flex justify-between items-center pb-3 border-b border-[var(--ui-border)]">
				<h2 className="text-lg font-semibold text-[var(--ui-text)]">
					Recent Transactions
				</h2>
				<div className="border border-[var(--ui-border)] rounded-md py-[4px] px-[8px] hover:border-[var(--primary-color)] transition-colors">
					<Link to="/orders" className="text-sm hover:underline text-[12px] text-[var(--ui-text-muted)] hover:text-[var(--primary-color)]">
						View All
					</Link>
				</div>
			</div>

			{/* Table Section */}
			<div className="mt-4 overflow-x-auto">
				<table className="w-full text-left border-collapse min-w-[600px]">
					{/* Table Headers */}
					<thead>
						<tr className="text-[14px] text-[var(--ui-text-muted)] font-medium bg-[var(--ui-surface-muted)]">
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
								<td colSpan={5} className="p-6 text-center text-sm text-[var(--ui-text-muted)] opacity-60">
									No recent transactions recorded yet.
								</td>
							</tr>
						) : (
							transactions.map((transaction, index) => (
								<tr
									key={transaction.id}
									className="border-b border-[var(--ui-border)] last:border-none text-[var(--ui-text)] hover:bg-[var(--ui-surface-muted)] transition-colors"
								>
									{/* Serial Number */}
									<td className="p-3 text-sm text-[var(--ui-text-muted)]">{index + 1}</td>

									{/* Order Details */}
									<td className="p-3 flex items-center gap-3">
										<img
											src={transaction.image || "./images/products/product1.png"}
											alt={transaction.name}
											className="w-10 h-10 rounded-md object-cover bg-gray-50 border border-[var(--ui-border)]"
											onError={(e) => {
												(e.currentTarget as HTMLImageElement).src = "./images/products/product1.png";
											}}
										/>
										<div>
											<p className="text-[14px] text-[var(--ui-text)] font-bold hover:text-[var(--primary-color)] transition-all ease-in duration-300 cursor-pointer">
												{transaction.name}
											</p>
											<p className="text-[14px] text-[var(--ui-text-muted)] flex items-center">
												<GoClock className="text-[var(--ui-text-muted)] text-[14px] mr-1" />
												{transaction.time}
											</p>
										</div>
									</td>

									{/* Payment Method */}
									<td className="p-3 text-sm text-[var(--ui-text-muted)]">
										<div className="flex flex-col">
											<p className="text-[14px] text-[var(--ui-text)] font-medium">
												{transaction.payment}
											</p>
											<p className="text-[14px] text-[var(--primary-color)]">
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
