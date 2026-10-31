import { useState } from "react";
import { FiTrash2, FiEye, FiCheck, FiX } from "react-icons/fi";
import apiConfig from "../../../../config/api.json";
import { useAPI } from "../../../../hooks/useApi";
import TableSkeleton from "../../../../components/skeleton/TableSkeleton";
import EmptyState from "../../../../components/empty-state/EmptyState";
import DeleteModal from "../../../../components/modals/DeleteModal";
import Modal from "../../../../components/modals/CommonModal";
import Pagination from "../../../../components/pagination";
import CommentReplyModal from "../../../../components/modals/CommentReplyModal";

interface ReviewDataProps {
    id: string;
    user: {
        name: string;
        email: string;
        phone: string;
    };
    product: {
        name: string;
        featuredImage: string;
    };
    rating: string | number;
    comment?: string;
    status?: "pending" | "approved";
    isApprove: string;
    isApproved?: boolean;
    created_at?: string;
    body: string;
}


interface ReviewTableProps {
    dataList: ReviewDataProps[];
    fetchData: () => void;
    pageCount: number;
    currentPageNumber: number;
    handlePagination: (paginationData: { selected: number }) => void;
    isLoading?: boolean;
    isFetching?: boolean;
}


const ProductReviewTable = ({
    dataList,
    fetchData,
    pageCount,
    currentPageNumber,
    handlePagination,
    isLoading,
    isFetching: _isFetching,
}: ReviewTableProps) => {
    const { handleDeleteAPI, handleApiMutation, patchMutation } = useAPI() as any;
    const apiUrl = apiConfig.inventory.productCommentUrl;

    const tableHeaders = [
        { key: "sl", label: "Sl" },
        { key: "product", label: "Product" },
        { key: "name", label: "Name" },
        { key: "commnet", label: "Comment" },
        { key: "status", label: "Status" },
        { key: "action", label: "Action" },
    ];

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedReview, setSelectedReview] = useState<ReviewDataProps | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);    
    const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);  
    const [viewReview, setViewReview] = useState<ReviewDataProps | null>(null);
    const [commentViewReview, setCommentViewReview] = useState<ReviewDataProps | null>(null);


    const getReviewText = (r?: ReviewDataProps | null) =>
        (r?.comment ?? (r as any)?.body ?? "").toString();

    const truncateWords = (text: string | undefined | null, maxWords = 50) => {
        const t = (text ?? "").trim();
        if (!t) return "—";
        const words = t.split(/\s+/);
        return words.length <= maxWords ? t : words.slice(0, maxWords).join(" ") + "…";
    };

    const openDeleteModal = (data: ReviewDataProps) => {
        setSelectedReview(data);
        setIsDeleteModalOpen(true);
    };
    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setSelectedReview(null);
    };

    const handleDelete = async () => {
        if (!selectedReview) return;
        const apiResponse = await handleDeleteAPI({
            url: `${apiUrl}/${selectedReview.id}`,
            showSuccessMessage: true,
        });
        if (apiResponse) {
            fetchData();
            closeDeleteModal();
        }
    };

    const handleDeleteReply = async (replyId: string) => {
        if (!replyId) return;
        const apiResponse = await handleDeleteAPI({
            url: `${apiUrl}/${replyId}`,
            showSuccessMessage: true,
        });
        if (apiResponse) {
            fetchData();
            closeReplyModal()
        }
    };


    const openViewModal = (data: ReviewDataProps) => {
        setViewReview(data);
        setIsViewModalOpen(true);
    };

    const openCommentViewModal = (data: ReviewDataProps) => {
        setCommentViewReview(data);
        setIsReplyModalOpen(true);
    };


    const closeViewModal = () => {
        setIsViewModalOpen(false);
        setViewReview(null);
    };

    const closeReplyModal = () => {
        setIsReplyModalOpen(false);
        setCommentViewReview(null);
    };


    const handleToggleStatus = async (review: ReviewDataProps, targetStatus: boolean) => {
        const res = await handleApiMutation({
            mutation: patchMutation,
            url: `${apiUrl}/${review.id}/status`,
            body: { isApproved: targetStatus },
            showSuccessMessage: true,
            requiredFields: []
        });
        if (res?.success) {
            fetchData();
            if (isViewModalOpen) closeViewModal();
        }
    };

    if (isLoading) return <TableSkeleton />;

    return (
        <div className="p-6 bg-[var(--ui-surface)] rounded-md border border-[var(--ui-border)] shadow-sm transition-colors duration-200">
            <div className="mt-4 w-full overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[1000px]">
                    <thead className="bg-[var(--ui-surface-muted)]">
                        <tr className="text-[var(--ui-text-muted)] text-sm border-b border-[var(--ui-border)]">
                            {tableHeaders.map(({ key, label }) => (
                                <th key={key} className="px-6 py-4 text-left font-semibold text-[var(--ui-text)]">
                                    {label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-[var(--ui-surface)] divide-y divide-[var(--ui-border)] rounded-md">
                        {dataList?.length > 0 ? (
                            dataList.map((data, index) => {
                                const fullText = getReviewText(data);
                                const preview = truncateWords(fullText, 50);
                                return (
                                    <tr
                                        key={data.id}
                                        className="border-b border-[var(--ui-border)] text-[var(--ui-text)] hover:bg-[var(--ui-surface-muted)] transition duration-200"
                                    >
                                        <td className="px-6 py-4 font-medium text-[var(--ui-text-muted)]">{index + 1}</td>
                                        <td className="px-6 py-4 flex items-center gap-2">
                                            <img src={data?.product?.featuredImage} alt={data?.product?.name} className="w-10 h-10 rounded-md object-cover border border-[var(--ui-border)]" />
                                            <span className="font-semibold text-[var(--ui-text)]">{data?.product?.name}</span>
                                        </td>

                                        <td className="px-6 py-4 text-[var(--ui-text)]">{data?.user?.name || "Anonymous"}</td>
                                        <td className="px-6 py-4">
                                            <button
                                                type="button"
                                                onClick={() => openViewModal(data)}
                                                title="Click to view full comment"
                                                className="max-w-[360px] text-left text-[var(--ui-text)] hover:text-[var(--primary-color)] hover:underline focus:underline focus:outline-none break-words cursor-pointer"
                                            >
                                                {preview}
                                            </button>
                                        </td>

                                        <td className="px-6 py-4">
                                            {data.isApproved ? (
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                                    Approved
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                                                    Pending
                                                </span>
                                            )}
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {!data.isApproved && (
                                                    <button
                                                        onClick={() => handleToggleStatus(data, true)}
                                                        className="border border-emerald-500/40 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 cursor-pointer px-2.5 py-1.5 rounded-md transition duration-200 flex items-center gap-1 text-xs font-semibold"
                                                        title="Approve Comment"
                                                    >
                                                        <FiCheck className="text-sm text-emerald-400" /> Approve
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => openCommentViewModal(data)}
                                                    className="border border-[var(--ui-border)] text-[var(--ui-text-muted)] hover:text-[var(--primary-color)] hover:bg-[var(--ui-surface-muted)] cursor-pointer p-2 rounded-md transition duration-200"
                                                    title="View Replies"
                                                >
                                                    <FiEye />
                                                </button>
                                                <button
                                                    onClick={() => openDeleteModal(data)}
                                                    className="border border-[var(--ui-border)] text-[var(--ui-text-muted)] hover:text-red-500 hover:bg-red-500/10 cursor-pointer p-2 rounded-md transition duration-200"
                                                    title="Delete"
                                                >
                                                    <FiTrash2 />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })
                        ) : (
                            <tr>
                                <td colSpan={tableHeaders.length} className="px-6 py-4 text-center italic text-[var(--ui-text-muted)]">
                                    <EmptyState title="No products review yet!" description="" />
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Delete modal */}
            {selectedReview && (
                <DeleteModal
                    isOpen={isDeleteModalOpen}
                    title="Delete Review"
                    message={`Are you sure you want to delete review?`}
                    onClose={closeDeleteModal}
                    onDelete={handleDelete}
                />
            )}

            {/* View Modal */}
            <Modal
                isOpen={isViewModalOpen}
                title="Review Comment Details"
                onClose={closeViewModal}
            >
                {!viewReview ? (
                    <div className="p-6 text-center text-gray-500">Loading…</div>
                ) : (
                    <div className="space-y-4">
                        {/* Product & User Header Info */}
                        <div className="flex items-center gap-3 p-3 bg-[var(--ui-surface-muted)] rounded-xl border border-[var(--ui-border)]">
                            {viewReview?.product?.featuredImage && (
                                <img
                                    src={viewReview.product.featuredImage}
                                    alt={viewReview?.product?.name ?? "Product image"}
                                    className="w-12 h-12 rounded-lg object-cover border border-[var(--ui-border)]"
                                />
                            )}
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-bold text-[var(--ui-text)] truncate">
                                    {viewReview?.product?.name ?? "—"}
                                </h4>
                                <p className="text-xs text-[var(--ui-text-muted)] truncate">
                                    Posted by: <strong className="text-[var(--ui-text)]">{viewReview?.user?.name || "Anonymous"}</strong> ({viewReview?.user?.email || "No email"})
                                </p>
                            </div>
                            <div>
                                {viewReview?.isApproved ? (
                                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                        Approved
                                    </span>
                                ) : (
                                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                                        Pending
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Full Comment Text */}
                        <div>
                            <label className="block text-xs font-bold text-[var(--ui-text-muted)] uppercase tracking-wider mb-1.5">
                                Comment Body
                            </label>
                            <div className="p-4 rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface)] text-sm text-[var(--ui-text)] whitespace-pre-wrap leading-relaxed shadow-inner max-h-60 overflow-y-auto">
                                {viewReview?.body || "—"}
                            </div>
                        </div>

                        {/* Modal Action Buttons */}
                        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--ui-border)]">
                            <button
                                type="button"
                                onClick={closeViewModal}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-[var(--ui-text)] border-[var(--ui-border)] hover:bg-[var(--ui-surface-muted)] text-xs font-semibold transition cursor-pointer"
                            >
                                Close
                            </button>

                            {!viewReview?.isApproved ? (
                                <button
                                    type="button"
                                    onClick={() => handleToggleStatus(viewReview, true)}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold shadow-md transition cursor-pointer"
                                >
                                    <FiCheck className="text-sm" /> Approve & Publish
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => handleToggleStatus(viewReview, false)}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 text-xs font-semibold transition cursor-pointer"
                                >
                                    <FiX className="text-sm" /> Mark Pending
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </Modal>

            <CommentReplyModal
                isOpen={isReplyModalOpen}
                title="View Full Comment"
                onClose={closeReplyModal}
            >
                {!commentViewReview ? (
                    <div className="p-6 text-center text-gray-500">Loading…</div>
                ) : (
                    <div className="">
                        <table className="w-full border border-[var(--ui-border)] rounded-lg overflow-hidden shadow-md">
                            <thead className="bg-[var(--ui-surface-muted)]">
                                <tr className="text-[var(--ui-text)] text-sm font-semibold">
                                    <th className="px-6 py-3 text-left">Sl</th>
                                    <th className="px-6 py-3 text-left">Comment</th>
                                    <th className="px-6 py-3 text-left">Type</th>
                                    <th className="px-6 py-3 text-left">Action</th>
                                </tr>
                            </thead>

                            <tbody className="bg-[var(--ui-surface)] divide-y divide-[var(--ui-border)]">
                                {/* Main comment row (no delete button here) */}
                                <tr className="hover:bg-[var(--ui-surface-muted)] transition duration-200">
                                    <td className="px-6 py-4 font-medium text-[var(--ui-text)]">1</td>
                                    <td className="px-6 py-4 text-[var(--ui-text)] max-w-[300px]">
                                        {commentViewReview?.body}
                                    </td>
                                    <td className="px-6 py-4 text-[var(--ui-text-muted)] italic">Parent</td>
                                    <td className="px-6 py-4 text-[var(--ui-text-muted)] italic">—</td>
                                </tr>

                                {/* Replies (full width rows with delete) */}
                                {Array.isArray((commentViewReview as any)?.replies) &&
                                    (commentViewReview as any).replies.map((reply: any, idx: number) => (
                                        <tr
                                            key={reply.id ?? idx}
                                            className="hover:bg-[var(--ui-surface-muted)] transition duration-200 bg-[var(--ui-surface-muted)]/50"
                                        >
                                            <td className="px-6 py-4 font-medium text-[var(--ui-text)]">
                                                1.{idx + 1}
                                            </td>
                                            <td className="px-6 py-4 text-[var(--ui-text)] max-w-[300px]">
                                                <span className="text-[var(--ui-text-muted)] mr-2">↳</span>
                                                {reply.body ?? "—"}
                                            </td>
                                            <td className="px-6 py-4 text-[var(--ui-text-muted)]">Reply</td>
                                            <td className="px-6 py-4">
                                                <button
                                                    className="px-3 py-1 text-sm rounded-md border border-red-500/30 bg-red-500/10 text-red-500 hover:bg-red-500/20 transition cursor-pointer"
                                                    onClick={() => handleDeleteReply(reply.id)}
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>


                    </div>
                )}
            </CommentReplyModal>

            {/* Pagination */}
            {pageCount > 1 && (
                <div className="flex justify-center">
                    <Pagination
                        pageCount={pageCount}
                        currentPageNumber={currentPageNumber}
                        handlePagination={handlePagination}
                    />
                </div>
            )}
        </div>
    );
};

export default ProductReviewTable;
