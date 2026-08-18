import PageHeader from "../../../../components/cards/PageHeader";
import PrivacyPolicyForm from "./components/PrivacyPolicyForm";

const PrivacyPolicy = () => {
    return (
        <>
            <div className="flex flex-col gap-8">
                <div className="flex items-center justify-between flex-wrap">
                    <PageHeader
                        headerTitle="Privacy Policy"
                        headerDescription="Manage your privacy policy"
                    />
                </div>
                <div className="grid grid-cols-12 gap-12">
                    <div className="col-span-12 xl:col-span-12">
                        <PrivacyPolicyForm />
                    </div>
                </div>
            </div>
        </>
    );
};

export default PrivacyPolicy;
