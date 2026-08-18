import { ReactNode } from "react";

interface SalesCardProps {
	bgColor: string;
	imageSrc: string;
	mainText: string;
	subText: string;
	icon: ReactNode;
}

const SalesCard = ({ bgColor, imageSrc, mainText, subText, icon }: SalesCardProps) => {
	return (
		<div className={`flex justify-between ${bgColor} px-[20px] py-8 rounded-lg border border-[#e6eaed]`}>
			<div>
				<img src={imageSrc} alt="sales-pic" />
				<p className="text-white text-[20px] font-bold mt-2">{mainText}</p>
				<p className="text-white text-[15px]">{subText}</p>
			</div>
			<div className="text-white text-2xl cursor-pointer">{icon}</div>
		</div>
	);
};

export default SalesCard;
