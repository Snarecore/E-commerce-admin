import { Link } from "react-router-dom";

export interface BestSellerProduct {
	id: string | number;
	image?: string;
	name: string;
	price: string | number;
	sales: string | number;
}

interface BestSellerProps {
	bestSellers?: BestSellerProduct[];
}

const BestSeller = ({ bestSellers = [] }: BestSellerProps) => {
	const items = bestSellers.length > 0 ? bestSellers : [];

	return (
		<div className="bg-[var(--ui-surface)] p-5 rounded-md border border-[var(--ui-border)] shadow-sm transition-colors duration-200">
			{/* Header Section */}
			<div className="flex justify-between items-center pb-3 border-b border-[var(--ui-border)]">
				<h2 className="text-lg font-semibold text-[var(--ui-text)]">Best Seller</h2>
				<div className="border border-[var(--ui-border)] rounded-md py-[4px] px-[8px] hover:border-[var(--primary-color)] transition-colors">
					<Link to="/products" className="text-sm hover:underline text-[12px] text-[var(--ui-text-muted)] hover:text-[var(--primary-color)]">View All</Link>
				</div>
			</div>

			{/* Product List */}
			<div className="mt-4 space-y-2">
				{items.length === 0 ? (
					<div className="py-6 text-center text-sm text-[var(--ui-text-muted)] opacity-60">
						No best sellers recorded yet.
					</div>
				) : (
					items.map((product) => (
						<div key={product.id} className="flex items-center gap-4 border-b border-[var(--ui-border)] pb-3 last:border-none">
							{/* Product Image */}
							<img
								src={product.image || "./images/products/product1.png"}
								alt={product.name}
								className="w-16 h-16 rounded-lg object-cover bg-gray-50 border border-[var(--ui-border)]"
								onError={(e) => {
									(e.currentTarget as HTMLImageElement).src = "./images/products/product1.png";
								}}
							/>

							{/* Product Details & Price */}
							<div className="flex flex-col flex-1 min-w-0">
								<p className="font-bold text-[14px] text-[var(--ui-text)] hover:text-[var(--primary-color)] transition-all ease-in duration-300 cursor-pointer truncate">
									{product.name}
								</p>
								<p className="text-[15px] text-[var(--ui-text-muted)]">
									৳{Number(product.price || 0).toLocaleString()}
								</p>
							</div>

							{/* Sales & Quantity */}
							<div className="flex flex-col items-end text-[var(--ui-text)] shrink-0">
								<p className="text-[12px] text-[var(--ui-text-muted)]">Sold</p>
								<p className="text-[15px] font-bold text-[var(--primary-color)]">{product.sales}</p>
							</div>
						</div>
					))
				)}
			</div>
		</div>
	);
};

export default BestSeller;
