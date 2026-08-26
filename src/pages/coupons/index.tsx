import { useEffect, useState } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiCopy, FiCheck } from "react-icons/fi";
import { useAPI } from "../../hooks/useApi";
import apiConfig from "../../config/api.json";
import PageHeader from "../../components/cards/PageHeader";
import TableSkeleton from "../../components/skeleton/TableSkeleton";
import EmptyState from "../../components/empty-state/EmptyState";
import DeleteModal from "../../components/modals/DeleteModal";
import CouponModal from "./components/CouponModal";
import ToggleButton from "../../components/Inputs/ToggleButton";

interface CouponItem {
    id: string;
    code: string;
    description?: string;
    discountType: "PERCENTAGE" | "FIXED_AMOUNT" | "FREE_SHIPPING";
    discountValue: number;
    minOrderAmount: number;
    maxDiscountAmount?: number;
    startDate?: string;
    endDate?: string;
    usageLimit?: number;
    userUsageLimit: number;
    usageCount: number;
    isActive: boolean;
    createdAt?: string;
}

const CouponsPage = () => {
    const { fetchData, handleApiMutation, postMutation, patchMutation, handleDeleteAPI } = useAPI();
    const apiUrl = apiConfig.order.couponUrl;

    const [coupons, setCoupons] = useState<CouponItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCoupon, setSelectedCoupon] = useState<CouponItem | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [couponToDelete, setCouponToDelete] = useState<CouponItem | null>(null);
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    const loadCoupons = async () => {
        setIsLoading(true);
        try {
            const res: any = await fetchData({ apiUrl: `${apiUrl}?limit=100` });
            const list = res?.data?.data || res?.data || res || [];
            setCoupons(Array.isArray(list) ? list : []);
        } catch (err) {
            console.error("Failed to fetch coupons:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadCoupons();
    }, []);

    const handleCreateOrUpdate = async (formData: any) => {
        setIsSubmitting(true);
        try {
            const isEdit = !!selectedCoupon;
            const url = isEdit ? `${apiUrl}/${selectedCoupon.id}` : apiUrl;
            const mutation = isEdit ? patchMutation : postMutation;

            const res = await handleApiMutation({
                // @ts-ignore
                mutation,
                url,
                body: formData,
                showSuccessMessage: true,
                showErrorMessage: true,
                requiredFields: [],
            });

            if (res?.success || res?.data) {
                setIsModalOpen(false);
                setSelectedCoupon(null);
                loadCoupons();
            }
        } catch (err) {
            console.error("Coupon submit error:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleToggleActive = async (coupon: CouponItem) => {
        try {
            const res = await handleApiMutation({
                // @ts-ignore
                mutation: patchMutation,
                url: `${apiUrl}/${coupon.id}`,
                body: { isActive: !coupon.isActive },
                showSuccessMessage: false,
                showErrorMessage: true,
                requiredFields: [],
            });
            if (res?.success || res?.data) {
                setCoupons((prev) =>
                    prev.map((c) => (c.id === coupon.id ? { ...c, isActive: !c.isActive } : c))
                );
            }
        } catch (err) {
            console.error("Status toggle error:", err);
        }
    };

    const handleDeleteConfirm = async () => {
        if (!couponToDelete) return;
        try {
            await handleDeleteAPI({
                apiUrl: `${apiUrl}/${couponToDelete.id}`,
                // @ts-ignore
                refetchData: loadCoupons,
            });
        } catch (err) {
            console.error("Delete error:", err);
        } finally {
            setIsDeleteModalOpen(false);
            setCouponToDelete(null);
        }
    };

    const copyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const getDiscountLabel = (coupon: CouponItem) => {
        if (coupon.discountType === "PERCENTAGE") return `${coupon.discountValue}% OFF`;
        if (coupon.discountType === "FIXED_AMOUNT") return `৳${coupon.discountValue} OFF`;
        return "FREE SHIPPING";
    };

    return (
        <div className="flex flex-col gap-6 p-6">
            <PageHeader
                title="Coupons Management"
                subtitle="Create, configure and manage promotional discount coupons for checkout."
            >
                <button
                    onClick={() => {
                        setSelectedCoupon(null);
                        setIsModalOpen(true);
                    }}
                    className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-md transition cursor-pointer"
                >
                    <FiPlus className="w-4 h-4" />
                    Create Coupon
                </button>
            </PageHeader>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                {isLoading ? (
                    <TableSkeleton rows={5} columns={7} />
                ) : coupons.length === 0 ? (
                    <EmptyState
                        title="No Coupons Found"
                        message="Create your first promotional discount coupon to boost sales!"
                    />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-gray-600">
                            <thead className="bg-gray-50 border-b border-gray-200 text-gray-700 font-semibold">
                                <tr>
                                    <th className="py-3.5 px-4">Coupon Code</th>
                                    <th className="py-3.5 px-4">Discount</th>
                                    <th className="py-3.5 px-4">Min Subtotal</th>
                                    <th className="py-3.5 px-4">Validity Period</th>
                                    <th className="py-3.5 px-4">Redemptions</th>
                                    <th className="py-3.5 px-4">Active</th>
                                    <th className="py-3.5 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {coupons.map((coupon) => (
                                    <tr key={coupon.id} className="hover:bg-gray-50/60 transition">
                                        <td className="py-3.5 px-4 font-mono font-bold text-gray-900">
                                            <div className="flex items-center gap-2">
                                                <span className="bg-orange-50 text-orange-600 px-2.5 py-1 rounded-md border border-orange-200">
                                                    {coupon.code}
                                                </span>
                                                <button
                                                    onClick={() => copyCode(coupon.code)}
                                                    className="text-gray-400 hover:text-gray-600"
                                                    title="Copy Code"
                                                >
                                                    {copiedCode === coupon.code ? (
                                                        <FiCheck className="w-3.5 h-3.5 text-green-500" />
                                                    ) : (
                                                        <FiCopy className="w-3.5 h-3.5" />
                                                    )}
                                                </button>
                                            </div>
                                            {coupon.description && (
                                                <p className="text-[10px] text-gray-400 font-sans font-normal mt-0.5">
                                                    {coupon.description}
                                                </p>
                                            )}
                                        </td>
                                        <td className="py-3.5 px-4">
                                            <span className="font-bold text-gray-800">
                                                {getDiscountLabel(coupon)}
                                            </span>
                                            {coupon.discountType === "PERCENTAGE" && coupon.maxDiscountAmount && (
                                                <p className="text-[10px] text-gray-400">
                                                    Max ৳{coupon.maxDiscountAmount}
                                                </p>
                                            )}
                                        </td>
                                        <td className="py-3.5 px-4 font-semibold text-gray-700">
                                            {coupon.minOrderAmount > 0 ? `৳${coupon.minOrderAmount}` : "None"}
                                        </td>
                                        <td className="py-3.5 px-4 text-[11px] text-gray-500">
                                            {coupon.startDate || coupon.endDate ? (
                                                <div>
                                                    <p>From: {coupon.startDate ? new Date(coupon.startDate).toLocaleDateString() : "Any"}</p>
                                                    <p>Until: {coupon.endDate ? new Date(coupon.endDate).toLocaleDateString() : "Always"}</p>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400">Always Valid</span>
                                            )}
                                        </td>
                                        <td className="py-3.5 px-4 font-medium text-gray-700">
                                            <span className="font-bold text-gray-900">{coupon.usageCount}</span> /{" "}
                                            {coupon.usageLimit ? coupon.usageLimit : "∞"}
                                        </td>
                                        <td className="py-3.5 px-4">
                                            <ToggleButton
                                                name={`toggle-${coupon.id}`}
                                                checked={coupon.isActive}
                                                onChange={() => handleToggleActive(coupon)}
                                            />
                                        </td>
                                        <td className="py-3.5 px-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => {
                                                        setSelectedCoupon(coupon);
                                                        setIsModalOpen(true);
                                                    }}
                                                    className="p-1.5 text-gray-500 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition"
                                                    title="Edit Coupon"
                                                >
                                                    <FiEdit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setCouponToDelete(coupon);
                                                        setIsDeleteModalOpen(true);
                                                    }}
                                                    className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                                                    title="Delete Coupon"
                                                >
                                                    <FiTrash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <CouponModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedCoupon(null);
                }}
                onSubmit={handleCreateOrUpdate}
                initialData={selectedCoupon}
                isSubmitting={isSubmitting}
            />

            <DeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setCouponToDelete(null);
                }}
                onConfirm={handleDeleteConfirm}
                title="Delete Coupon"
                message={`Are you sure you want to delete coupon "${couponToDelete?.code}"? Existing historical orders will not be affected.`}
            />
        </div>
    );
};

export default CouponsPage;
