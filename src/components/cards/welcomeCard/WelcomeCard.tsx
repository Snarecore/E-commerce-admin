import { FiRefreshCcw } from "react-icons/fi";
import { useState } from "react";
import DateRangePicker from "../welcomeCard/DateRangePicker";

const WelcomeCard = () => {
	// @ts-ignore
	const [selectedDates, setSelectedDates] = useState({
		startDate: new Date(),
		endDate: new Date(),
	});

	const handleDateChange = (startDate: Date, endDate: Date) => {
		setSelectedDates({ startDate, endDate });
	};

	return (
		<div className="flex items-center flex-wrap justify-between bg-[#fff] p-[15px] rounded-md space-y-4 lg:space-y-0">
			<div className="flex items-center gap-2">
				<img src="./images/hi.svg" alt="" />
				<p>
					{" "}
					<span className="text-[#212b36] text-[20px] font-bold">
						Hi John Smilga,
					</span>{" "}
					<span className="text-[#646b72] font-medium text-[16px]">
						here's what's happening with your store tody.
					</span>
				</p>
			</div>

			<div className="flex items-center gap-4">
				<DateRangePicker onDateChange={handleDateChange} />
				<div className="bg-white border border-gray-200 p-2 rounded-md">
					<FiRefreshCcw className="cursor-pointer" />
				</div>
			</div>
		</div>
	);
};

export default WelcomeCard;
