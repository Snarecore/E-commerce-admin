import PageHeader from "../../../components/cards/PageHeader";
import EmailSettingForm from "./components/EmailSettingForm";

const EmailSettingPage = () => {
	return (
		<div className="flex flex-col gap-3.5">
			<div className="flex items-center justify-between flex-wrap">
				<PageHeader
					headerTitle="Email & SMTP Configuration"
					headerDescription="Manage dynamic SMTP mail server credentials, sender identity, and test email deliveries"
				/>
			</div>

			<div className="grid grid-cols-12 gap-6">
				<div className="col-span-12">
					<EmailSettingForm />
				</div>
			</div>
		</div>
	);
};

export default EmailSettingPage;
