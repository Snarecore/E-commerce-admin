import React, { useState } from 'react';
import { FiSearch, FiFilter, FiRefreshCw } from 'react-icons/fi';
import { CheckoutStatus, IncompleteCheckoutFilter } from '../../../../models/incomplete-checkout';

interface CheckoutFilterBarProps {
    filter: IncompleteCheckoutFilter;
    onFilterChange: (newFilter: IncompleteCheckoutFilter) => void;
    onReset: () => void;
    isLoading?: boolean;
}

export const CheckoutFilterBar: React.FC<CheckoutFilterBarProps> = ({
    filter,
    onFilterChange,
    onReset,
    isLoading,
}) => {
    const [search, setSearch] = useState(filter.search || '');
    const [status, setStatus] = useState<string>(filter.status || 'abandoned');
    const [fromDate, setFromDate] = useState(filter.fromDate || '');
    const [toDate, setToDate] = useState(filter.toDate || '');

    const handleApply = (e: React.FormEvent) => {
        e.preventDefault();
        onFilterChange({
            search: search.trim() || undefined,
            status: status === 'all' ? undefined : (status as CheckoutStatus),
            fromDate: fromDate || undefined,
            toDate: toDate || undefined,
            page: 1,
        });
    };

    const handleReset = () => {
        setSearch('');
        setStatus('abandoned');
        setFromDate('');
        setToDate('');
        onReset();
    };

    return (
        <form onSubmit={handleApply} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm mb-6">
            <div className="flex flex-col lg:flex-row items-center gap-3">
                {/* Search Input */}
                <div className="relative flex-1 w-full">
                    <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
                    <input
                        type="text"
                        placeholder="Search name, phone, email, address"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50/70 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:text-gray-400"
                    />
                </div>

                {/* Status Dropdown */}
                <div className="w-full lg:w-48">
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-gray-50/70 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all cursor-pointer"
                    >
                        <option value="abandoned">Not ordered yet</option>
                        <option value="active">Active in checkout</option>
                        <option value="converted">Converted</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="expired">Expired</option>
                        <option value="all">All Checkouts</option>
                    </select>
                </div>

                {/* From Date */}
                <div className="relative w-full lg:w-44">
                    <input
                        type="date"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50/70 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    />
                </div>

                {/* To Date */}
                <div className="relative w-full lg:w-44">
                    <input
                        type="date"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50/70 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    />
                </div>

                {/* Filter & Reset Buttons */}
                <div className="flex items-center gap-2 w-full lg:w-auto">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white text-sm font-medium rounded-lg shadow-sm shadow-orange-500/20 transition-all cursor-pointer"
                    >
                        <FiFilter className="text-sm" />
                        <span>Filter</span>
                    </button>

                    <button
                        type="button"
                        onClick={handleReset}
                        title="Reset Filter"
                        className="p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-all cursor-pointer"
                    >
                        <FiRefreshCw className="text-base" />
                    </button>
                </div>
            </div>
        </form>
    );
};
