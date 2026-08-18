import React from "react";
import { FaSearch } from "react-icons/fa";

interface SearchProps {
	searchQuery: string;
	onSearchChange: (query: string) => void;
}

const Search = React.memo(({ searchQuery, onSearchChange }: SearchProps) => {
	return (
		<div className="relative">
			<FaSearch className="absolute left-3 top-2.5 text-gray-400" />
			<input
				type="text"
				placeholder="Search"
				value={searchQuery}
				onChange={(e) => onSearchChange(e.target.value)}
				className="pl-10 pr-4 py-2 border border-gray-300 rounded-md placeholder:text-gray-400 placeholder:text-[13px] focus:outline-none"
			/>
		</div>
	);
});

export default Search;
