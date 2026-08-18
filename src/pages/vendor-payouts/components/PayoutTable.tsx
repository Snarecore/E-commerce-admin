import { FiDownload } from "react-icons/fi";
import EmptyState from "../../../components/empty-state/EmptyState";
import Pagination from "../../../components/pagination";
import { formatPrettyDateWithTime } from "../../../utils/date-utils";
import { FaEllipsisVertical } from "react-icons/fa6";
import { useEffect, useMemo, useState } from "react";
import apiConfig from "../../../config/api.json";
import { useAPI } from "../../../hooks/useApi";
import DropdownFilter from "../../../components/table-components/DropdownFilter";
import RefreshButton from "../../../components/table-components/RefreshButton";
import { FaEye } from "react-icons/fa";
import VendorPayoutModal from "../../../components/modals/VendorPayoutModal";

interface SubscriptionDataProps {
    id: string;
    status: string;
    amount: string;
    createdAt: string;
    approvedAt: string;
    paidAt: string;
    invoiceUrl: string;
    vendorProfile?: {
        accountNumber?: string;
        accountHolderName?: string;
        bankName?: string;
        branchName?: string;
        IBAN?: string;
        swiftCode?: string;
        country?: string;
        paypalEmailAddress?: string;
    };
}

interface SubscriptionTableProps {
    dataList: SubscriptionDataProps[];
    fetchPayoutList: () => void;
    isLoading?: boolean;
    isFetching?: boolean;
    pageCount: number;
    currentPageNumber: number;
    setCurrentPageNumber: React.Dispatch<React.SetStateAction<number>>;
    handlePagination: (paginationData: { selected: number }) => void;
    onEdit: (data?: SubscriptionDataProps) => void;
    selectedFilters: {
        vendorId: { label: string; value: string } | null;
    };
    setSelectedFilters: React.Dispatch<React.SetStateAction<{
        vendorId: { label: string; value: string } | null;
    }>>
}

const VendorSubscriptionPayoutTable = ({
    dataList, pageCount, currentPageNumber, setCurrentPageNumber, handlePagination, onEdit, selectedFilters, setSelectedFilters
}: SubscriptionTableProps) => {

    const tableHeaders = [
        { key: "serial", label: "SL" },
        { key: "amount", label: "Amount" },
        { key: "status", label: "Status" },
        { key: "requestedAt", label: "Requested At" },
        { key: "approvedAt", label: "Approved At" },
        { key: "paidAt", label: "Paid At" },
        { key: "invoice", label: "Invoice" },
        { key: "actions", label: "Actions" }
    ];
    const { fetchData } = useAPI();

    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [vendorList, setVendorList] = useState<{ label: string, value: string }[]>([]);
    const vendorListUrl = apiConfig.site.vendorListUrl;
    const [vendorPaymentInfo, setVendorPaymentInfo] = useState<SubscriptionDataProps | null>(null);
    const [vendorPaymentInfoModal, setVendorPaymentInfoModal] = useState(false);


    const fetchVendorData = async () => {
        try {
            const result = await fetchData({ apiUrl: vendorListUrl });
            setVendorList(result.vendorList.map((vendor: any) => ({ label: vendor.name, value: vendor.id })));
        } catch (error) {
            console.error("Failed to fetch vendor data:", error);
        }
    };

    useEffect(() => {
        fetchVendorData();
    }, [])

    const dropdownOptions = useMemo(() => {
        return {
            vendorId: vendorList,
        };
    }, [vendorList]);

    const handleRefreshButton = () => {
        setSelectedFilters({
            vendorId: null,
        });
        setOpenDropdown(null);
    };

    // if (isFetching || isLoading) return <TableSkeleton />;

    return (
        <div className="p-6 bg-white rounded-lg border border-gray-200">
            <div className="flex justify-end flex-wrap space-y-4">
                <div className="flex flex-wrap gap-2">
                    {(Object.entries(dropdownOptions) as [keyof typeof selectedFilters, any][]).map(([key, options]) => (
                        <DropdownFilter
                            key={key}
                            title={
                                key ===
                                    "vendorId"
                                    ? "Vendor" : ""
                            }
                            options={options}
                            selectedOption={selectedFilters[key]}
                            isOpen={openDropdown === key}
                            onToggle={() => setOpenDropdown(openDropdown === key ? null : key)}
                            onSelect={(selected) => {
                                setSelectedFilters(prev => ({ ...prev, [key]: selected }));
                                setCurrentPageNumber(1);
                                setOpenDropdown(null);
                            }}
                        />

                    ))}
                    <RefreshButton onClick={handleRefreshButton} />
                </div>
            </div>

            <div className="mt-4 w-full overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[900px]">
                    <thead className="bg-gray-100">
                        <tr className="text-gray-600 text-sm border-b border-gray-200">
                            {tableHeaders.map(({ key, label }) => (
                                <th key={key} className="px-6 py-4 text-left text-[#000000e0]">
                                    {label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 rounded-lg">
                        {dataList?.length > 0 ? (
                            dataList?.map((data, index) => (
                                <tr
                                    key={data.id}
                                    className="border-b border-gray-100 hover:bg-gray-50 transition duration-300"
                                >
                                    <td className="px-6 py-4 font-medium ">
                                        {index + 1}
                                    </td>

                                    <td className="px-6 py-4 font-medium">
                                        ${data?.amount}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-semibold ${data.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : data.status === 'APPROVED' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}
                                        >
                                            {data.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {formatPrettyDateWithTime(data.createdAt)}
                                    </td>
                                    <td className="px-6 py-4">
                                        {data.approvedAt ? formatPrettyDateWithTime(data.approvedAt) : "N/A"}
                                    </td>
                                    <td className="px-6 py-4">
                                        {data.paidAt ? formatPrettyDateWithTime(data.paidAt) : "N/A"}
                                    </td>
                                    <td className="px-6 py-4">
                                        {data.invoiceUrl ? (
                                            <a href={data.invoiceUrl} download target="_blank" rel="noopener noreferrer">
                                                <FiDownload className="cursor-pointer text-blue-500 hover:text-blue-700" size={20} />
                                            </a>
                                        ) : (
                                            "N/A"
                                        )}
                                    </td>

                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => {
                                                    setVendorPaymentInfo(data);
                                                    setVendorPaymentInfoModal(true);
                                                }}
                                                className="border border-gray-300 text-gray-700 hover:text-[var(--color-primary)] hover:bg-gray-200 cursor-pointer p-2 rounded-md transition duration-300"
                                            >
                                                <FaEye />
                                            </button>
                                            <button
                                                onClick={() => onEdit(data)}
                                                className="border border-gray-300 text-gray-700 hover:text-[var(--color-primary)] hover:bg-gray-200 cursor-pointer p-2 rounded-md transition duration-300"
                                            >
                                                <FaEllipsisVertical />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={tableHeaders.length}
                                    className="px-6 py-4 text-center italic"
                                >
                                    <EmptyState title="No vendor subscription available" description="Talk with vendors to get their first subscriptions!" />
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {
                pageCount > 1 && (
                    <div className="flex justify-center">
                        <Pagination
                            pageCount={pageCount}
                            currentPageNumber={currentPageNumber}
                            handlePagination={handlePagination}
                        />
                    </div>
                )
            }

            {vendorPaymentInfoModal && vendorPaymentInfo && (
                <VendorPayoutModal
                    isOpen={vendorPaymentInfoModal}
                    onClose={() => setVendorPaymentInfoModal(false)}
                    title="Bank Account Information"
                >
                    <div className="space-y-6">
                        <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                </svg>
                                Account Details
                            </p>
                            <div className="grid grid-cols-1 gap-4">
                                <div className="flex justify-between items-center py-3 border-b border-gray-200 last:border-b-0">
                                    <span className="font-medium text-gray-700 flex items-center">
                                        <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        Account Holder
                                    </span>
                                    <span className="text-gray-900 font-medium">{vendorPaymentInfo?.vendorProfile?.accountHolderName || 'N/A'}</span>
                                </div>
                                {
                                    vendorPaymentInfo?.vendorProfile?.accountNumber ? (
                                        <div className="flex justify-between items-center py-3 border-b border-gray-200 last:border-b-0">
                                            <span className="font-medium text-gray-700 flex items-center">
                                                <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                Account Number
                                            </span>
                                            <span className="text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded text-sm">{vendorPaymentInfo?.vendorProfile?.accountNumber || 'N/A'}</span>
                                        </div>
                                    ) : (
                                        <div className="flex justify-between items-center py-3 border-b border-gray-200 last:border-b-0">
                                            <span className="font-medium text-gray-700 flex items-center">
                                                <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                IBAN
                                            </span>
                                            <span className="text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded text-sm">{vendorPaymentInfo?.vendorProfile?.IBAN || 'N/A'}</span>
                                        </div>
                                    )
                                }
                                <div className="flex justify-between items-center py-3 border-b border-gray-200 last:border-b-0">
                                    <span className="font-medium text-gray-700 flex items-center">
                                        <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                        Bank Name
                                    </span>
                                    <span className="text-gray-900">{vendorPaymentInfo?.vendorProfile?.bankName || 'N/A'}</span>
                                </div>
                                {vendorPaymentInfo?.vendorProfile?.branchName && (
                                    <div className="flex justify-between items-center py-3 border-b border-gray-200 last:border-b-0">
                                        <span className="font-medium text-gray-700 flex items-center">
                                            <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            Branch Name
                                        </span>
                                        <span className="text-gray-900">{vendorPaymentInfo.vendorProfile.branchName}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* PayPal Details */}
                        {vendorPaymentInfo?.vendorProfile?.paypalEmailAddress && (
                            <div className="bg-orange-50 rounded-lg p-4">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                    <svg className="w-5 h-5 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    PayPal Information
                                </h3>
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="flex justify-between items-center py-3 border-b border-orange-200 last:border-b-0">
                                        <span className="font-medium text-gray-700 flex items-center">
                                            <svg className="w-4 h-4 mr-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                            </svg>
                                            PayPal Email
                                        </span>
                                        <span className="text-gray-900 font-medium">{vendorPaymentInfo.vendorProfile.paypalEmailAddress === "null" ? "N/A" : vendorPaymentInfo.vendorProfile.paypalEmailAddress}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="bg-blue-50 rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                International Banking
                            </h3>
                            <div className="grid grid-cols-1 gap-4">
                                {vendorPaymentInfo?.vendorProfile?.IBAN && (
                                    <div className="flex justify-between items-center py-3 border-b border-blue-200 last:border-b-0">
                                        <span className="font-medium text-gray-700 flex items-center">
                                            <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            IBAN
                                        </span>
                                        <span className="text-gray-900 font-mono bg-blue-100 px-2 py-1 rounded text-sm">{vendorPaymentInfo.vendorProfile.IBAN}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center py-3 border-b border-blue-200 last:border-b-0">
                                    <span className="font-medium text-gray-700 flex items-center">
                                        <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                        SWIFT Code
                                    </span>
                                    <span className="text-gray-900 font-mono bg-blue-100 px-2 py-1 rounded text-sm">{vendorPaymentInfo?.vendorProfile?.swiftCode || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between items-center py-3 border-b border-blue-200 last:border-b-0">
                                    <span className="font-medium text-gray-700 flex items-center">
                                        <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Country
                                    </span>
                                    <span className="text-gray-900">{vendorPaymentInfo?.vendorProfile?.country || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </VendorPayoutModal>
            )}
        </div >
    );
};

export default VendorSubscriptionPayoutTable;
