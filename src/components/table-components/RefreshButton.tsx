import React from "react";
import { FiRefreshCw } from "react-icons/fi";

interface RefreshButtonProps {
	onClick: () => void;
	loading?: boolean;
	className?: string;
}

const RefreshButton: React.FC<RefreshButtonProps> = ({ onClick, loading = false, className = "" }) => {
	return (
		<button
			type="button"
			onClick={onClick}
			disabled={loading}
			title="Refresh data"
			className={`flex items-center justify-center gap-1.5 text-xs sm:text-sm font-semibold border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-lg px-3 py-2 transition-all cursor-pointer shadow-2xs active:scale-95 disabled:opacity-50 ${className}`}
		>
			<FiRefreshCw size={14} className={loading ? "animate-spin" : ""} />
			<span>Refresh</span>
		</button>
	);
};

export default RefreshButton;
