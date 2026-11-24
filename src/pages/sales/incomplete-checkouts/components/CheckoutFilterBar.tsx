import React, { useEffect, useState } from 'react';
import { FiSearch, FiFilter, FiRefreshCw } from 'react-icons/fi';
import { IncompleteCheckoutFilter } from '../../../../models/incomplete-checkout';

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
    const [fromDate, setFromDate] = useState(filter.fromDate || '');
    const [toDate, setToDate] = useState(filter.toDate || '');

    useEffect(() => {
        setSearch(filter.search || '');
        setFromDate(filter.fromDate || '');
        setToDate(filter.toDate || '');
    }, [filter.search, filter.fromDate, filter.toDate]);

    const handleApply = (e: React.FormEvent) => {
        e.preventDefault();
        onFilterChange({
            ...filter,
            search: search.trim() || undefined,
            fromDate: fromDate || undefined,
            toDate: toDate || undefined,
            page: 1,
        });
    };

    const handleReset = () => {
        setSearch('');
        setFromDate('');
        setToDate('');
        onReset();
    };

    return (
        <form onSubmit={handleApply} className="bg-white rounded-xl p-3 sm:p-3.5 border border-gray-200 shadow-2xs">
            <div className="flex flex-col sm:flex-row items-center gap-2.5">
                {/* Search Input */}
                <div className="relative flex-1 w-full">
                    <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                    <input
                        type="text"
                        placeholder="Search by customer name, phone, email, address, checkout ID..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full h-10 pl-9.5 pr-4 bg-gray-50/60 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    />
                </div>

                {/* From Date */}
                <div className="relative w-full sm:w-44">
                    <input
                        type="date"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        className="w-full h-10 px-3 bg-gray-50/60 border border-gray-200 rounded-lg text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                        title="Start Date"
                    />
                </div>

                {/* To Date */}
                <div className="relative w-full sm:w-44">
                    <input
                        type="date"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        className="w-full h-10 px-3 bg-gray-50/60 border border-gray-200 rounded-lg text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                        title="End Date"
                    />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 sm:flex-none h-10 px-4.5 flex items-center justify-center gap-1.5 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                    >
                        <FiFilter className="text-sm" />
                        <span>Filter</span>
                    </button>

                    <button
                        type="button"
                        onClick={handleReset}
                        title="Reset Filter"
                        className="h-10 w-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors cursor-pointer shrink-0"
                    >
                        <FiRefreshCw className="text-sm" />
                    </button>
                </div>
            </div>
        </form>
    );
};
