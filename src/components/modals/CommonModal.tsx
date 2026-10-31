import React from "react";
import { TiDelete } from "react-icons/ti";

interface ModalProps {
	isOpen: boolean;
	title: string;
	onClose: () => void;
	children: React.ReactNode;
	footerButtons?: React.ReactNode;
	width?: string;
	className?: string;
}

const Modal: React.FC<ModalProps> = ({
	isOpen,
	title,
	onClose,
	children,
	footerButtons,
	width = "w-[400px]",
	className = ""
}) => {
	if (!isOpen) return null;
	return (
		<div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-xs z-50 top-0 right-0 left-0 bottom-0 p-4 overflow-y-auto">
			<div className={`bg-[var(--ui-surface)] text-[var(--ui-text)] border border-[var(--ui-border)] rounded-2xl shadow-2xl ${width} max-w-[95vw] max-h-[90vh] p-6 flex flex-col overflow-y-auto ${className}`}>
				<div className="flex justify-between items-center pb-3 border-b border-[var(--ui-border)]">
					<h2 className="text-lg font-bold text-[var(--ui-text)]">{title}</h2>
					<TiDelete className="text-3xl cursor-pointer text-[var(--ui-text-muted)] hover:text-red-500 transition-colors" onClick={onClose} />
				</div>
				<div className="mt-4 flex-1">{children}</div>
				{footerButtons && <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[var(--ui-border)]">{footerButtons}</div>}
			</div>
		</div>
	);
};

export default Modal;
