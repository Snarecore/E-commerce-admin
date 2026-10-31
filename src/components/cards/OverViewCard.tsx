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
			className={`px-5 py-6 rounded-md ${bgColor} text-white shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5`}
		>
			<div className="flex items-center justify-between">
				<div>
					<p className="text-[26px] font-bold tracking-tight">{title}</p>
					<p className="text-sm font-medium opacity-90">{subTitle}</p>
				</div>
				<div className="text-5xl opacity-85 hover:opacity-100 hover:scale-110 transition-all ease-in duration-300">
					{children}
				</div>
			</div>
		</div>
	);
};

export default OverViewCard;
