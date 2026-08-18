import PageHeader from "../../../components/cards/PageHeader";
import ShopPageCmsForm from "./components/ShopPageCms";

const ShopPageCMS = () => {
	return (
		<>
			<div className="flex flex-col gap-8">
				<div className="flex items-center justify-between flex-wrap">
					<PageHeader
						headerTitle="Shop Page CMS"
						headerDescription="Manage your shop-page-cms"
					/>
				</div>

				<div className="grid grid-cols-12 gap-12">
					<div className="col-span-12 xl:col-span-12">
						<ShopPageCmsForm />
					</div>
				</div>
			</div>
		</>
	);
}

export default ShopPageCMS;
