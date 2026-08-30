const MegaDiscountSkeleton = () => {
    return (
        <div className="flex flex-col gap-6 animate-pulse">
            {/* Status Toggle Card Skeleton */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="w-13 h-13 bg-gray-200 rounded-2xl shrink-0"></div>
                    <div className="flex flex-col gap-2 w-full">
                        <div className="flex items-center gap-2">
                            <div className="h-5 w-48 bg-gray-200 rounded"></div>
                            <div className="h-4 w-16 bg-gray-200 rounded-full"></div>
                        </div>
                        <div className="h-3.5 w-64 md:w-96 bg-gray-200 rounded"></div>
                    </div>
                </div>

                <div className="flex items-center gap-3 self-end md:self-center">
                    <div className="h-4 w-6 bg-gray-200 rounded"></div>
                    <div className="w-11 h-6 bg-gray-200 rounded-full"></div>
                </div>
            </div>

            {/* Configuration Form Inputs Skeleton */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col gap-6">
                <div className="h-4 w-56 bg-gray-200 rounded pb-3 border-b border-gray-100"></div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Input 1 Skeleton */}
                    <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                            <div className="h-3.5 w-36 bg-gray-200 rounded"></div>
                        </div>
                        <div className="h-11 w-full bg-gray-200 rounded-xl"></div>
                        <div className="h-3 w-64 bg-gray-200 rounded"></div>
                    </div>

                    {/* Input 2 Skeleton */}
                    <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                            <div className="h-3.5 w-36 bg-gray-200 rounded"></div>
                            <div className="h-3 w-16 bg-gray-200 rounded"></div>
                        </div>
                        <div className="h-11 w-full bg-gray-200 rounded-xl"></div>
                        <div className="h-3 w-64 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>

            {/* Visual Live Previews Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Preview 1 Skeleton */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col gap-3">
                    <div className="h-3.5 w-36 bg-gray-200 rounded"></div>
                    <div className="h-12 w-full bg-gray-200 rounded-xl"></div>
                </div>

                {/* Preview 2 Skeleton */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col gap-3">
                    <div className="h-3.5 w-44 bg-gray-200 rounded"></div>
                    <div className="h-12 w-full bg-gray-200 rounded-xl"></div>
                </div>
            </div>

            {/* Bottom Actions Skeleton */}
            <div className="flex items-center justify-end gap-4 pt-2">
                <div className="h-9 w-20 bg-gray-200 rounded-xl"></div>
                <div className="h-9 w-32 bg-gray-200 rounded-xl"></div>
            </div>
        </div>
    );
};

export default MegaDiscountSkeleton;
