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
		<div className="bg-[var(--ui-surface)] p-5 rounded-md shadow-sm border border-[var(--ui-border)] transition-colors duration-200">
			<div className="flex justify-between items-center pb-2">
				<h2 className="text-lg font-semibold text-[var(--ui-text)]">{title}</h2>
				<Link to={"/products"} className="underline text-[var(--ui-text-muted)] text-[13px] hover:text-[var(--primary-color)] transition-all ease-in duration-300">
					View All
				</Link>
			</div>

			<div className="overflow-x-auto mt-2">
				<table className="w-full min-w-[600px]">
					<thead>
						<tr className="border-b border-[var(--ui-border)] text-[var(--ui-text-muted)] text-sm">
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
							<tr key={row?.id || row?._id || rowIndex} className="border-b border-[var(--ui-border)] text-[var(--ui-text)] hover:bg-[var(--ui-surface-muted)] transition-colors">
								<td className="p-3 text-left text-sm text-[var(--ui-text-muted)]">
									{rowIndex + 1}
								</td>
								<td className="p-3 flex items-center gap-3">
									<img src={row?.featuredImage || ""} alt={row?.name || "product"} className="w-10 h-10 rounded-md object-cover bg-gray-50 border border-[var(--ui-border)]" />
									<span className="font-medium">{row?.name || "N/A"}</span>
								</td>
								<td className="p-3 text-sm text-[var(--ui-text-muted)]">{row?.mainCategoryName || row?.mainCategory?.name || "N/A"}</td>
								<td className="p-3 font-semibold">৳{row?.price || 0}</td>
								<td className="p-3 text-sm text-[var(--ui-text-muted)]">{formatPrettyDateWithTime(row?.createdAt)}</td>
								<td className="p-3 flex items-center gap-3">
									<Link to={`/product-details/${row?.id || row?._id || ""}`}
										className="inline-flex items-center justify-center hover:bg-[var(--primary-color-light)] border border-[var(--ui-border)] text-[var(--ui-text-muted)] hover:text-[var(--primary-color)] p-2 rounded-md cursor-pointer transition-colors">
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
