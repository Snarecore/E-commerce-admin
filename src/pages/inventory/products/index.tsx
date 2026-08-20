import ProductsTable from "./components/ProductTable";
import { useAPI } from "../../../hooks/useApi";
import apiConfig from "../../../config/api.json";
import { productQueryKey } from "../../../config/query-key";
import { useEffect, useState } from "react";
import PageHeader from "../../../components/cards/PageHeader";
import Button from "../../../components/buttons/ButtonStyleOne";
import { IoMdAddCircleOutline } from "react-icons/io";
import { Link } from "react-router-dom";

const Products = () => {
	const dataLimit = 10;
	const [currentPageNumber, setCurrentPageNumber] = useState(1);
	const [searchQuery, setSearchQuery] = useState("");
	const [tempSearch, setTempSearch] = useState("");
	useEffect(() => {
		const handler = setTimeout(() => {
			setSearchQuery(tempSearch);
			setCurrentPageNumber(1);
		}, 500); 

		return () => clearTimeout(handler);
	}, [tempSearch]);
	const [selectedFilters, setSelectedFilters] = useState<{
		mainCategoryId: { label: string; value: string } | null;
		vendorId: { label: string; value: string } | null;
	}>({
		mainCategoryId: null,
		vendorId: null
	});
	const { usePaginatedQuery } = useAPI();

	const getProductListApiUrl = () => {
		const queryParams = new URLSearchParams({
			page: currentPageNumber.toString(),
			limit: dataLimit.toString(),
			...(searchQuery && { searchKeyword: searchQuery }),
			...(selectedFilters.mainCategoryId?.value && { mainCategoryId: selectedFilters.mainCategoryId.value }),
			...(selectedFilters.vendorId?.value && { vendorId: selectedFilters.vendorId.value })
		});
	
		return `${apiConfig.inventory.productListUrl}?${queryParams.toString()}`;
	};
	

	const handlePagination = (paginationData: { selected: number }) => {
		const selectedPage = paginationData.selected + 1;
		setCurrentPageNumber(selectedPage);
	};

	const { data: dataList, isLoading, pageCount, isFetching, refetch: fetchProductList } = usePaginatedQuery({
		queryKey: [
			productQueryKey,
			searchQuery,
			selectedFilters.mainCategoryId?.value || "",
			selectedFilters.vendorId?.value || "",
			currentPageNumber.toString()
		],
		url: getProductListApiUrl()
	});

	useEffect(() => {
		fetchProductList();
	}, [currentPageNumber, searchQuery, selectedFilters]);

	return (
		<>
			<div className="flex flex-col gap-8">
				<div className="flex items-center justify-between flex-wrap">
					<PageHeader
						headerTitle="Product List"
						headerDescription="Manage your products"
					/>
					<Link to="/create-product">
						<Button
							label="Add New Product"
							onClick={() => {}}
							color="var(--color-primary)"
							hoverColor="var(--color-primary-hover)"
							icon={<IoMdAddCircleOutline size={18} />}
						/>
					</Link>
				</div>
				<div className="grid grid-cols-12 gap-12">
					<div className="col-span-12 xl:col-span-12">
						<ProductsTable
							// @ts-ignore
							dataList={dataList}
							fetchProductList={fetchProductList}
							pageCount={pageCount}
							currentPageNumber={currentPageNumber}
							setCurrentPageNumber={setCurrentPageNumber}
							handlePagination={handlePagination}
							isLoading={isLoading}
							isFetching={isFetching}
							searchQuery={tempSearch}
							setSearchQuery={setTempSearch}
							selectedFilters={selectedFilters}
							setSelectedFilters={setSelectedFilters}
						/>
					</div>
				</div>
			</div>
		</>
	);
};

export default Products;
