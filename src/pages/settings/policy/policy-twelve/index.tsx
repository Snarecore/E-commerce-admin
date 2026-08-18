import PageHeader from "../../../../components/cards/PageHeader";
import PolicyTwelveForm from "./component/PolicyTwelveForm";

const PolicyTwelve = () => {
    return (
        <>
            <div className="flex flex-col gap-8">
                <div className="flex items-center justify-between flex-wrap">
                    <PageHeader
                        headerTitle="Policy Twelve"
                        headerDescription="Manage your policy twelve"
                    />
                </div>
                <div className="grid grid-cols-12 gap-12">
                    <div className="col-span-12 xl:col-span-12">
                        <PolicyTwelveForm />
                    </div>
                </div>
            </div>
        </>
    );
};

export default PolicyTwelve;
