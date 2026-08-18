import PageHeader from "../../../../components/cards/PageHeader";
import PolicyOneForm from "./component/PolicyOneForm";

const PolicyOne = () => {
    return (
        <>
            <div className="flex flex-col gap-8">
                <div className="flex items-center justify-between flex-wrap">
                    <PageHeader
                        headerTitle="Policy One"
                        headerDescription="Manage your policy one"
                    />
                </div>
                <div className="grid grid-cols-12 gap-12">
                    <div className="col-span-12 xl:col-span-12">
                        <PolicyOneForm />
                    </div>
                </div>
            </div>
        </>
    );
};

export default PolicyOne;
