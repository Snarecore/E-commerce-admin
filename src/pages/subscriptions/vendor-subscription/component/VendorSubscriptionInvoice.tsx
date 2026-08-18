import { useParams } from "react-router-dom";
import { formatDate } from "../../../../utils/date-utils";
import { useEffect, useState } from "react";
import { useAPI } from "../../../../hooks/useApi";
import apiConfig from "../../../../config/api.json";
import PageHeader from "../../../../components/cards/PageHeader";

interface VendorSubscription {
    createdAt?: string;
    vendor?: {
        name?: string;
        email?: string;
        phone?: string;
    };
    tier?: {
        name?: string;
        durationInMonths?: number;
        commissionRate?: number;
        price?: number;
        discountAmount?: number;
    };
};

const VendorInvoiceView = () => {
    const { id } = useParams();
    const { fetchData } = useAPI();
    const [subscription, setSubcription] = useState<VendorSubscription>();
    useEffect(() => {
        const fetchVendorSingleSub = async () => {
            const response = await fetchData({ apiUrl: `${apiConfig.subscription.activeSingleSubcriptionUrl}/${id}` })
            setSubcription(response)
        }
        fetchVendorSingleSub();
    }, [id])

    return (
        <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between flex-wrap">
                <PageHeader
                    headerTitle="Subscription Invoice"
                    headerDescription="View subscription invoice details"
                />
            </div>
            <div className="grid grid-cols-12 gap-12 bg-white p-4 rounded-md border border-gray-300">
                <div className="col-span-12 xl:col-span-12">
                    <div className="grid grid-cols-1 pb-4 border-b border-gray-300">
                        <div className="flex items-center justify-between">
                            <p className="text-4xl font-bold text-[var(--color-primary)] mt-2">
                                Invoice
                            </p>
                            <p className="text-[var(--color-primary)] mt-2">
                                Date: {subscription?.createdAt ? formatDate(subscription.createdAt) : 'N/A'}
                            </p>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 mt-6">

                        <div>
                            <p className="text-xl font-semibold mb-2">Customer</p>
                            <p className="font-bold text-lg">Name: {subscription?.vendor?.name}</p>
                            <p className="font-medium">Email: {subscription?.vendor?.email}</p>
                            <p className="font-medium">Phone: {subscription?.vendor?.phone}</p>
                        </div>
                    </div>
                    <div className="mt-8">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-[#F9FAFB] text-md font-medium border-b border-gray-200">
                                    <th className="px-4 py-3 text-left">Tier Name</th>
                                    <th className="px-4 py-3 text-center">Duration</th>
                                    <th className="px-4 py-3 text-center">Commission Rate</th>
                                    <th className="px-4 py-3 text-center">Price</th>
                                    <th className="px-4 py-3 text-right">Sub Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-gray-200 text-sm">
                                    <td className="px-4 py-3 text-start">{subscription?.tier?.name}</td>
                                    <td className="px-4 py-3 text-center">{subscription?.tier?.durationInMonths} month</td>
                                    <td className="px-4 py-3 text-center">{subscription?.tier?.commissionRate}%</td>
                                    <td className="px-4 py-3 text-center">${subscription?.tier?.price}</td>
                                    <td className="px-4 py-3 text-end">${subscription?.tier?.price}</td>
                                </tr>

                                <tr>
                                    <td colSpan={4}></td>
                                    <td className="px-4 py-2 text-end">
                                        <div className="max-w-[500px] flex justify-between border-b border-gray-300 pb-1 text-sm font-bold">
                                            <span>Total Amount</span>
                                            <span>${subscription?.tier?.price ?? "0.00"}</span>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td colSpan={4}></td>
                                    <td className="px-4 py-2 text-end">
                                        <div className="ml-auto max-w-[500px] flex justify-between border-b border-gray-300 pb-1 text-sm font-bold">
                                            <span>Discount</span>
                                            <span>${subscription?.tier?.discountAmount ?? "0.00"}</span>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td colSpan={4}></td>
                                    <td className="px-4 py-3">
                                        <div className="ml-auto max-w-[500px] flex justify-between pb-1 text-base text-black font-bold">
                                            <span>Total Amount</span>
                                            <span>${subscription?.tier?.price ?? "0.00"}</span>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VendorInvoiceView;
