import { useState } from "react";
import { Link } from "react-router-dom";

const RecentProduct = ({
	title,
	headers,
	data,
}: {
	title: string;
	headers: string[];
	data: any[];
}) => {
	// @ts-ignore
	const [selectedRows, setSelectedRows] = useState<number[]>([]);

	// Handle row selection
	// @ts-ignore
	const toggleRowSelection = (id: number) => {
		setSelectedRows((prev) =>
			prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
		);
	};

	// Function to format date as "17 Jan 2023"
	// @ts-ignore
	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(date);
	};

	return (
		<div className="bg-[var(--ui-surface)] p-5 rounded-md shadow-sm border border-[var(--ui-border)] overflow-x-auto transition-colors duration-200">
			<div className="flex justify-between items-center pb-2">
				<h2 className="text-lg font-semibold text-[var(--ui-text)]">{title}</h2>
				<Link to={"/"} className="underline text-[var(--ui-text-muted)] text-[13px] hover:text-[var(--primary-color)] transition-all ease-in duration-300">View All</Link>
			</div>

			<div className="overflow-x-auto mt-2">
				<table className="w-full">
					<thead>
						<tr className="border-b border-[var(--ui-border)] text-[var(--ui-text-muted)] text-sm">
							{/* Checkbox column for selection */}
							<th className="p-3 text-left">
								#
							</th>

							{/* Dynamic table headers */}
							{headers.map((header, index) => (
								<th key={index} className="p-3 text-left">
									{header}
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{data.map((row, rowIndex) => (
							<tr key={rowIndex} className="border-b border-[var(--ui-border)] text-[var(--ui-text)] hover:bg-[var(--ui-surface-muted)] transition-colors">
								{/* Row selection checkbox */}
								<td className="p-3 text-left text-sm text-[var(--ui-text-muted)]">
									{rowIndex + 1}
								</td>

								{/* Product Column: Includes Image + Product Name */}
								<td className="p-3 flex items-center gap-3">
									<img src={row.image} alt={row.name} className="w-10 h-10 rounded-md object-cover bg-gray-50 border border-[var(--ui-border)]" />
									<span className="font-medium">{row.name}</span>
								</td>

								{/* Other Dynamic Columns */}
								<td className="p-3 font-semibold">৳{row.price}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
};

export default RecentProduct;
