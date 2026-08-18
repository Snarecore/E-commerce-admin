import PageHeader from "../../../../components/cards/PageHeader";
import HomePageCmsForm from "./components/HomePageCMS";

const HomePageCMS = () => {
    return (
        <>
            <div className="flex flex-col gap-8">
                <div className="flex items-center justify-between flex-wrap">
                    <PageHeader
                        headerTitle="Home Page CMS"
                        headerDescription="Manage your home page"
                    />
                </div>
                <div className="grid grid-cols-12 gap-12">
                    <div className="col-span-12 xl:col-span-12">
                        <HomePageCmsForm />
                    </div>
                </div>
            </div>
        </>
    );
}

export default HomePageCMS;
