import PageHeader from "../../../../components/cards/PageHeader";
import PolicyNineForm from "./component/PolicyNineForm";

const PolicyNine = () => {
    return (
        <>
            <div className="flex flex-col gap-8">
                <div className="flex items-center justify-between flex-wrap">
                    <PageHeader
                        headerTitle="Policy Nine"
                        headerDescription="Manage your policy nine"
                    />
                </div>
                <div className="grid grid-cols-12 gap-12">
                    <div className="col-span-12 xl:col-span-12">
                        <PolicyNineForm />
                    </div>
                </div>
            </div>
        </>
    );
};

export default PolicyNine;
