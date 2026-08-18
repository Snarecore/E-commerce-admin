import PageHeader from "../../../../components/cards/PageHeader";
import PolicyFourForm from "./component/PolicyFourForm";

const PolicyFour = () => {
    return (
        <>
            <div className="flex flex-col gap-8">
                <div className="flex items-center justify-between flex-wrap">
                    <PageHeader
                        headerTitle="Policy Four"
                        headerDescription="Manage your policy four"
                    />
                </div>
                <div className="grid grid-cols-12 gap-12">
                    <div className="col-span-12 xl:col-span-12">
                        <PolicyFourForm />
                    </div>
                </div>
            </div>
        </>
    );
};

export default PolicyFour;
