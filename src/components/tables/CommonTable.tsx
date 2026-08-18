import { useState } from "react";
import { Link } from "react-router-dom";

const CommonTable = ({
	title, 
	headers,
	data,
	actionIcons,
}: {
	title: string;
	headers: string[];
	data: any[];
	actionIcons?: { icon: React.ReactNode; onClick: (row: any) => void; color?: string; hoverColor?: string }[];
}) => {
	const [selectedRows, setSelectedRows] = useState<number[]>([]);

	const toggleRowSelection = (id: number) => {
		setSelectedRows((prev) =>
			prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
		);
	};

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(date);
	};

	return (
		<div className="bg-white p-4 rounded-lg shadow-md cursor-pointer">
			<div className="flex justify-between p-2">
				<h2 className="text-lg font-semibold mb-4">{title}</h2>
				<Link to={"/"} className="underline text-[#212B36] text-[13px] hover:text-[var(--color-primary)] transition-all ease-in duration-300">
					View All
				</Link>
			</div>

			<div className="overflow-x-auto">
				<table className="w-full min-w-[600px]">
					<thead>
						<tr>
							<th className="p-3 text-left">
								<input type="checkbox" />
							</th>
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
								<td className="p-3 text-left">
									<input
										type="checkbox"
										checked={selectedRows.includes(row.id)}
										onChange={() => toggleRowSelection(row.id)}
									/>
								</td>
								<td className="p-3 flex items-center gap-3">
									<img src={row.image} alt={row.name} className="w-10 h-10 rounded-md" />
									<span>{row.name}</span>
								</td>
								<td className="p-3">{row.sku}</td>
								<td className="p-3">{formatDate(row.manufacturedDate)}</td>
								<td className="p-3">{formatDate(row.expiredDate)}</td>
								<td className="p-3 flex items-center gap-3">
									{actionIcons &&
										actionIcons.map((action, index) => (
											<button
												key={index}
												className="border border-gray-200 w-10 h-10 rounded-xl flex items-center justify-center transition-all ease-in duration-300"
												style={{ color: action.color || "gray" }}
												onMouseEnter={(e) =>
													(e.currentTarget.style.backgroundColor = action.hoverColor || "rgba(0, 0, 0, 0.1)")
												}
												onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
												onClick={() => action.onClick(row)}
											>
												{action.icon}
											</button>
										))}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>

	);
};

export default CommonTable;
