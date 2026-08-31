import { FiEye } from "react-icons/fi";
import { Link } from "react-router-dom";
import { formatPrettyDateWithTime } from "../../utils/date-utils";

const ProductListTable = ({
	title,
	headers,
	data = [],
}: {
	title: string;
	headers: string[];
	data: any[];
}) => {
	const safeData = Array.isArray(data) ? data.filter(Boolean) : [];

	return (
		<div className="bg-white p-4 rounded-lg shadow-md">
			<div className="flex justify-between p-2">
				<h2 className="text-lg font-semibold mb-4">{title}</h2>
				<Link to={"/products"} className="underline text-[#212B36] text-[13px] hover:text-[#fe9f43] transition-all ease-in duration-300">
					View All
				</Link>
			</div>

			<div className="overflow-x-auto">
				<table className="w-full min-w-[600px]">
					<thead>
						<tr>
							<th className="p-3 text-left">
								Sl
							</th>
							{headers.map((header, index) => (
								<th key={index} className="p-3 text-left">
									{header}
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{safeData.map((row, rowIndex) => (
							<tr key={row?.id || row?._id || rowIndex} className="border-y border-gray-200">
								<td className="p-3 text-left">
									{rowIndex + 1}
								</td>
								<td className="p-3 flex items-center gap-3">
									<img src={row?.featuredImage || ""} alt={row?.name || "product"} className="w-10 h-10 rounded-md object-cover" />
									<span>{row?.name || "N/A"}</span>
								</td>
								<td className="p-3">{row?.mainCategoryName || row?.mainCategory?.name || "N/A"}</td>
								<td className="p-3">${row?.price || 0}</td>
								<td className="p-3">{formatPrettyDateWithTime(row?.createdAt)}</td>
								<td className="p-3 flex items-center gap-3">
									<Link to={`/product-details/${row?.id || row?._id || ""}`}
										className="inline-flex items-center justify-center hover:bg-gray-200 border border-[#e6eaed] hover:text-[var(--color-primary)] p-2 rounded-md cursor-pointer">
										<FiEye />
									</Link>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
};

export default ProductListTable;
