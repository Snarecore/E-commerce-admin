import PageHeader from "../../../../components/cards/PageHeader";
import PolicySevenForm from "./component/PolicySevenForm";

const PolicySeven = () => {
    return (
        <>
            <div className="flex flex-col gap-8">
                <div className="flex items-center justify-between flex-wrap">
                    <PageHeader
                        headerTitle="Policy Seven"
                        headerDescription="Manage your policy seven"
                    />
                </div>
                <div className="grid grid-cols-12 gap-12">
                    <div className="col-span-12 xl:col-span-12">
                        <PolicySevenForm />
                    </div>
                </div>
            </div>
        </>
    );
};

export default PolicySeven;
