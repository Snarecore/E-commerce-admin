import { ChangeEvent, useEffect, useState } from "react";
import { FiEye } from "react-icons/fi";
import { FaEdit } from "react-icons/fa";
import { FiTrash2 } from "react-icons/fi";
import { FaEllipsisVertical } from "react-icons/fa6";
import DeleteModal from "../../../../components/modals/DeleteModal";
import Search from "../../../../components/table-components/Search";
import DropdownFilter from "../../../../components/table-components/DropdownFilter";
import RefreshButton from "../../../../components/table-components/RefreshButton";
import { TiDelete } from "react-icons/ti";
import { Link } from "react-router-dom";
import { useAPI } from "../../../../hooks/useApi";
import TableSkeleton from "../../../../components/skeleton/TableSkeleton";
import apiConfig from "../../../../config/api.json";
import { productQueryKey } from "../../../../config/query-key";
import { useMemo } from "react";
import EmptyState from "../../../../components/empty-state/EmptyState";
import Pagination from "../../../../components/pagination";

interface ProductDataProps {
	id: string;
	name: string;
	featuredImage: string;
	sku: string;
	slug: string;
	description: string;
	summary: string;
	videoUrl: string;
	mainCategoryName: string;
	firstCategoryName: string;
	secondCategoryName: string;
	price: number;
	cost: number;
	discount: number;
	discountType: string;
	vendorName: string;
	isProductSectionOne: string;
	isProductSectionTwo: string;
	isProductSectionThree: string;
	isProductSectionFour: string;
	isProductSectionFive: string;
	isProductSectionSix: string;
	isApprove: string;
	status: string;
	quantity: number;
	quantityAlert: number;
}

interface ProductTableProps {
	dataList: {
		data: ProductDataProps[];
		total: number;
		page: number;
		limit: number;
	};
	fetchProductList: () => void;
	isLoading?: boolean;
	pageCount: number;
	currentPageNumber: number;
	setCurrentPageNumber: React.Dispatch<React.SetStateAction<number>>;
	handlePagination: (paginationData: { selected: number }) => void;
	isFetching?: boolean;
	searchQuery: string;
	setSearchQuery: (query: string) => void;
	selectedFilters: {
		mainCategoryId: { label: string; value: string } | null;
		vendorId: { label: string; value: string } | null;
		isApprove: { label: string; value: string } | null;
	};
	setSelectedFilters: React.Dispatch<React.SetStateAction<{
		mainCategoryId: { label: string; value: string } | null;
		vendorId: { label: string; value: string } | null;
		isApprove: { label: string; value: string } | null;
	}>>;
}

const initialFieldValues = {
	isProductSectionOne: false,
	isProductSectionTwo: false,
	isProductSectionThree: false,
	isProductSectionFour: false,
	isProductSectionFive: false,
	isProductSectionSix: false,
	isApprove: false,
	status: false,
	quantity: 0,
	quantityAlert: 0
};

const ProductsTable = ({ dataList, fetchProductList, pageCount, currentPageNumber, setCurrentPageNumber, handlePagination, isLoading, isFetching, searchQuery, setSearchQuery, selectedFilters, setSelectedFilters }: ProductTableProps) => {
	const [fieldValues, setFieldValues] = useState(initialFieldValues);
	const { handleDeleteAPI, handleApiMutation, patchMutation, fetchData } = useAPI();
	const apiUrl = apiConfig.inventory.productUrl;
	const statusApiUrl = apiConfig.inventory.productStatusUrl;
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [selectedProduct, setSelectedProduct] = useState<ProductDataProps | null>(null);
	const [isSelectionModalOpen, setIsSelectionModalOpen] = useState(false);
	// @ts-ignore
	const [isProductSectionOne, setIsProductSectionOne] = useState(selectedProduct?.isProductSectionOne);
	// @ts-ignore
	const [isProductSectionTwo, setIsProductSectionTwo] = useState(selectedProduct?.isProductSectionTwo);
	// @ts-ignore
	const [isProductSectionThree, setIsProductSectionThree] = useState(selectedProduct?.isProductSectionThree);
	// @ts-ignore
	const [isProductSectionFour, setIsProductSectionFour] = useState(selectedProduct?.isProductSectionFour);
	// @ts-ignore
	const [isProductSectionFive, setIsProductSectionFive] = useState(selectedProduct?.isProductSectionFive);
	// @ts-ignore
	const [isProductSectionSix, setIsProductSectionSix] = useState(selectedProduct?.isProductSectionSix);

	// Search and Filter by Category, Vendor
	const [openDropdown, setOpenDropdown] = useState<string | null>(null);

	const [mainCategories, setMainCategories] = useState<{ label: string, value: string }[]>([]);
	const mainCategoryApiUrl = apiConfig.site.mainCategoryUrl;
	const fetchMainCategoryData = async () => {
		try {
			const result = await fetchData({ apiUrl: mainCategoryApiUrl });
			setMainCategories(result.mainCategory.map((cat: any) => ({ label: cat.name, value: cat.id })));
		} catch (error) {
			console.error("Failed to fetch main categories:", error);
		}
	};

	useEffect(() => {
		fetchMainCategoryData();
	}, []);

	const dropdownOptions = useMemo(() => {
		return {
			mainCategoryId: mainCategories
		};
	}, [mainCategories]);

	const handleRefreshButton = () => {
		setSelectedFilters({
			mainCategoryId: null,
			vendorId: null,
			isApprove: null,
		});
		setSearchQuery("");
		setCurrentPageNumber(1);
		setOpenDropdown(null);
	};
	// Search and Filter by Category, Vendor

	const tableHeaders = [
		{ key: "sl", label: "Sl" },
		{ key: "name", label: "Product Name" },
		{ key: "sku", label: "SKU" },
		{ key: "price", label: "Price" },
		{ key: "stock", label: "Stock" },
		{ key: "status", label: "Status" },
		{ key: "action", label: "Action" },
	];

	const openDeleteModal = (data: ProductDataProps) => {
		setSelectedProduct(data);
		setIsDeleteModalOpen(true);
	};

	const closeDeleteModal = () => {
		setIsDeleteModalOpen(false);
		setSelectedProduct(null);
	};

	const openSelectionModal = (product: ProductDataProps) => {
		setSelectedProduct(product);
		setFieldValues({
			isProductSectionOne: String(product.isProductSectionOne) == "true",
			isProductSectionTwo: String(product.isProductSectionTwo) == "true",
			isProductSectionThree: String(product.isProductSectionThree) == "true",
			isProductSectionFour: String(product.isProductSectionFour) == "true",
			isProductSectionFive: String(product.isProductSectionFive) == "true",
			isProductSectionSix: String(product.isProductSectionSix) == "true",
			isApprove: String(product.isApprove) === "true",
			status: String(product.status) === "true",
			quantity: product.quantity !== undefined ? Number(product.quantity) : 0,
			quantityAlert: product.quantityAlert !== undefined ? Number(product.quantityAlert) : 0
		});
		setIsSelectionModalOpen(true);
	};

	const handleDelete = async () => {
		if (!selectedProduct) return;

		const apiResponse = await handleDeleteAPI({
			url: `${apiUrl}/${selectedProduct.id}`,
			showSuccessMessage: true
		});

		if (apiResponse) {
			fetchProductList();
			closeDeleteModal();
		}
	};

	const handleCloseModal = () => {
		setSelectedProduct(null);
		// setIsProductSectionOne(false);
		// setIsProductSectionTwo(false);
		// setIsProductSectionThree(false);
		// setIsProductSectionFour(false);
		// setIsProductSectionFive(false);
		// setIsProductSectionSix(false);
		// setStatus(false);
		setIsSelectionModalOpen(false);
	};

	const handleSwitchChange = (event: ChangeEvent<HTMLInputElement>) => {
		const { name, checked, type, value } = event.target;
		setFieldValues((prevState) => ({
			...prevState,
			[name]: type === "checkbox" ? checked : Number(value)
		}));
	};

	const handleSave = async () => {
		try {
			if (!selectedProduct) return;

			const result = await handleApiMutation({
				// @ts-ignore
				mutation: patchMutation,
				url: `${statusApiUrl}/${selectedProduct.id}`,
				body: fieldValues,
				invalidateQueryKey: [productQueryKey],
				showSuccessMessage: true,
				showErrorMessage: true
			});

			if (result?.success) {
				fetchProductList();
				handleCloseModal();
			}
		} catch (error) {
			console.error('Error updating product:', error);
		}
	};

	const handleToggleProductStatus = async (product: ProductDataProps) => {
		try {
			const currentStatus = String(product.status) === "true";
			const newStatus = !currentStatus;

			const result = await handleApiMutation({
				// @ts-ignore
				mutation: patchMutation,
				url: `${statusApiUrl}/${product.id}`,
				body: { status: newStatus },
				invalidateQueryKey: [productQueryKey],
				showSuccessMessage: true,
				showErrorMessage: true
			});

			if (result?.success) {
				fetchProductList();
			}
		} catch (error) {
			console.error('Error toggling product status:', error);
		}
	};

	if (isLoading) return <TableSkeleton />;

	return (
		<div className="p-6 bg-white rounded-lg border border-gray-200">
			<div className="flex justify-between flex-wrap space-y-4">
				<Search
					searchQuery={searchQuery}
					onSearchChange={(value) => {
						setSearchQuery(value);
						setCurrentPageNumber(1);
					}}
				/>
				<div className="flex flex-wrap gap-2">
					{(Object.entries(dropdownOptions) as [keyof typeof selectedFilters, any][]).map(([key, options]) => (
						<DropdownFilter
						key={key}
						title={
							key === "mainCategoryId"
								? "Category"
								: key === "vendorId"
								? "Vendor"
								: key === "isApprove"
								? "Approval"
								: key
						}
						options={options}
						selectedOption={selectedFilters[key]}
						isOpen={openDropdown === key}
						onToggle={() => setOpenDropdown(openDropdown === key ? null : key)}
						onSelect={(selected) => {
							setSelectedFilters(prev => ({ ...prev, [key]: selected }));
							setCurrentPageNumber(1);
							setOpenDropdown(null);
						}}
					/>
					
					))}
					<RefreshButton onClick={handleRefreshButton} />
				</div>
			</div>
			<div className="mt-4 w-full overflow-x-auto">
				<table className="w-full text-left border-collapse min-w-[1300px] cursor-pointer">
					<thead className="bg-gray-100">
						<tr className="text-[14px] font-semibold border-b border-gray-200">
							{tableHeaders.map(({ key, label }) => (
								<th key={key} className="px-6 py-4 text-left text-[#000000e0]">
									<span>{label}</span>
								</th>
							))}
						</tr>
					</thead>


					<tbody className="bg-white divide-y divide-gray-200 rounded-lg">
						{(() => {
							const productsList = Array.isArray(dataList) ? dataList : (dataList?.data || []);
							return productsList.length > 0 ? (
								productsList.map((data, index) => (
								<tr
									key={data.id}
									className="border-b border-gray-100 text-gray-700 hover:bg-gray-50 transition duration-300"
								>
									<td className="px-6 py-4 font-medium text-gray-800">
										{index + 1}
									</td>

									<td className="px-6 py-4 flex items-center gap-2">
										<img
											src={data.featuredImage}
											alt={data.name}
											className="w-10 h-10 rounded-md shadow-sm border border-gray-200"
										/>
										<span>
											{data.name}
										</span>
									</td>

									<td className="px-6 py-4">{data.sku}</td>
									<td className="px-6 py-4">{data.price}</td>

									<td className="px-6 py-4">
										{(() => {
											let totalQty = Number(data.quantity) || 0;
											// @ts-ignore
											if (data.sizeStock && typeof data.sizeStock === 'object') {
												// @ts-ignore
												totalQty = Object.values(data.sizeStock).reduce((sum, q) => sum + (Number(q) || 0), 0);
											}
											return totalQty === 0 ? (
												<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">
													Out of Stock
												</span>
											) : totalQty <= Number(data.quantityAlert || 5) ? (
												<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
													Low Stock ({totalQty})
												</span>
											) : (
												<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
													In Stock ({totalQty})
												</span>
											);
										})()}
									</td>

									<td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
										<div className="flex items-center gap-2">
											<label className="relative inline-flex items-center cursor-pointer">
												<input
													type="checkbox"
													checked={String(data.status) === "true"}
													onChange={() => handleToggleProductStatus(data)}
													className="sr-only peer"
												/>
												<div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-[var(--color-primary)] relative transition-all duration-200">
													<div className={`absolute top-[2px] left-[2px] w-4 h-4 bg-white rounded-full transition-transform duration-200 ${String(data.status) === "true" ? "translate-x-4" : "translate-x-0"}`} />
												</div>
											</label>
											<span className={`text-xs font-semibold ${String(data.status) === "true" ? "text-green-600" : "text-gray-400"}`}>
												{String(data.status) === "true" ? "Active" : "Inactive"}
											</span>
										</div>
									</td>

									<td className="px-6 py-4">
										<div className="flex items-center gap-2">
											<Link to={`/product-details/${data.id}`}
												className="inline-flex items-center justify-center hover:bg-gray-200 border border-[#e6eaed] hover:text-[var(--color-primary)] p-2 rounded-md cursor-pointer">
												<FiEye />
											</Link>
											<Link
												to="/edit-product"
												state={{ editData: data }}
												className="inline-flex items-center justify-center hover:bg-gray-200 border border-[#e6eaed] hover:text-[var(--color-primary)] p-2 rounded-md cursor-pointer"
											>
												<FaEdit />
											</Link>
											<button
												onClick={() => openDeleteModal(data)}
												className="inline-flex items-center justify-center hover:bg-gray-200 border border-[#e6eaed] hover:text-[var(--color-primary)] p-2 rounded-md cursor-pointer"
											>
												<FiTrash2 />
											</button>
											<button onClick={() => openSelectionModal(data)} className="inline-flex items-center justify-center hover:bg-gray-200 border border-[#e6eaed] hover:text-[var(--color-primary)] p-2 rounded-md cursor-pointer">
												<FaEllipsisVertical />
											</button>
										</div>
									</td>
								</tr>
							))
						) : (
							<tr>
								<td colSpan={tableHeaders.length} className="px-6 py-4 text-center italic">
									<EmptyState title="No matching products. Try adjusting your filters." />
								</td>
							</tr>
						);
						})()}
					</tbody>
				</table>
			</div>

			{
				selectedProduct && isSelectionModalOpen && (
					<div className="fixed inset-0 flex items-center justify-center bg-opacity-50 bg-[#000000b6] z-[60] top-0 right-0 left-0 bottom-0 p-2">
						<div className="bg-white rounded-lg shadow-lg w-[400px] p-6">
							<div className="flex justify-between items-center pb-6">
								<p className="text-lg font-semibold">Product Status Settings</p>
								<TiDelete
									className="text-3xl cursor-pointer text-red-500 hover:text-red-600"
									onClick={handleCloseModal}
								/>
							</div>

							<div className="flex justify-between items-center mb-4 bg-[#fff2e6] p-3 rounded-md">
								<span className="text-sm font-medium text-gray-700">Is Product Section One</span>
								<label className="relative inline-flex items-center cursor-pointer">
									<input
										name="isProductSectionOne"
										type="checkbox"
										checked={fieldValues.isProductSectionOne}
										onChange={handleSwitchChange}
										className="sr-only peer"
									/>
									<div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-[var(--color-primary)]">
										<div className={`absolute top-[2px] left-[2px] w-4 h-4 bg-white rounded-full transition-all ${fieldValues.isProductSectionOne ? "translate-x-5" : ""}`} />
									</div>
								</label>
							</div>


							<div className="flex justify-between items-center mb-4 bg-[#fff2e6] p-3 rounded-md">
								<span className="text-sm font-medium text-gray-700">Is Product Section Two</span>
								<label className="relative inline-flex items-center cursor-pointer">
									<input
										name="isProductSectionTwo"
										type="checkbox"
										checked={fieldValues.isProductSectionTwo}
										onChange={handleSwitchChange}
										className="sr-only peer"
									/>
									<div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-[var(--color-primary)] relative">
										<div
											className={`absolute top-[2px] left-[2px] w-4 h-4 bg-white rounded-full transition-transform duration-200 ${fieldValues.isProductSectionTwo ? "translate-x-5" : "translate-x-0"
												}`}
										/>
									</div>
								</label>
							</div>


							<div className="flex justify-between items-center mb-4 bg-[#fff2e6] p-3 rounded-md">
								<span className="text-sm font-medium text-gray-700">Is Product Section Three</span>
								<label className="relative inline-flex items-center cursor-pointer">
									<input
										name="isProductSectionThree"
										type="checkbox"
										checked={fieldValues.isProductSectionThree}
										onChange={handleSwitchChange}
										className="sr-only peer"
									/>
									<div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-[var(--color-primary)] relative">
										<div className={`absolute top-[2px] left-[2px] w-4 h-4 bg-white rounded-full transition-transform duration-200 ${fieldValues.isProductSectionThree ? "translate-x-5" : "translate-x-0"
											}`} />
									</div>
								</label>
							</div>

							<div className="flex justify-between items-center mb-4 bg-[#fff2e6] p-3 rounded-md">
								<span className="text-sm font-medium text-gray-700">Is Product Section Four</span>
								<label className="relative inline-flex items-center cursor-pointer">
									<input
										name="isProductSectionFour"
										type="checkbox"
										checked={fieldValues.isProductSectionFour}
										onChange={handleSwitchChange}
										className="sr-only peer"
									/>
									<div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-[var(--color-primary)] relative">
										<div className={`absolute top-[2px] left-[2px] w-4 h-4 bg-white rounded-full transition-transform duration-200 ${fieldValues.isProductSectionFour ? "translate-x-5" : "translate-x-0"
											}`} />
									</div>
								</label>
							</div>

							<div className="flex justify-between items-center mb-4 bg-[#fff2e6] p-3 rounded-md">
								<span className="text-sm font-medium text-gray-700">Is Product Section Five</span>
								<label className="relative inline-flex items-center cursor-pointer">
									<input
										name="isProductSectionFive"
										type="checkbox"
										checked={fieldValues.isProductSectionFive}
										onChange={handleSwitchChange}
										className="sr-only peer"
									/>
									<div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-[var(--color-primary)] relative">
										<div className={`absolute top-[2px] left-[2px] w-4 h-4 bg-white rounded-full transition-transform duration-200 ${fieldValues.isProductSectionFive ? "translate-x-5" : "translate-x-0"
											}`} />
									</div>
								</label>
							</div>

							<div className="flex justify-between items-center mb-4 bg-[#fff2e6] p-3 rounded-md">
								<span className="text-sm font-medium text-gray-700">Is Product Section Six</span>
								<label className="relative inline-flex items-center cursor-pointer">
									<input
										name="isProductSectionSix"
										type="checkbox"
										checked={fieldValues.isProductSectionSix}
										onChange={handleSwitchChange}
										className="sr-only peer"
									/>
									<div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-[var(--color-primary)] relative">
										<div className={`absolute top-[2px] left-[2px] w-4 h-4 bg-white rounded-full transition-transform duration-200 ${fieldValues.isProductSectionSix ? "translate-x-5" : "translate-x-0"
											}`} />
									</div>
								</label>
							</div>



							<div className="flex flex-col gap-1 mb-4 bg-gray-50 border border-gray-200 p-3 rounded-md">
								<span className="text-sm font-semibold text-gray-700">Stock Settings</span>
								<div className="grid grid-cols-2 gap-2 mt-2">
									<div>
										<label className="text-[12px] font-medium text-gray-500 block mb-1">Quantity</label>
										<input
											name="quantity"
											type="number"
											value={fieldValues.quantity}
											onChange={handleSwitchChange}
											className="w-full h-9 px-2 text-sm border border-gray-300 rounded focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] focus:outline-none"
										/>
									</div>
									<div>
										<label className="text-[12px] font-medium text-gray-500 block mb-1">Qty Alert</label>
										<input
											name="quantityAlert"
											type="number"
											value={fieldValues.quantityAlert}
											onChange={handleSwitchChange}
											className="w-full h-9 px-2 text-sm border border-gray-300 rounded focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] focus:outline-none"
										/>
									</div>
								</div>
							</div>

							<div className="flex justify-between items-center mb-4 bg-[#fff2e6] p-3 rounded-md">
								<span className="text-sm font-medium text-gray-700">Status</span>
								<label className="relative inline-flex items-center cursor-pointer">
									<input
										name="status"
										type="checkbox"
										checked={fieldValues.status}
										onChange={handleSwitchChange}
										className="sr-only peer"
									/>
									<div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-[var(--color-primary)] relative">
										<div className={`absolute top-[2px] left-[2px] w-4 h-4 bg-white rounded-full transition-transform duration-200 ${fieldValues.status ? "translate-x-5" : "translate-x-0"
											}`} />
									</div>
								</label>
							</div>

							<div className="flex justify-end gap-2">
								<button
									onClick={handleCloseModal}
									className="px-4 h-8 bg-gray-500 text-white text-[14px] cursor-pointer border border-gray-300 rounded-md hover:bg-gray-700"
								>
									Cancel
								</button>
								<button
									onClick={handleSave}
									className="px-4 h-8 bg-[var(--color-primary)] text-white cursor-pointer rounded-md hover:bg-[var(--color-primary-hover)]"
								>
									Save
								</button>
							</div>
						</div>
					</div>
				)
			}

			{/* Delete Modal */}
			{selectedProduct && (
				<DeleteModal
					isOpen={isDeleteModalOpen}
					title="Confirm Delete"
					message={`Are you sure you want to delete?`}
					onClose={closeDeleteModal}
					onDelete={handleDelete}
				/>
			)}
			{pageCount > 1 && (
				<div className="flex justify-center">
					<Pagination
						pageCount={pageCount}
						currentPageNumber={currentPageNumber}
						handlePagination={handlePagination}
					/>
				</div>
			)}
		</div>
	);
};

export default ProductsTable;
