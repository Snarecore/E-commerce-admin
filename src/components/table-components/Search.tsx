import React from "react";
import { FaSearch } from "react-icons/fa";

interface SearchProps {
	searchQuery: string;
	onSearchChange: (query: string) => void;
}

const Search = React.memo(({ searchQuery, onSearchChange }: SearchProps) => {
	return (
		<div className="relative">
			<FaSearch className="absolute left-3 top-2.5 text-[var(--ui-text-muted)]" />
			<input
				type="text"
				placeholder="Search"
				value={searchQuery}
				onChange={(e) => onSearchChange(e.target.value)}
				className="pl-10 pr-4 py-2 bg-[var(--ui-surface)] border border-[var(--ui-border)] rounded-md text-[var(--ui-text)] placeholder:text-[var(--ui-text-muted)] placeholder:text-[13px] focus:outline-none focus:border-[var(--primary-color)] transition-colors"
			/>
		</div>
	);
});

export default Search;
