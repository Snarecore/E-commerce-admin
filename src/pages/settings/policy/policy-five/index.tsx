import PageHeader from "../../../../components/cards/PageHeader";
import PolicyFiveForm from "./component/PolicyFiveForm";

const PolicyFive = () => {
    return (
        <>
            <div className="flex flex-col gap-8">
                <div className="flex items-center justify-between flex-wrap">
                    <PageHeader
                        headerTitle="Policy Five"
                        headerDescription="Manage your policy five"
                    />
                </div>
                <div className="grid grid-cols-12 gap-12">
                    <div className="col-span-12 xl:col-span-12">
                        <PolicyFiveForm />
                    </div>
                </div>
            </div>
        </>
    );
};

export default PolicyFive;
