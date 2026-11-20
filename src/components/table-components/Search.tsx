import React from "react";
import { FaSearch } from "react-icons/fa";

interface SearchProps {
	searchQuery: string;
	onSearchChange: (query: string) => void;
	className?: string;
	placeholder?: string;
}

const Search = React.memo(({ searchQuery, onSearchChange, className = "", placeholder = "Search" }: SearchProps) => {
	return (
		<div className="relative">
			<FaSearch className="absolute left-3 top-2.5 text-[var(--primary-color)] text-sm" />
			<input
				type="text"
				placeholder={placeholder}
				value={searchQuery}
				onChange={(e) => onSearchChange(e.target.value)}
				className={`w-64 sm:w-80 pl-9 pr-4 py-2 bg-[var(--ui-surface)] border border-[var(--primary-color)] rounded-md text-[var(--ui-text)] placeholder:text-[var(--ui-text-muted)] placeholder:text-[13px] focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)] transition-colors ${className}`}
			/>
		</div>
	);
});

export default Search;
