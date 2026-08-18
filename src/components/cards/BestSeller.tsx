const BestSeller = () => {
	const bestSellers = [
		{
			id: 1,
			image: "./images/products/product1.png",
			name: "Leovo 3rd Generation",
			price: "$4420",
			sales: "6547",
		},
		{
			id: 2,
			image: "./images/products/product1.png",
			name: "Smart Watch",
			price: "$1474",
			sales: "3474",
		},
		{
			id: 3,
			image: "./images/products/product1.png",
			name: "Smart Watch",
			price: "$1474",
			sales: "3474",
		},
	];

	return (
		<div className="bg-white p-5 rounded-lg border border-gray-200">
			{/* Header Section */}
			<div className="flex justify-between items-center pb-3 border-b border-gray-200">
				<h2 className="text-lg font-semibold text-gray-800">Best Seller</h2>
				<div className="border border-[#e6eaed] rounded-md py-[4px] px-[8px]">
					<a href="#" className="text-sm hover:underline text-[12px]">View All</a>
				</div>
			</div>

			{/* Product List */}
			<div className="mt-4 space-y-2">
				{bestSellers.map((product) => (
					<div key={product.id} className="flex items-center gap-4 border-b border-gray-100 pb-3 last:border-none">
						{/* Product Image */}
						<img src={product.image} alt={product.name} className="w-16 h-16  rounded-lg object-cover" />

						{/* Product Details & Price */}
						<div className="flex flex-col flex-1">
							<p className="font-bold text-[14px] text-[#212b36] hover:text-[#fe9f43] transition-all ease-in duration-300 cursor-pointer">{product.name}</p>
							<p className="text-[15px] text-[#646b72]">{product.price}</p>
						</div>

						{/* Sales & Price */}
						<div className="flex flex-col items-start text-[#212b36]">
							<p className="text-[15px] ">Sales</p>
							<p className="text-[15px]">{product.sales}</p>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default BestSeller;
