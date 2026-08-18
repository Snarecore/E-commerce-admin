import PageHeader from "../../../../components/cards/PageHeader";
import PolicyElevenForm from "./component/PolicyElevenForm";

const PolicyEleven = () => {
    return (
        <>
            <div className="flex flex-col gap-8">
                <div className="flex items-center justify-between flex-wrap">
                    <PageHeader
                        headerTitle="Policy Eleven"
                        headerDescription="Manage your policy eleven"
                    />
                </div>
                <div className="grid grid-cols-12 gap-12">
                    <div className="col-span-12 xl:col-span-12">
                        <PolicyElevenForm />
                    </div>
                </div>
            </div>
        </>
    );
};

export default PolicyEleven;
