import { useParams } from "react-router-dom";
import PageHeader from "../../../../components/cards/PageHeader";
import ProductImageSlider from "./ProductImageSlider";
import { useEffect, useState } from "react";
import apiConfig from "../../../../config/api.json";
import { useAPI } from "../../../../hooks/useApi";

interface Product {
    name: string;
    sku: string;
    mainCategoryName: string;
    firstCategoryName: string;
    secondCategoryName: string;
    price: number;
    cost: number;
    discountAmount: number;
    discountType: string;
    vendorName: string;
    isBestSeller: boolean;
    isRecommended: boolean;
    isNew: boolean;
    videoUrl: string;
    summary: string;
    description: string;
    featuredImage: string;
    productImages: Array<{
        id: string;
        imageUrl: string;
        createdAt: string;
        updatedAt: string;
        isDeleted: boolean;
        productId: string;
    }>;
    sizes?: string[] | string;
    quantity?: number;
    quantityAlert?: number;
}

const ProductDetails = () => {
    const { id } = useParams();
    const [product, setProduct] = useState<Product | null>(null);
    const [selectedSize, setSelectedSize] = useState<string | null>("M");
    const apiUrl = `${apiConfig.inventory.productUrl}/${id}`;
    const { fetchData } = useAPI();

    const fetchProductData = async () => {
        const result = await fetchData({ apiUrl: apiUrl });
        setProduct(result);
    };

    useEffect(() => {
        fetchProductData();
    }, []);

    if (!product) {
        return (
            <div className="flex justify-center items-center h-96">
                <p className="text-gray-500 font-medium animate-pulse">Loading Product Details...</p>
            </div>
        );
    }

    // Helper to parse available sizes
    const getAvailableSizes = (): string[] => {
        if (!product.sizes) return ["S", "M", "L", "XL", "XXL"]; // Default to all if not saved
        if (Array.isArray(product.sizes)) return product.sizes;
        if (typeof product.sizes === "string") {
            return product.sizes.split(",").map((s) => s.trim()).filter((s) => s);
        }
        return ["S", "M", "L", "XL", "XXL"];
    };

    const availableSizes = getAvailableSizes();

    const calculateDiscountedPrice = () => {
        const price = Number(product.price) || 0;
        const discount = Number(product.discountAmount) || 0;
        if (discount <= 0) return price;

        const typeLower = product.discountType?.toLowerCase() || "";
        if (typeLower.includes("percentage") || typeLower.includes("percent") || typeLower.includes("1")) {
            return price - (price * discount) / 100;
        } else if (typeLower.includes("fixed") || typeLower.includes("flat") || typeLower.includes("amount") || typeLower.includes("2")) {
            return price - discount;
        }
        return price - (price * discount) / 100; // Default fallback
    };

    const discountedPrice = calculateDiscountedPrice();
    const hasDiscount = Number(product.discountAmount) > 0;

    // Split summary by comma or newline
    const summaryItems = product.summary
        ? product.summary
              .split(/[\n,]/)
              .map((item) => item.trim())
              .filter((item) => item !== "")
        : [];

    return (
        <div className="flex flex-col gap-6">
            <div>
                <PageHeader
                    headerTitle="Product Details"
                    headerDescription="Full details of a product in premium layout"
                />
            </div>

            {/* Breadcrumb Info */}
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5 px-1">
                <span>{product.mainCategoryName}</span>
                {product.firstCategoryName && (
                    <>
                        <span>&gt;</span>
                        <span>{product.firstCategoryName}</span>
                    </>
                )}
                {product.secondCategoryName && (
                    <>
                        <span>&gt;</span>
                        <span>{product.secondCategoryName}</span>
                    </>
                )}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden p-6 md:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
                    
                    {/* Left Column: Image Section */}
                    <div className="lg:col-span-6 flex flex-col gap-6">
                        <div className="relative rounded-2xl border border-gray-100 overflow-hidden bg-gray-50 flex items-center justify-center max-h-[500px]">
                            {/* Badges overlay */}
                            <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5">
                                {product.isNew && (
                                    <span className="bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
                                        New
                                    </span>
                                )}
                                {product.isBestSeller && (
                                    <span className="bg-amber-500 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
                                        Best Seller
                                    </span>
                                )}
                                {product.isRecommended && (
                                    <span className="bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
                                        Recommended
                                    </span>
                                )}
                            </div>

                            <img
                                src={product.featuredImage}
                                alt={product.name}
                                className="w-full h-full object-cover transition duration-500 hover:scale-105"
                            />
                        </div>

                        {/* Additional images gallery slider */}
                        {product.productImages && product.productImages.length > 0 && (
                            <div className="rounded-xl overflow-hidden border border-gray-100 p-2 bg-gray-50">
                                <ProductImageSlider images={product.productImages.map(img => img.imageUrl)} />
                            </div>
                        )}
                    </div>

                    {/* Right Column: Content Section */}
                    <div className="lg:col-span-6 flex flex-col justify-between">
                        <div>
                            {/* SKU badge & Stock status */}
                            <div className="flex items-center gap-2 mb-3 flex-wrap">
                                <div className="inline-block bg-gray-100 text-gray-700 text-[11px] font-mono px-2.5 py-1 rounded-md">
                                    SKU: {product.sku}
                                </div>
                                {Number(product.quantity) === 0 ? (
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                                        Out of Stock
                                    </span>
                                ) : Number(product.quantity) <= Number(product.quantityAlert || 5) ? (
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                                        Low Stock ({product.quantity} left)
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                                        In Stock ({product.quantity})
                                    </span>
                                )}
                            </div>

                            {/* Product Name */}
                            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight mb-4">
                                {product.name}
                            </h1>

                            {/* Pricing Section */}
                            <div className="flex items-center gap-3.5 mb-6 py-2 border-y border-gray-100">
                                {hasDiscount ? (
                                    <>
                                        <span className="text-3xl font-black text-[var(--color-primary)]">
                                            {discountedPrice.toFixed(2)}
                                        </span>
                                        <span className="text-lg font-bold text-gray-400 line-through">
                                            {Number(product.price).toFixed(2)}
                                        </span>
                                        <span className="bg-red-50 text-red-600 text-xs font-extrabold px-2.5 py-1 rounded-md border border-red-100">
                                             {product.discountType?.toLowerCase().includes("percentage") || product.discountType?.toLowerCase().includes("percent") || product.discountType?.toLowerCase().includes("1")
                                                 ? `${product.discountAmount}% OFF`
                                                 : `${product.discountAmount} OFF`}
                                         </span>
                                    </>
                                ) : (
                                    <span className="text-3xl font-black text-gray-900">
                                        {Number(product.price).toFixed(2)}
                                    </span>
                                )}
                            </div>

                            {/* Size Selector */}
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                                        Size
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    {["S", "M", "L", "XL", "XXL"].map((size) => {
                                        const isAvailable = availableSizes.includes(size);
                                        const isSelected = selectedSize === size;
                                        return (
                                            <button
                                                key={size}
                                                disabled={!isAvailable}
                                                onClick={() => setSelectedSize(size)}
                                                className={`relative w-12 h-12 flex items-center justify-center rounded-full border text-sm font-bold transition-all duration-200
                                                    ${isAvailable
                                                        ? isSelected
                                                            ? "border-black bg-black text-white shadow-sm scale-105"
                                                            : "border-gray-300 bg-white text-gray-950 hover:border-black cursor-pointer"
                                                        : "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
                                                    }`}
                                            >
                                                <span className={!isAvailable ? "line-through opacity-40" : ""}>
                                                    {size}
                                                </span>
                                                {/* Diagonal strike-through line for unavailable sizes */}
                                                {!isAvailable && (
                                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                        <div className="w-full h-[1px] bg-gray-400 rotate-45"></div>
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Product Summary */}
                            {summaryItems.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">
                                        Quick Highlights
                                    </h3>
                                    <ul className="list-disc list-inside space-y-1.5 text-sm text-gray-600">
                                        {summaryItems.map((item, index) => (
                                            <li key={index} className="leading-relaxed">
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        {/* Video URL Link */}
                        {product.videoUrl && (
                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">
                                    Product Video
                                </h3>
                                <a
                                    href={product.videoUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center text-sm font-bold text-[var(--color-primary)] hover:underline"
                                >
                                    Watch Video Walkthrough &rarr;
                                </a>
                            </div>
                        )}
                    </div>
                </div>

                {/* Description Accordion/Section */}
                {product.description && (
                    <div className="mt-12 pt-8 border-t border-gray-100">
                        <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wide mb-4">
                            Detailed Description
                        </h2>
                        <div
                            className="prose prose-sm max-w-none text-gray-600 leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: product.description }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductDetails;