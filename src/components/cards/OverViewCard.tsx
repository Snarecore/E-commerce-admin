interface OverViewCardProps {
	title: string;
	subTitle: string;
	bgColor?: string;
	style?: React.CSSProperties;
	children: React.ReactNode;
}

const OverViewCard = ({
	title,
	subTitle,
	bgColor = "bg-[var(--primary-color)]",
	style,
	children,
}: OverViewCardProps) => {
	return (
		<div
			style={style}
			className={`px-4 py-3.5 sm:px-4 sm:py-4 2xl:px-5 2xl:py-6 rounded-lg ${bgColor} text-white shadow-xs transition-all duration-300 hover:shadow-md hover:-translate-y-0.5`}
		>
			<div className="flex items-center justify-between gap-2">
				<div className="min-w-0">
					<p className="text-xl sm:text-2xl 2xl:text-[26px] font-bold tracking-tight truncate">{title}</p>
					<p className="text-xs sm:text-[13px] 2xl:text-sm font-medium opacity-90 truncate">{subTitle}</p>
				</div>
				<div className="text-3xl sm:text-4xl 2xl:text-5xl opacity-85 hover:opacity-100 hover:scale-105 transition-all ease-in duration-300 shrink-0">
					{children}
				</div>
			</div>
		</div>
	);
};

export default OverViewCard;

