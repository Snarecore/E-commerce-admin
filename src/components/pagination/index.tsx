import {
	MdOutlineArrowBackIos,
	MdOutlineArrowForwardIos
} from "react-icons/md";
import ReactPaginate from "react-paginate";

interface PaginationProps {
	pageCount: number;
	currentPageNumber: number;
	handlePagination: (selectedItem: { selected: number }) => void;
	className?: string;
}

const Pagination: React.FC<PaginationProps> = ({
	pageCount,
	currentPageNumber,
	handlePagination,
	className = ""
}) => {
	return (
		<ReactPaginate
			pageCount={pageCount || 1}
			forcePage={currentPageNumber - 1 || 0}
			onPageChange={handlePagination}
			breakLabel="..."
			nextLabel={<MdOutlineArrowForwardIos size={14} />}
			previousLabel={<MdOutlineArrowBackIos size={14} />}
			pageRangeDisplayed={3}
			marginPagesDisplayed={1}
			containerClassName={`flex items-center justify-end gap-1.5 mt-3 mb-1 text-sm font-semibold list-none select-none ${className}`}
			pageClassName="flex cursor-pointer rounded-full bg-[var(--ui-surface-muted)] border border-[var(--ui-border)] text-[var(--ui-text)] transition-colors hover:border-[var(--primary-color)]"
			pageLinkClassName="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-xs sm:text-sm font-semibold"
			activeClassName="!bg-[var(--primary-color)] !border-[var(--primary-color)] font-bold shadow-sm"
			activeLinkClassName="!text-white font-bold"
			previousClassName="mr-1.5 cursor-pointer rounded-full flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 bg-[var(--ui-surface-muted)] border border-[var(--ui-border)] text-[var(--ui-text)] hover:bg-[var(--primary-color)] hover:text-white transition-colors"
			nextClassName="ml-1.5 cursor-pointer rounded-full flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 bg-[var(--ui-surface-muted)] border border-[var(--ui-border)] text-[var(--ui-text)] hover:bg-[var(--primary-color)] hover:text-white transition-colors"
			previousLinkClassName="w-full h-full flex items-center justify-center text-xs sm:text-sm text-[var(--primary-color)] hover:text-white"
			nextLinkClassName="w-full h-full flex items-center justify-center text-xs sm:text-sm text-[var(--primary-color)] hover:text-white"
			disabledClassName="opacity-40 pointer-events-none"
			breakClassName="mx-1 text-[var(--ui-text-muted)] flex items-center"
			breakLinkClassName="px-2 py-1 text-xs sm:text-sm"
		/>
	);
};

export default Pagination;
