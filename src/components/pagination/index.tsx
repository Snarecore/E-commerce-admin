import {
	MdOutlineArrowBackIos,
	MdOutlineArrowForwardIos
} from "react-icons/md";
import ReactPaginate from "react-paginate";

interface PaginationProps {
	pageCount: number;
	currentPageNumber: number;
	handlePagination: (selectedItem: { selected: number }) => void;
}

const Pagination: React.FC<PaginationProps> = ({
	pageCount,
	currentPageNumber,
	handlePagination
}) => {
	return (
		<ReactPaginate
			pageCount={pageCount || 1}
			forcePage={currentPageNumber - 1 || 0}
			onPageChange={handlePagination}
			breakLabel="..."
			nextLabel={<MdOutlineArrowForwardIos size={16} />}
			previousLabel={<MdOutlineArrowBackIos size={16} />}
			pageRangeDisplayed={3}
			marginPagesDisplayed={1}
			containerClassName="flex items-center justify-center gap-2 mt-8 mb-4 text-md font-semibold list-none select-none"
			pageClassName="flex cursor-pointer rounded-full bg-[var(--ui-surface-muted)] border border-[var(--ui-border)] text-[var(--ui-text)] transition-colors hover:border-[var(--primary-color)]"
			pageLinkClassName="w-8 h-8 flex items-center justify-center text-sm font-semibold"
			activeClassName="!bg-[var(--primary-color)] !border-[var(--primary-color)] font-bold shadow-sm"
			activeLinkClassName="!text-white font-bold"
			previousClassName="mr-2 cursor-pointer rounded-full flex items-center justify-center w-8 h-8 bg-[var(--ui-surface-muted)] border border-[var(--ui-border)] text-[var(--ui-text)] hover:bg-[var(--primary-color)] hover:text-white transition-colors"
			nextClassName="mr-2 cursor-pointer rounded-full flex items-center justify-center w-8 h-8 bg-[var(--ui-surface-muted)] border border-[var(--ui-border)] text-[var(--ui-text)] hover:bg-[var(--primary-color)] hover:text-white transition-colors"
			previousLinkClassName="w-full h-full flex items-center justify-center text-sm text-[var(--primary-color)] hover:text-white"
			nextLinkClassName="w-full h-full flex items-center justify-center text-sm text-[var(--primary-color)] hover:text-white"
			disabledClassName="opacity-40 pointer-events-none"
			breakClassName="mx-1 text-[var(--ui-text-muted)] flex items-center"
			breakLinkClassName="px-2 py-1.5 text-sm"
		/>
	);
};

export default Pagination;
