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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* 1. INCOMPLETE CARD */}
            <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
                <div>
                    <p className="text-xs font-semibold tracking-wider text-gray-500 uppercase">INCOMPLETE</p>
                    <h3 className="text-2xl font-bold text-gray-800 mt-1">
                        {isLoading ? '...' : (stats?.abandonedCount ?? 0)}
                    </h3>
                </div>
                <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 text-xl">
                    <FiShoppingCart />
                </div>
            </div>

            {/* 2. RECOVERABLE VALUE CARD */}
            <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
                <div>
                    <p className="text-xs font-semibold tracking-wider text-gray-500 uppercase">RECOVERABLE VALUE</p>
                    <h3 className="text-2xl font-bold text-gray-800 mt-1">
                        {isLoading ? '...' : formatBDT(stats?.recoverableValue)}
                    </h3>
                </div>
                <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 text-xl">
                    <IoWalletOutline />
                </div>
            </div>

            {/* 3. CONVERTED CARD */}
            <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
                <div>
                    <p className="text-xs font-semibold tracking-wider text-gray-500 uppercase">CONVERTED</p>
                    <h3 className="text-2xl font-bold text-gray-800 mt-1">
                        {isLoading ? '...' : (stats?.convertedCount ?? 0)}
                    </h3>
                </div>
                <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 text-xl">
                    <FiCheckCircle />
                </div>
            </div>

            {/* 4. CANCELLED CARD */}
            <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
                <div>
                    <p className="text-xs font-semibold tracking-wider text-gray-500 uppercase">CANCELLED</p>
                    <h3 className="text-2xl font-bold text-gray-800 mt-1">
                        {isLoading ? '...' : (stats?.cancelledCount ?? 0)}
                    </h3>
                </div>
                <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 text-xl">
                    <FiXCircle />
                </div>
            </div>
        </div>
    );
};
