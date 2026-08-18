import PageHeader from "../../../../components/cards/PageHeader";
import PolicySixForm from "./component/PolicySixForm";

const PolicySix = () => {
    return (
        <>
            <div className="flex flex-col gap-8">
                <div className="flex items-center justify-between flex-wrap">
                    <PageHeader
                        headerTitle="Policy Six"
                        headerDescription="Manage your policy six"
                    />
                </div>
                <div className="grid grid-cols-12 gap-12">
                    <div className="col-span-12 xl:col-span-12">
                        <PolicySixForm />
                    </div>
                </div>
            </div>
        </>
    );
};

export default PolicySix;
