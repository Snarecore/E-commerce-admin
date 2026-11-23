import React, { useState } from 'react';
import {
    FiX,
    FiPhone,
    FiShoppingBag,
    FiUser,
    FiMapPin,
    FiCheckCircle,
    FiClock,
    FiPlus,
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { IncompleteCheckoutItem, RecoveryAction } from '../../../../models/incomplete-checkout';

const getProductImage = (img?: string | null): string => {
    if (!img) return '';
    return img;
};

interface CheckoutDetailsModalProps {
    checkout: IncompleteCheckoutItem | null;
    isOpen: boolean;
    onClose: () => void;
    onLogActivity: (action: RecoveryAction, note?: string) => Promise<void>;
    onConvertToOrder: () => Promise<void>;
    onCancelCheckout: (note?: string) => Promise<void>;
    isConverting?: boolean;
}

export const CheckoutDetailsModal: React.FC<CheckoutDetailsModalProps> = ({
    checkout,
    isOpen,
    onClose,
    onLogActivity,
    onConvertToOrder,
    onCancelCheckout,
    isConverting,
}) => {
    const [noteText, setNoteText] = useState('');
    const [isSavingNote, setIsSavingNote] = useState(false);

    if (!isOpen || !checkout) return null;

    const formatBDT = (amount: number = 0) => {
        return `৳${Number(amount || 0).toLocaleString('en-IN')}`;
    };

    const handleCallClick = async () => {
        const targetUrl = checkout.recovery?.callUrl || (checkout.customer.phone ? `tel:${checkout.customer.phone}` : null);
        if (!targetUrl) return;
        await onLogActivity('call_initiated', 'Call clicked from details modal');
        window.location.href = targetUrl;
    };

    const handleWhatsAppClick = async () => {
        const targetUrl = checkout.recovery?.whatsappUrl;
        if (!targetUrl) return;
        await onLogActivity('whatsapp_opened', 'WhatsApp link opened from details modal');
        window.open(targetUrl, '_blank');
    };

    const handleAddNote = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!noteText.trim()) return;
        setIsSavingNote(true);
        try {
            await onLogActivity('note_added', noteText.trim());
            setNoteText('');
        } finally {
            setIsSavingNote(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <div className="flex items-center gap-3">
                        <span className="font-bold text-lg text-orange-600">{checkout.publicCheckoutId}</span>
                        <span
                            className={`px-2.5 py-0.5 text-xs font-semibold rounded-full capitalize ${
                                checkout.status === 'abandoned'
                                    ? 'bg-amber-100 text-amber-700'
                                    : checkout.status === 'converted'
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : checkout.status === 'active'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-rose-100 text-rose-700'
                            }`}
                        >
                            {checkout.status === 'abandoned' ? 'Incomplete' : checkout.status}
                        </span>
                    </div>

                    <button
                        onClick={onClose}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <FiX className="text-xl" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto space-y-6 flex-1">
                    {/* Customer Information & Quick Recovery Actions */}
                    <div className="bg-orange-50/40 rounded-xl p-4 border border-orange-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-gray-900 font-semibold text-base">
                                <FiUser className="text-orange-500" />
                                <span>{checkout.customer.name}</span>
                            </div>
                            {checkout.customer.phone && (
                                <div className="flex items-center gap-2 text-sm text-gray-600 font-mono">
                                    <FiPhone className="text-gray-400" />
                                    <span>{checkout.customer.phone}</span>
                                </div>
                            )}
                            {checkout.customer.address && (
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <FiMapPin className="text-gray-400" />
                                    <span>
                                        {checkout.customer.address}
                                        {checkout.customer.city ? `, ${checkout.customer.city}` : ''}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Direct Follow-up Actions */}
                        {checkout.customer.phone && checkout.status !== 'converted' && (
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <button
                                    onClick={handleCallClick}
                                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
                                >
                                    <FiPhone />
                                    <span>Call</span>
                                </button>
                                <button
                                    onClick={handleWhatsAppClick}
                                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
                                >
                                    <FaWhatsapp className="text-sm" />
                                    <span>WhatsApp</span>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Products in Cart */}
                    <div>
                        <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <FiShoppingBag className="text-orange-500" />
                            <span>Cart Products ({checkout.cartItems.length})</span>
                        </h4>

                        <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
                            {checkout.cartItems.map((item, idx) => (
                                <div key={idx} className="p-3.5 flex items-center justify-between hover:bg-gray-50/50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200">
                                            {item.image ? (
                                                <img
                                                    src={getProductImage(item.image)}
                                                    alt={item.title}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        (e.target as any).style.display = 'none';
                                                    }}
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                    <FiShoppingBag />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 leading-snug">{item.title}</p>
                                            <p className="text-xs text-gray-500">
                                                {formatBDT(item.unitPriceMinor / 100)} × {item.quantity}
                                                {item.variantId ? ` (${item.variantId})` : ''}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-sm font-semibold text-gray-800 font-mono">
                                        {formatBDT(item.subtotalMinor / 100)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Total Summary */}
                    <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                        <div className="flex justify-between text-gray-600">
                            <span>Subtotal:</span>
                            <span className="font-mono">{formatBDT(checkout.subtotal ?? checkout.total)}</span>
                        </div>
                        {checkout.deliveryFee ? (
                            <div className="flex justify-between text-gray-600">
                                <span>Delivery Fee:</span>
                                <span className="font-mono">{formatBDT(checkout.deliveryFee)}</span>
                            </div>
                        ) : null}
                        {checkout.discount ? (
                            <div className="flex justify-between text-emerald-600">
                                <span>Discount:</span>
                                <span className="font-mono">-{formatBDT(checkout.discount)}</span>
                            </div>
                        ) : null}
                        <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-gray-900 text-base">
                            <span>Total Recoverable Amount:</span>
                            <span className="text-orange-600 font-mono">{formatBDT(checkout.total)}</span>
                        </div>
                    </div>

                    {/* Recovery Activities Timeline */}
                    <div>
                        <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <FiClock className="text-orange-500" />
                            <span>Recovery History & Notes</span>
                        </h4>

                        {/* Add Note Form */}
                        <form onSubmit={handleAddNote} className="flex gap-2 mb-4">
                            <input
                                type="text"
                                placeholder="Add follow-up note (e.g. Customer promised to buy tomorrow)..."
                                value={noteText}
                                onChange={(e) => setNoteText(e.target.value)}
                                className="flex-1 px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                            />
                            <button
                                type="submit"
                                disabled={isSavingNote || !noteText.trim()}
                                className="px-4 py-2 bg-gray-800 hover:bg-gray-900 disabled:opacity-50 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all"
                            >
                                <FiPlus />
                                <span>Note</span>
                            </button>
                        </form>

                        {/* Activities List */}
                        <div className="space-y-2">
                            {checkout.activities && checkout.activities.length > 0 ? (
                                checkout.activities.map((act) => (
                                    <div
                                        key={act.id}
                                        className="p-3 bg-gray-50/70 border border-gray-100 rounded-lg flex items-start justify-between text-xs"
                                    >
                                        <div className="space-y-0.5">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-gray-800 capitalize">
                                                    {act.action.replace('_', ' ')}
                                                </span>
                                                <span className="text-gray-400">•</span>
                                                <span className="text-gray-500">by {act.adminName}</span>
                                            </div>
                                            {act.note && <p className="text-gray-600 italic">"{act.note}"</p>}
                                        </div>
                                        <span className="text-gray-400 font-mono text-[11px]">
                                            {new Date(act.createdAt).toLocaleString()}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-xs text-gray-400 italic">No recovery attempts recorded yet.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                    <div>
                        {checkout.status !== 'cancelled' && checkout.status !== 'converted' && (
                            <button
                                onClick={() => onCancelCheckout('Cancelled by admin')}
                                className="px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                            >
                                Mark as Cancelled
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-50 transition-all"
                        >
                            Close
                        </button>

                        {checkout.status !== 'converted' && (
                            <button
                                onClick={onConvertToOrder}
                                disabled={isConverting}
                                className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
                            >
                                <FiCheckCircle />
                                <span>{isConverting ? 'Converting...' : 'Convert to Official Order'}</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
