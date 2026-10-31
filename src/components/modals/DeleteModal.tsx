import { FiTrash2 } from "react-icons/fi";

interface DeleteModalProps {
	isOpen: boolean;
	title: string;
	message: string;
	onClose: () => void;
	onDelete: () => void;
}

const DeleteModal: React.FC<DeleteModalProps> = ({
	isOpen,
	title,
	message,
	onClose,
	onDelete
}) => {
	if (!isOpen) return null;
	return (
		<div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-xs z-[9999] p-2">
			<div className="bg-[var(--ui-surface)] text-[var(--ui-text)] border border-[var(--ui-border)] rounded-xl shadow-2xl w-[400px] p-8 relative" role="dialog" aria-labelledby="delete-modal-title">
				<div className="flex flex-col items-center text-center">
					<div className="bg-red-500/10 border border-red-500/20 p-3 rounded-full">
						<FiTrash2 className="text-2xl text-red-500" />
					</div>
					<h2 id="delete-modal-title" className="text-lg font-bold text-[var(--ui-text)] mt-3">{title}</h2>
					<p className="text-sm text-[var(--ui-text-muted)] mt-1">{message}</p>
				</div>
				<div className="flex justify-center gap-4 mt-6">
					<button onClick={onClose} className="px-4 py-2 text-[var(--ui-text)] bg-[var(--ui-surface-muted)] border border-[var(--ui-border)] rounded-md cursor-pointer hover:bg-[var(--ui-surface-sunken)] transition">
						Cancel
					</button>
					<button onClick={onDelete} className="px-4 py-2 bg-red-600 text-white rounded-md cursor-pointer hover:bg-red-700 transition font-semibold">
						Delete
					</button>
				</div>
			</div>
		</div>
	);
};

export default DeleteModal;
