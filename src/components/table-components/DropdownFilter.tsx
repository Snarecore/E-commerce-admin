import React, { useEffect, useRef } from "react";
import { RiArrowDropDownLine } from "react-icons/ri";

interface OptionType {
	label: string;
	value: string;
}

interface DropdownFilterProps {
	title: string;
	options: OptionType[];
	selectedOption: OptionType | null;
	onSelect: (option: OptionType) => void;
	isOpen: boolean;
	onToggle: () => void;
}

const DropdownFilter: React.FC<DropdownFilterProps> = ({
	title,
	options,
	selectedOption,
	onSelect,
	isOpen,
	onToggle,
}) => {
	const dropdownRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				if (isOpen) {
					onToggle();
				}
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [isOpen, onToggle]);

	return (
		<div className="relative" ref={dropdownRef}>
			<div
				className={`border border-[var(--ui-border)] bg-[var(--ui-surface)] text-[var(--ui-text)] px-3 py-2 rounded-md cursor-pointer flex justify-between items-center w-fit h-[34px] ${
					isOpen
						? "!bg-[var(--color-primary)] !text-white !border-[var(--color-primary)]"
						: "hover:bg-[var(--color-primary)] hover:text-white transition-all ease-in duration-300"
				}`}
				onClick={onToggle}
			>
				{selectedOption ? selectedOption.label : title}
				<RiArrowDropDownLine size={20} />
			</div>

			{isOpen && (
				<div className="absolute left-0 right-0 mt-1 w-64 bg-[var(--ui-surface)] border border-[var(--ui-border)] shadow-xl rounded-md z-50 text-[var(--ui-text)]">
					{options.map((option) => (
						<div
							key={option.value}
							className={`px-4 py-2 cursor-pointer transition-colors ${
								selectedOption?.value === option.value
									? "text-[var(--color-primary)] font-semibold rounded-sm bg-[var(--ui-surface-muted)]"
									: "hover:bg-[var(--ui-surface-muted)] hover:text-[var(--color-primary)]"
							}`}
							onClick={() => onSelect(option)}
						>
							{option.label}
						</div>
					))}
				</div>
			)}
		</div>
	);
};

export default DropdownFilter;
