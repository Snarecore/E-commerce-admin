const TableSkeleton = () => {
	return (
		<div className="animate-pulse">
			<div className="w-full overflow-x-auto bg-[var(--ui-surface)] border border-[var(--ui-border)] rounded-md p-4">
				<table className="w-full text-left border-collapse min-w-[1000px]">
					<thead className="bg-[var(--ui-surface-muted)]">
						<tr className="border-b border-[var(--ui-border)]">
							<th className="p-3 w-10">
								<div className="h-4 w-4 bg-[var(--ui-border)] rounded"></div>
							</th>
							{[...Array(4)].map((_, i) => (
								<th key={i} className="p-3">
									<div className="h-4 w-24 bg-[var(--ui-border)] rounded"></div>
								</th>
							))}
						</tr>
					</thead>
					<tbody className="divide-y divide-[var(--ui-border)]">
						{[...Array(8)].map((_, rowIndex) => (
							<tr key={rowIndex} className="border-b border-[var(--ui-border)]">
								<td className="p-3">
									<div className="h-4 w-4 bg-[var(--ui-surface-muted)] rounded"></div>
								</td>
								<td className="p-3">
									<div className="flex items-center gap-2">
										<div className="h-8 w-8 bg-[var(--ui-surface-muted)] rounded"></div>
										<div className="h-4 w-24 bg-[var(--ui-surface-muted)] rounded"></div>
									</div>
								</td>
								<td className="p-3">
									<div className="h-4 w-28 bg-[var(--ui-surface-muted)] rounded"></div>
								</td>
								<td className="p-3">
									<div className="h-6 w-16 bg-[var(--ui-surface-muted)] rounded-md"></div>
								</td>
								<td className="p-3">
									<div className="flex gap-2">
										<div className="h-8 w-8 bg-[var(--ui-surface-muted)] rounded"></div>
										<div className="h-8 w-8 bg-[var(--ui-surface-muted)] rounded"></div>
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
};

export default TableSkeleton;