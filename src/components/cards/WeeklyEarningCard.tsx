import { IoIosArrowUp, IoIosArrowDown } from "react-icons/io";

interface WeeklyEarningCardProps {
	amount?: number | string;
	percentageChange?: number;
}

const WeeklyEarningCard = ({ amount = 0, percentageChange = 0 }: WeeklyEarningCardProps) => {
	const numericAmount = Number(amount) || 0;
	const isPositive = (percentageChange ?? 0) >= 0;

	return (
		<div className="flex items-center bg-white justify-between px-[20px] py-8 rounded-lg border border-[#e6eaed]">
			<div>
				<p className="text-[16px] text-[#fe9f43] font-medium pb-[16px]">Weekly Earning</p>
				<p className="text-[20px] text-[#212b36] font-bold">৳{numericAmount.toLocaleString()}</p>
				<div className="flex items-center mt-2 gap-1">
					{isPositive ? (
						<IoIosArrowUp className="text-[#3eb780]" />
					) : (
						<IoIosArrowDown className="text-red-500" />
					)}
					<p className="text-[14px] text-[#646b72]">
						<span className={`${isPositive ? 'text-[#3eb780]' : 'text-red-500'} font-bold`}>
							{" "}{Math.abs(percentageChange || 0)}%
						</span>{" "}
						{isPositive ? "increase" : "decrease"} compare to last week
					</p>
				</div>
			</div>

			<div>
				<img src="./images/weekly-earning.svg" alt="weekly-earning-pic" />
			</div>
		</div>
	);
};

export default WeeklyEarningCard;
