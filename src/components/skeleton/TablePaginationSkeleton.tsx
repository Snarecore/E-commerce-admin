const TablePaginationSkeleton = () => {
	return (
		<div className="flex flex-col items-end gap-4 bg-white px-4 py-1 sm:px-6 mt-3">
			<nav className="isolate inline-flex gap-2 rounded-md animate-pulse" aria-label="Pagination">
				<div className="w-6 h-6 bg-gray-200 rounded ring-1 ring-inset ring-gray-300"></div>

				{[...Array(5)].map((_, index) => (
					<div
						key={index}
						className="w-6 h-6 bg-gray-200 rounded ring-1 ring-inset ring-gray-300"
					></div>
				))}

				<div className="w-6 h-6 bg-gray-200 rounded ring-1 ring-inset ring-gray-300"></div>
			</nav>
		</div>
	);
};

export default TablePaginationSkeleton;