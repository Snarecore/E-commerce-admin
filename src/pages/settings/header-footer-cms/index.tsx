import PageHeader from "../../../components/cards/PageHeader";
import HeaderFooterCmsForm from "./components/HeaderFooterCms";

const HeaderFooterCMS = () => {
	return (
		<>
			<div className="flex flex-col gap-3.5">
				<div className="flex items-center justify-between flex-wrap">
					<PageHeader
						headerTitle="Header Footer CMS"
						headerDescription="Manage your header-footer-cms"
					/>
				</div>

				<div className="grid grid-cols-12 gap-4">
					<div className="col-span-12 xl:col-span-12">
						<HeaderFooterCmsForm />
					</div>
				</div>
			</div>
		</>
	);
}

export default HeaderFooterCMS;
