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
		<div className="bg-white p-5 rounded-lg border border-gray-200">
			{/* Header Section */}
			<div className="flex justify-between items-center pb-3 border-b border-gray-200">
				<h2 className="text-lg font-semibold text-gray-800">Best Seller</h2>
				<div className="border border-[#e6eaed] rounded-md py-[4px] px-[8px]">
					<Link to="/products" className="text-sm hover:underline text-[12px]">View All</Link>
				</div>
			</div>

			{/* Product List */}
			<div className="mt-4 space-y-2">
				{items.length === 0 ? (
					<div className="py-6 text-center text-sm text-gray-400">
						No best sellers recorded yet.
					</div>
				) : (
					items.map((product) => (
						<div key={product.id} className="flex items-center gap-4 border-b border-gray-100 pb-3 last:border-none">
							{/* Product Image */}
							<img
								src={product.image || "./images/products/product1.png"}
								alt={product.name}
								className="w-16 h-16 rounded-lg object-cover bg-gray-50 border border-gray-100"
								onError={(e) => {
									(e.currentTarget as HTMLImageElement).src = "./images/products/product1.png";
								}}
							/>

							{/* Product Details & Price */}
							<div className="flex flex-col flex-1 min-w-0">
								<p className="font-bold text-[14px] text-[#212b36] hover:text-[#fe9f43] transition-all ease-in duration-300 cursor-pointer truncate">
									{product.name}
								</p>
								<p className="text-[15px] text-[#646b72]">
									৳{Number(product.price || 0).toLocaleString()}
								</p>
							</div>

							{/* Sales & Quantity */}
							<div className="flex flex-col items-end text-[#212b36] shrink-0">
								<p className="text-[12px] text-gray-400">Sold</p>
								<p className="text-[15px] font-bold text-orange-600">{product.sales}</p>
							</div>
						</div>
					))
				)}
			</div>
		</div>
	);
};

export default BestSeller;
