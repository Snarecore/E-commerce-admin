import React from 'react';
import { FiEye, FiSlash, FiTrash2, FiPhone, FiShoppingBag } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { IncompleteCheckoutItem } from '../../../../models/incomplete-checkout';
import { formatDistanceToNow, format } from 'date-fns';
import EmptyState from '../../../../components/empty-state/EmptyState';
import TableSkeleton from '../../../../components/skeleton/TableSkeleton';

const getProductImage = (img?: string | null): string => {
    if (!img) return '';
    return img;
};

interface CheckoutTableProps {
    items: IncompleteCheckoutItem[];
    isLoading?: boolean;
    onViewDetails: (item: IncompleteCheckoutItem) => void;
    onCancel: (item: IncompleteCheckoutItem) => void;
    onDelete: (item: IncompleteCheckoutItem) => void;
    onCall: (item: IncompleteCheckoutItem) => void;
    onWhatsApp: (item: IncompleteCheckoutItem) => void;
}

export const CheckoutTable: React.FC<CheckoutTableProps> = ({
    items,
    isLoading,
    onViewDetails,
    onCancel,
    onDelete,
    onCall,
    onWhatsApp,
}) => {
    const formatBDT = (amount: number = 0) => {
        return `৳${Number(amount || 0).toLocaleString('en-IN')}`;
    };

    const formatRelativeTime = (dateStr: string) => {
        try {
            return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
        } catch {
            return 'recently';
        }
    };

    const formatStartedDate = (dateStr: string) => {
        try {
            return format(new Date(dateStr), 'd MMM yyyy, h:mm a');
        } catch {
            return dateStr;
        }
    };

    if (isLoading) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
                <TableSkeleton />
            </div>
        );
    }

    if (!items || items.length === 0) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden p-6 sm:p-10">
                <EmptyState
                    title="No Incomplete Checkouts Found"
                    description="Try adjusting your filters, date range, or search keyword."
                />
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                    <thead>
                        <tr className="border-b border-gray-200 bg-gray-50/80 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                            <th className="py-3 px-3.5 sm:px-4">CHECKOUT ID</th>
                            <th className="py-3 px-3.5 sm:px-4">CUSTOMER</th>
                            <th className="py-3 px-3.5 sm:px-4">PRODUCTS</th>
                            <th className="py-3 px-3.5 sm:px-4">TOTAL</th>
                            <th className="py-3 px-3.5 sm:px-4">SOURCE</th>
                            <th className="py-3 px-3.5 sm:px-4">STARTED</th>
                            <th className="py-3 px-3.5 sm:px-4">LAST ACTIVITY</th>
                            <th className="py-3 px-3.5 sm:px-4">STATUS</th>
                            <th className="py-3 px-3.5 sm:px-4 text-center">ACTIONS</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100 text-gray-700">
                        {items.map((item) => {
                            const firstProduct = item.cartItems && item.cartItems.length > 0 ? item.cartItems[0] : null;
                            const additionalCount = (item.cartItems?.length || 0) - 1;

                            return (
                                <tr key={item.id} className="hover:bg-orange-50/20 transition-colors">
                                    {/* CHECKOUT ID */}
                                    <td className="py-3 px-3.5 sm:px-4 font-semibold text-orange-600 font-mono">
                                        <button
                                            onClick={() => onViewDetails(item)}
                                            className="hover:underline focus:outline-none cursor-pointer"
                                        >
                                            {item.publicCheckoutId}
                                        </button>
                                    </td>

                                    {/* CUSTOMER */}
                                    <td className="py-3 px-3.5 sm:px-4">
                                        <div className="font-medium text-gray-900">{item.customer.name}</div>
                                        <div className="text-gray-400 font-mono text-[11px]">
                                            {item.customer.phone || '—'}
                                        </div>
                                    </td>

                                    {/* PRODUCTS */}
                                    <td className="py-3 px-3.5 sm:px-4 max-w-xs">
                                        {firstProduct ? (
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-9 h-9 rounded-md bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200">
                                                    {firstProduct.image ? (
                                                        <img
                                                            src={getProductImage(firstProduct.image)}
                                                            alt={firstProduct.title}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                e.currentTarget.style.display = 'none';
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                            <FiShoppingBag />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="truncate">
                                                    <p className="font-medium text-gray-800 truncate" title={firstProduct.title}>
                                                        {firstProduct.title}
                                                    </p>
                                                    <p className="text-[11px] text-gray-500">
                                                        {firstProduct.variantId ? `${firstProduct.variantId} ` : ''}× {firstProduct.quantity}
                                                        {additionalCount > 0 && (
                                                            <span className="text-orange-600 font-semibold ml-1">
                                                                +{additionalCount} more
                                                            </span>
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="text-gray-400 italic">No products</span>
                                        )}
                                    </td>

                                    {/* TOTAL */}
                                    <td className="py-3 px-3.5 sm:px-4 font-bold text-gray-900 font-mono">
                                        {formatBDT(item.total)}
                                    </td>

                                    {/* SOURCE */}
                                    <td className="py-3 px-3.5 sm:px-4">
                                        {item.source.startsWith('/') ? (
                                            <span className="text-orange-600 hover:underline cursor-pointer font-medium">
                                                {item.source}
                                            </span>
                                        ) : (
                                            <span className="text-gray-600">{item.source}</span>
                                        )}
                                    </td>

                                    {/* STARTED */}
                                    <td className="py-3 px-3.5 sm:px-4 text-gray-600 whitespace-nowrap">
                                        {formatStartedDate(item.startedAt)}
                                    </td>

                                    {/* LAST ACTIVITY */}
                                    <td className="py-3 px-3.5 sm:px-4 text-gray-500 whitespace-nowrap">
                                        {formatRelativeTime(item.lastActivityAt)}
                                    </td>

                                    {/* STATUS */}
                                    <td className="py-3 px-3.5 sm:px-4">
                                        <span
                                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${
                                                item.status === 'abandoned'
                                                    ? 'bg-amber-100 text-amber-700'
                                                    : item.status === 'converted'
                                                    ? 'bg-emerald-100 text-emerald-700'
                                                    : item.status === 'active'
                                                    ? 'bg-blue-100 text-blue-700'
                                                    : item.status === 'cancelled'
                                                    ? 'bg-rose-100 text-rose-700'
                                                    : 'bg-gray-100 text-gray-600'
                                            }`}
                                        >
                                            {item.status === 'abandoned' ? 'Not ordered' : item.status}
                                        </span>
                                    </td>

                                    {/* ACTIONS */}
                                    <td className="py-3 px-3.5 sm:px-4">
                                        <div className="flex items-center justify-center gap-1">
                                            {/* View Details */}
                                            <button
                                                onClick={() => onViewDetails(item)}
                                                title="View Details"
                                                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
                                            >
                                                <FiEye className="text-sm" />
                                            </button>

                                            {/* Direct Call */}
                                            {item.recovery?.actions?.canCall && (
                                                <button
                                                    onClick={() => onCall(item)}
                                                    title={`Call ${item.recovery.phone || item.customer.phone}`}
                                                    className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                                                >
                                                    <FiPhone className="text-sm" />
                                                </button>
                                            )}

                                            {/* WhatsApp */}
                                            {item.recovery?.actions?.canWhatsApp && (
                                                <button
                                                    onClick={() => onWhatsApp(item)}
                                                    title={`WhatsApp ${item.recovery.phone || item.customer.phone}`}
                                                    className="p-1.5 text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors cursor-pointer"
                                                >
                                                    <FaWhatsapp className="text-sm" />
                                                </button>
                                            )}

                                            {/* Cancel/Block */}
                                            {item.recovery?.actions?.canCancel && (
                                                <button
                                                    onClick={() => onCancel(item)}
                                                    title="Cancel Checkout"
                                                    className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                                                >
                                                    <FiSlash className="text-sm" />
                                                </button>
                                            )}

                                            {/* Delete */}
                                            <button
                                                onClick={() => onDelete(item)}
                                                title="Delete Record"
                                                className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                                            >
                                                <FiTrash2 className="text-sm" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
