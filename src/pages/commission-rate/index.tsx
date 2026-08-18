import PageHeader from "../../components/cards/PageHeader";
import CommissionRateCmsForm from "./component/RateCms";

const CommissionRate = () => {
	return (
		<>
			<div className="flex flex-col gap-8">
				<div className="flex items-center justify-between flex-wrap">
					<PageHeader
						headerTitle="Commission Rate"
						headerDescription="Manage your commission rate"
					/>
				</div>

				<div className="grid grid-cols-12 gap-12">
					<div className="col-span-12 xl:col-span-12">
						<CommissionRateCmsForm />
					</div>
				</div>
			</div>
		</>
	);
}

export default CommissionRate;
