import { IoIosArrowUp } from "react-icons/io";

const WeeklyEarningCard = () => {
	return (
		<div className="flex items-center bg-white justify-between px-[20px] py-8 rounded-lg border border-[#e6eaed]">
			<div>
				<p className="text-[16px] text-[#fe9f43] font-medium pb-[16px]">Weekly Earning</p>
				<p className="text-[20px] text-[#212b36] font-bold">$95000.45</p>
				<div className="flex mt-2">
					<IoIosArrowUp className="text-[#3eb780]" />
					<p className="text-[14px] text-[#646b72]"><span className="text-[#3eb780] font-bold"> 48%</span> increase compare to last week</p>
				</div>
			</div>

			<div>
				<img src="./images/weekly-earning.svg" alt="weekly-earning-pic" />
			</div>
		</div>
	)
}

export default WeeklyEarningCard
