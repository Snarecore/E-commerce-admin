import PageHeader from "../../../../components/cards/PageHeader";
import PolicyEightForm from "./component/PolicyEightForm";

const PolicyEight = () => {
    return (
        <>
            <div className="flex flex-col gap-8">
                <div className="flex items-center justify-between flex-wrap">
                    <PageHeader
                        headerTitle="Policy Eight"
                        headerDescription="Manage your policy eight"
                    />
                </div>
                <div className="grid grid-cols-12 gap-12">
                    <div className="col-span-12 xl:col-span-12">
                        <PolicyEightForm />
                    </div>
                </div>
            </div>
        </>
    );
};

export default PolicyEight;
