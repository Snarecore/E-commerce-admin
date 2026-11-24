import React from 'react';
import { FiShoppingCart, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { IoWalletOutline } from 'react-icons/io5';
import { IncompleteCheckoutStats } from '../../../../models/incomplete-checkout';

interface CheckoutKpiCardsProps {
    stats?: IncompleteCheckoutStats;
    isLoading?: boolean;
}

export const CheckoutKpiCards: React.FC<CheckoutKpiCardsProps> = ({ stats, isLoading }) => {
    const formatBDT = (amount: number = 0) => {
        return `৳${Number(amount || 0).toLocaleString('en-IN')}`;
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* 1. INCOMPLETE CARD */}
            <div className="bg-white rounded-xl p-4 sm:p-4.5 border border-gray-200 shadow-2xs flex items-center justify-between transition-all duration-200 hover:shadow-xs">
                <div>
                    <p className="text-[11px] font-semibold tracking-wider text-gray-500 uppercase">INCOMPLETE</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1 tracking-tight">
                        {isLoading ? '...' : (stats?.abandonedCount ?? 0)}
                    </h3>
                </div>
                <div className="w-11 h-11 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-500 text-xl shadow-2xs">
                    <FiShoppingCart />
                </div>
            </div>

            {/* 2. RECOVERABLE VALUE CARD */}
            <div className="bg-white rounded-xl p-4 sm:p-4.5 border border-gray-200 shadow-2xs flex items-center justify-between transition-all duration-200 hover:shadow-xs">
                <div>
                    <p className="text-[11px] font-semibold tracking-wider text-gray-500 uppercase">RECOVERABLE VALUE</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1 tracking-tight">
                        {isLoading ? '...' : formatBDT(stats?.recoverableValue)}
                    </h3>
                </div>
                <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500 text-xl shadow-2xs">
                    <IoWalletOutline />
                </div>
            </div>

            {/* 3. CONVERTED CARD */}
            <div className="bg-white rounded-xl p-4 sm:p-4.5 border border-gray-200 shadow-2xs flex items-center justify-between transition-all duration-200 hover:shadow-xs">
                <div>
                    <p className="text-[11px] font-semibold tracking-wider text-gray-500 uppercase">CONVERTED</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1 tracking-tight">
                        {isLoading ? '...' : (stats?.convertedCount ?? 0)}
                    </h3>
                </div>
                <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500 text-xl shadow-2xs">
                    <FiCheckCircle />
                </div>
            </div>

            {/* 4. CANCELLED CARD */}
            <div className="bg-white rounded-xl p-4 sm:p-4.5 border border-gray-200 shadow-2xs flex items-center justify-between transition-all duration-200 hover:shadow-xs">
                <div>
                    <p className="text-[11px] font-semibold tracking-wider text-gray-500 uppercase">CANCELLED</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1 tracking-tight">
                        {isLoading ? '...' : (stats?.cancelledCount ?? 0)}
                    </h3>
                </div>
                <div className="w-11 h-11 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 text-xl shadow-2xs">
                    <FiXCircle />
                </div>
            </div>
        </div>
    );
};
