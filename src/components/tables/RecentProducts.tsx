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
		<div className="bg-white p-4 rounded-lg shadow-md overflow-x-scroll cursor-pointer">
			<div className="flex justify-between p-2">
				<h2 className="text-lg font-semibold mb-4">{title}</h2>
				<Link to={"/"} className="underline text-[#212B36] text-[13px] hover:text-[#fe9f43] transition-all ease-in duration-300">View All</Link>
			</div>

			<div className="overflow-x-auto">
				<table className="w-full ">
					<thead>
						<tr className="">
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
							<tr key={rowIndex} className="border-y border-gray-200">
								{/* Row selection checkbox */}
								<td className="p-3 text-left">
									{rowIndex + 1}
								</td>

								{/* Product Column: Includes Image + Product Name */}
								<td className="p-3 flex items-center gap-3">
									<img src={row.image} alt={row.name} className="w-10 h-10 rounded-md" />
									<span>{row.name}</span>
								</td>

								{/* Other Dynamic Columns */}
								<td className="p-3">{row.price}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
};

export default RecentProduct;
