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
		<div className="fixed inset-0 flex items-center justify-center bg-opacity-50 bg-[#000000b6] z-50 top-0 right-0 left-0 bottom-0 p-4 overflow-y-auto">
			<div className={`bg-white rounded-2xl shadow-2xl ${width} max-w-[95vw] max-h-[90vh] p-6 flex flex-col overflow-y-auto ${className}`}>
				<div className="flex justify-between items-center pb-3 border-b border-gray-100">
					<h2 className="text-lg font-bold text-gray-800">{title}</h2>
					<TiDelete className="text-3xl cursor-pointer text-gray-400 hover:text-red-500 transition-colors" onClick={onClose} />
				</div>
				<div className="mt-4 flex-1">{children}</div>
				{footerButtons && <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">{footerButtons}</div>}
			</div>
		</div>
	);
};

export default Modal;
