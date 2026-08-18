import { ChangeEvent, useState, useEffect } from "react";
import SelectInput from "../../../components/Inputs/SelectField";
import { RiArrowDropDownLine } from "react-icons/ri";
import TextEditor from "../../../components/Editor/TextEditor";
import { useLocation, useNavigate } from "react-router-dom";
import { IoMdAddCircleOutline, IoMdRemoveCircleOutline } from "react-icons/io";
import { useAPI } from "../../../hooks/useApi";
import { productQueryKey, productUniqueCodeQueryKey } from "../../../config/query-key";
import apiConfig from "../../../config/api.json";
import ProductImage from "./ProductImage";
import ImageUpload from "../../../components/image/ImageUpload";
import InputField from "../../../components/Inputs/InputField";
import Button from "../../../components/buttons/ButtonStyleOne";
import FileUpload from "../../../components/image/FileUpload";
import PageHeader from "../../../components/cards/PageHeader";

interface Option {
    label: string;
    value: string;
}

const initialFieldValues = {
    name: "",
    price: "",
    discountType: "",
    discountAmount: "",
    sku: "",
    videoUrl: "",
    cost: "",
    summary: "",
    description: "",
    mainCategoryId: "",
    firstCategoryId: "",
    secondCategoryId: "",
    thirdCategoryId: "",
    mainCategoryName: "",
    firstCategoryName: "",
    secondCategoryName: "",
    thirdCategoryName: "",
    productImages: [],
    featuredImage: null as string | null,
    fileUrl: "",
}

const requiredFields = [
    { key: "name", value: "name", label: "name" },
    { key: "vendorName", value: "vendor name", label: "text" },
    { key: "price", value: "price", label: "number" },
    { key: "sku", value: "sku", label: "text" },
    { key: "videoUrl", value: "video url", label: "text" },
    { key: "cost", value: "cost", label: "number" },
    { key: "summary", value: "summary", label: "text" },
    { key: "description", value: "description", label: "text" },
    { key: "mainCategoryId", value: "main category", label: "dropdown" },
    { key: "featuredImage", value: "featured image", label: "image" },
    { key: "productImages", value: "product images", label: "images" },
    { key: "fileUrl", value: "file url", label: "file" },

]

// const vendorOptions: Option[] = [
//     { label: "ElectroVendor", value: "f47ac10b-58cc-4372-a567-0e02b2c3d479" },
//     { label: "SmartTrade Inc", value: "a27dcf11-3fc4-4c64-b1d7-5edcfbfa48d2" },
//     { label: "Gadgetify", value: "bb8bdb87-ea6e-4e42-b329-1e772f91a2a5" },
//     { label: "RetailX", value: "c2fef71e-7f74-4e12-9aa5-126fc07a3f47" },
// ]

const discountTypeOptions: Option[] = [
    { label: "Percentage", value: "1" },
    { label: "Fixed Amount", value: "2" },
]

const ProductCreation = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const editData = location.state?.editData;
    const [isLoading, setIsLoading] = useState(false);
    const [description, setDescription] = useState("");
    const [uniqueCode, setUniqueCode] = useState("");
    const [productImages, setProductImages] = useState<(File | string)[]>([]);
    // const [selectedVendorName, setSelectedVendorName] = useState<Option | null>(null);
    const [selectedDiscountType, setSelectedDiscountType] = useState<Option | null>(null);
    const [selectedMainCategory, setSelectedMainCategory] = useState<Option | null>(null);
    const [selectedFirstCategory, setSelectedFirstCategory] = useState<Option | null>(null);
    const [selectedSecondCategory, setSelectedSecondCategory] = useState<Option | null>(null);
    const [selectedThirdCategory, setSelectedThirdCategory] = useState<Option | null>(null);
    const [isOpen, setIsOpen] = useState(true);
    const [fields, setFields] = useState<string[]>([""]);
    const [isFirstCategoryDisabled, setIsFirstCategoryDisabled] = useState(true);
    const [isSecondCategoryDisabled, setIsSecondCategoryDisabled] = useState(true);
    const [isThirdCategoryDisabled, setIsThirdCategoryDisabled] = useState(true);
    const { postFormMutation, handleApiMutation, usePaginatedQuery, patchFormMutation, fetchData } = useAPI();
    const [fieldValues, setFieldValues] = useState(initialFieldValues);
    const mainCategoryUrl = apiConfig.site.mainCategoryUrl;
    const firstCategoryUrl = apiConfig.site.firstCategoryUrl;
    const secondCategoryUrl = apiConfig.site.secondCategoryUrl;
    const thirdCategoryUrl = apiConfig.site.thirdCategoryUrl;
    const productUniqueCodeUrl = apiConfig.site.productUniqueCodeUrl;
    const productUrl = apiConfig.inventory.productUrl;
    const [mainCategories, setMainCategories] = useState<any>([]);
    const [firstCategories, setFirstCategories] = useState<any[]>([]);
    const [secondCategories, setSecondCategories] = useState<any[]>([]);
    const [thirdCategories, setThirdCategories] = useState<any[]>([]);

    const fetchMainCategoryData = async () => {
        try {
            const mainCategories = await fetchData({ apiUrl: mainCategoryUrl });
            setMainCategories(mainCategories.mainCategory);
        } catch (err) {
            console.error("Fetch failed:", err);
        }
    };

    useEffect(() => {
        fetchMainCategoryData();
    }, []);

    const formattedMainCategories = (mainCategories || []).map((item: any) => ({
        label: item.name,
        value: item.id
    }));


    const fetchFirstCategoryData = async (mainCategoryId: string) => {
        try {
            const response = await fetchData({
                apiUrl: `${firstCategoryUrl}?mainCategoryId=${mainCategoryId}`
            });
            setFirstCategories(response.firstCategories || []);
        } catch (err) {
            console.error("Failed to fetch first categories", err);
        }
    };

    const fetchSecondCategoryData = async (firstCategoryId: string) => {
        try {
            const response = await fetchData({
                apiUrl: `${secondCategoryUrl}?firstCategoryId=${firstCategoryId}`
            });
            setSecondCategories(response.secondCategories || []);
        } catch (err) {
            console.error("Failed to fetch second categories", err);
        }
    };

    const fetchThirdCategoryData = async (secondCategoryId: string) => {
        try {
            const response = await fetchData({
                apiUrl: `${thirdCategoryUrl}?secondCategoryId=${secondCategoryId}`
            });
            setThirdCategories(response.thirdCategories || []);
        } catch (err) {
            console.error("Failed to fetch third categories", err);
        }
    };

    useEffect(() => {
        if (editData) {
            setFieldValues({
                name: editData.name || "",
                price: editData.price || "",
                discountType: editData.discountType || "",
                discountAmount: editData.discountAmount || "",
                sku: editData.sku || "",
                videoUrl: editData.videoUrl || "",
                cost: editData.cost || "",
                summary: editData.summary || "",
                description: editData.description || "",
                mainCategoryId: editData.mainCategoryId || "",
                firstCategoryId: editData.firstCategoryId || "",
                secondCategoryId: editData.secondCategoryId || "",
                thirdCategoryId: editData.thirdCategoryId || "",
                mainCategoryName: editData.mainCategoryName || "",
                firstCategoryName: editData.firstCategoryName || "",
                secondCategoryName: editData.secondCategoryName || "",
                thirdCategoryName: editData.thirdCategoryName || "",
                productImages: editData.productImages || [],
                featuredImage: editData.featuredImage || null,
                fileUrl: editData.fileUrl || null,
            });

            setDescription(editData.description || "");
            setUniqueCode(editData.sku || "");
            if (editData.productImages && editData.productImages.length > 0) {
                setProductImages(editData.productImages.map((img: any) => img.imageUrl));
            }

            if (editData.discountType) {
                const isPercentage = editData.discountType.toLowerCase().includes('percentage');
                const isFixed = editData.discountType.toLowerCase().includes('fixed');

                setSelectedDiscountType({
                    label: editData.discountType,
                    value: isPercentage ? "1" : (isFixed ? "2" : "1")
                });
            }

            if (editData.mainCategoryName) {
                setSelectedMainCategory({
                    label: editData.mainCategoryName,
                    value: editData.mainCategoryId || editData.mainCategoryName
                });
                setIsFirstCategoryDisabled(false);

                setTimeout(() => {
                    //@ts-ignore
                    fetchFirstCategories();
                }, 0);
            }

            if (editData.firstCategoryName) {
                setSelectedFirstCategory({
                    label: editData.firstCategoryName,
                    value: editData.firstCategoryId || editData.firstCategoryName
                });
                setIsSecondCategoryDisabled(false);

                setTimeout(() => {
                    //@ts-ignore
                    fetchSecondCategories();
                }, 0);
            }

            if (editData.secondCategoryName) {
                setSelectedSecondCategory({
                    label: editData.secondCategoryName,
                    value: editData.secondCategoryId || editData.secondCategoryName
                });
                setIsThirdCategoryDisabled(false);

                setTimeout(() => {
                    //@ts-ignore
                    fetchThirdCategories();
                }, 0);
            }

            if (editData.thirdCategoryName) {
                setSelectedThirdCategory({
                    label: editData.thirdCategoryName,
                    value: editData.thirdCategoryId || editData.thirdCategoryName
                });
            }

            if (editData.summary) {
                if (Array.isArray(editData.summary)) {
                    setFields(editData.summary);
                } else if (typeof editData.summary === 'string') {
                    const summaryArray = editData.summary.split(/[\n,]/).map((item: string) => item.trim()).filter((item: string) => item);
                    setFields(summaryArray.length > 0 ? summaryArray : [""]);
                } else {
                    setFields([""]);
                }
            } else {
                setFields([""]);
            }

            if (editData.productImages?.length) {
                editData.productImages.map((img: any) => img.imageUrl);
            }

        }
    }, [editData]);

    const handleMainCategoryChange = (category: Option) => {
        setSelectedMainCategory(category);
        setIsFirstCategoryDisabled(false);
        setIsSecondCategoryDisabled(true);
        setIsThirdCategoryDisabled(true);
        setSelectedFirstCategory(null);
        setSelectedSecondCategory(null);
        setSelectedThirdCategory(null);
        setFirstCategories([]);
        setSecondCategories([]);
        setThirdCategories([]);

        setFieldValues((prevState) => ({
            ...prevState,
            mainCategoryId: category.value,
            mainCategoryName: category.label,
            firstCategoryId: "",
            firstCategoryName: "",
            secondCategoryId: "",
            secondCategoryName: "",
            thirdCategoryId: "",
            thirdCategoryName: ""
        }));

        fetchFirstCategoryData(category.value);
    };

    const handleFirstCategoryChange = (category: Option) => {
        setSelectedFirstCategory(category);
        setIsSecondCategoryDisabled(false);
        setIsThirdCategoryDisabled(true);
        setSelectedSecondCategory(null);
        setSelectedThirdCategory(null);
        setSecondCategories([]);
        setThirdCategories([]);

        setFieldValues((prevState) => ({
            ...prevState,
            firstCategoryId: category.value,
            firstCategoryName: category.label,
            secondCategoryId: "",
            secondCategoryName: "",
            thirdCategoryId: "",
            thirdCategoryName: ""
        }));

        fetchSecondCategoryData(category.value);
    };

    const handleSecondCategoryChange = (category: Option) => {
        setSelectedSecondCategory(category);
        setIsThirdCategoryDisabled(false);
        setSelectedThirdCategory(null);
        setThirdCategories([]);

        setFieldValues((prevState) => ({
            ...prevState,
            secondCategoryId: category.value,
            secondCategoryName: category.label,
            thirdCategoryId: "",
            thirdCategoryName: ""
        }));

        fetchThirdCategoryData(category.value);
    };

    const handleThirdCategoryChange = (category: Option) => {
        setSelectedThirdCategory(category);

        setFieldValues((prevState) => ({
            ...prevState,
            thirdCategoryId: category.value,
            thirdCategoryName: category.label
        }));
    };

    const formattedFirstCategories = firstCategories.map((item: any) => ({
        label: item.name,
        value: item.id
    }));

    const formattedSecondCategories = secondCategories.map((item: any) => ({
        label: item.name,
        value: item.id
    }));

    const formattedThirdCategories = thirdCategories.map((item: any) => ({
        label: item.name,
        value: item.id
    }));

    const handleAdd = () => {
        setFields([...fields, ""]);
    };

    const handleRemove = (index: number) => {
        const updated = fields.filter((_, i) => i !== index);
        setFields(updated);
    };

    // const handleVendorNameChange = (option: Option | null) => {
    //     setSelectedVendorName(option);
    //     setFieldValues(prev => ({
    //         ...prev,
    //         vendorName: option?.label || ""
    //     }));
    // };

    const handleDiscountTypeOptionChange = (option: Option | null) => {
        setSelectedDiscountType(option);
    };

    const handleSummaryChange = (index: number, value: string) => {
        const updated = [...fields];
        updated[index] = value;
        setFields(updated);
    };

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setFieldValues((prevState) => ({
            ...prevState,
            [name]: value
        }));
    };

    const resetForm = () => {
        setFieldValues(initialFieldValues);
        setFields([""]);
        setDescription("")
        setSelectedMainCategory(null);
        setSelectedFirstCategory(null);
        setSelectedSecondCategory(null);
    };

    const handleFeaturedImageUpload = (file: File | null) => {
        // @ts-ignore
        setFieldValues((prevState) => ({ ...prevState, featuredImage: file }));
    };

    const handleProductImagesUpload = (files: (File | string)[]) => {
        setProductImages(files);
    };

    const handleSubmitForm = async () => {
        setIsLoading(true);
        const mutation = editData ? patchFormMutation : postFormMutation;
        const url = editData ? `${productUrl}/${editData.id}` : productUrl;

        const filteredFields = fields.filter(f => f.trim() !== "");
        const summaryString = filteredFields.join(', ');

        const existingProductImages = productImages.filter((item) => typeof item === "string" && item.startsWith("http"));

        const payload = {
            ...fieldValues,
            sku: uniqueCode,
            productImages: productImages,
            // vendorId: selectedVendorName?.value || "",
            // vendorName: selectedVendorName?.label || "",
            discountType: selectedDiscountType?.label || "",
            discountAmount: fieldValues.discountAmount ? Number(fieldValues.discountAmount) : 0,
            summary: summaryString,
            description: description.trim(),
            mainCategoryId: selectedMainCategory?.value || "",
            mainCategoryName: selectedMainCategory?.label || "",
            firstCategoryId: selectedFirstCategory?.value || "",
            firstCategoryName: selectedFirstCategory?.label || "",
            secondCategoryId: selectedSecondCategory?.value || "",
            secondCategoryName: selectedSecondCategory?.label || "",
            thirdCategoryId: selectedThirdCategory?.value || "",
            thirdCategoryName: selectedThirdCategory?.label || "",
            existingProductImages: existingProductImages || []
        };

        const result = await handleApiMutation({
            // @ts-ignore
            mutation,
            url,
            body: payload,
            invalidateQueryKey: [productQueryKey],
            showSuccessMessage: true,
            showErrorMessage: true,
            requiredFields
        });

        if (result?.success) {
            resetForm();
            navigate('/products');
        }
        setIsLoading(false);
    };

    const {
        // @ts-ignore
        data: productUniqueCode,
        refetch: fetchSku
    } = usePaginatedQuery({
        queryKey: [productUniqueCodeQueryKey],
        url: productUniqueCodeUrl,
        enabled: false
    });

    const handleGenerateSku = async () => {
        const result = await fetchSku();
        if (result.data) {
            setUniqueCode(result.data.toString());
        }
    };

    const handleFileUpload = (file: File | null) => {
        // @ts-ignore
        setFieldValues((prevState) => ({ ...prevState, fileUrl: file }));
    };

    return (
        <div>
            <div className="flex items-center justify-between flex-wrap mb-6">
                <PageHeader
                    headerTitle={editData ? "Edit Product" : "Create Product"}
                    headerDescription={editData ? "Edit an existing product" : "Create a new product"}
                />
                <Button label="Back to Product" onClick={() => navigate("/products")} color="var(--color-primary)" hoverColor="var(--color-primary-hover)" />
            </div>

            <div className="mx-auto bg-white shadow rounded-lg">
                <div className="flex justify-between items-center px-4 sm:px-6 py-2 md:py-3">
                    <div className="text-base font-bold text-[#212b36]">Product Information</div>
                    <RiArrowDropDownLine
                        className={`text-2xl sm:text-3xl cursor-pointer transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                        onClick={() => setIsOpen(!isOpen)}
                    />
                </div>
                <hr className="border-gray-200 mb-4" />

                {isOpen && (
                    <>
                        <div className="px-6 pb-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <InputField label="Product Name" type="text" name="name" required value={fieldValues.name} onChange={handleChange} />
                                </div>

                                <div className="relative">
                                    <InputField label="SKU" type="text" name="sku" required value={uniqueCode} readOnly={true} onChange={handleChange} />
                                    <button
                                        onClick={handleGenerateSku}
                                        className="absolute right-2 top-7 bg-[var(--color-primary)] text-white py-1 px-2 rounded-md text-[12px] cursor-pointer hover:bg-[var(--color-primary-hover)]"
                                    >
                                        Generate
                                    </button>
                                </div>

                                {/* <SelectInput
                                    label="Vendor Name"
                                    value={selectedVendorName}
                                    options={vendorOptions}
                                    onChange={handleVendorNameChange}
                                    placeholder="Select Vendor"
                                    required
                                /> */}

                                <div>
                                    <InputField label="Video URL" type="text" name="videoUrl" required value={fieldValues.videoUrl} onChange={handleChange} />
                                </div>

                                <div>
                                    <InputField label="Price" type="number" name="price" required value={fieldValues.price} onChange={handleChange} />
                                </div>

                                <div>
                                    <InputField label="Cost" type="number" name="cost" required value={fieldValues.cost} onChange={handleChange} />
                                </div>

                                <SelectInput
                                    label="Discount Type"
                                    value={selectedDiscountType}
                                    options={discountTypeOptions}
                                    onChange={handleDiscountTypeOptionChange}
                                    placeholder="Select Discount Type"
                                />

                                <div>
                                    <InputField label="Discount Amount" type="number" name="discountAmount" value={fieldValues.discountAmount} onChange={handleChange} />
                                </div>

                                <SelectInput
                                    label="Main Category"
                                    value={selectedMainCategory}
                                    options={formattedMainCategories}
                                    onChange={handleMainCategoryChange}
                                    placeholder="Select Main Category"
                                    required
                                />

                                <SelectInput
                                    label="First Category"
                                    value={selectedFirstCategory}
                                    options={formattedFirstCategories}
                                    onChange={handleFirstCategoryChange}
                                    placeholder="Select First Category"
                                    disabled={isFirstCategoryDisabled || !firstCategories.length}
                                />

                                <SelectInput
                                    label="Second Category"
                                    value={selectedSecondCategory}
                                    options={formattedSecondCategories}
                                    onChange={handleSecondCategoryChange}
                                    placeholder="Select Second Category"
                                    disabled={isSecondCategoryDisabled || !secondCategories.length}
                                />

                                <SelectInput
                                    label="Third Category"
                                    value={selectedThirdCategory}
                                    options={formattedThirdCategories}
                                    onChange={handleThirdCategoryChange}
                                    placeholder="Select Third Category"
                                    disabled={isThirdCategoryDisabled || !thirdCategories.length}
                                />

                                <div className="">
                                    <p className="text-sm font-medium text-gray-700 w-full mb-1">Product Summary</p>
                                    <div className="space-y-2 ">
                                        {fields.map((field, index) => (
                                            <div key={index} className="flex items-center gap-2">
                                                <input
                                                    type="text"
                                                    value={field}
                                                    onChange={(e) => handleSummaryChange(index, e.target.value)}
                                                    className="w-full h-10 focus:outline-none px-3 text-base border border-gray-200 rounded-lg focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
                                                    required
                                                />
                                                {index !== 0 && (
                                                    <button
                                                        onClick={() => handleRemove(index)}
                                                        className="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-red-500 text-white rounded-lg hover:bg-red-600 cursor-pointer"
                                                    >
                                                        <IoMdRemoveCircleOutline className="text-xl" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                        <div className="flex justify-start mt-2">
                                            <Button label="Add More" onClick={handleAdd} color="var(--color-primary)" hoverColor="var(--color-primary-hover)" icon={<IoMdAddCircleOutline size={18} />} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="px-6 pb-6">
                            <TextEditor value={description} onChange={setDescription} />
                        </div>
                    </>
                )}
            </div>

            <div className="mt-6 rounded-lg grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="col-span-1 lg:col-span-3 bg-white pb-4">
                    <div className="px-4 sm:px-4 py-3 border-b border-gray-200">
                        <p className="text-base font-bold text-[#212b36]">
                            Featured Image
                        </p>
                        <p className="">Add one featured image to show as the main thumbnail.</p>
                    </div>
                    <div className="px-8 py-2">
                        <ImageUpload value={fieldValues.featuredImage} onChange={handleFeaturedImageUpload} />
                    </div>
                </div>
                <div className="col-span-1 lg:col-span-3 bg-white pb-4">
                    <div className="px-4 sm:px-4 py-3 border-b border-gray-200">
                        <p className="text-base font-bold text-[#212b36]">
                            Product File
                        </p>
                        <p className="">Add one featured image to show as the main thumbnail.</p>
                    </div>
                    <div className="px-8 py-2">
                        <FileUpload value={fieldValues.fileUrl} onChange={handleFileUpload} />
                    </div>
                </div>

                <div className="col-span-1 lg:col-span-6 bg-white">
                    <ProductImage value={productImages} onChange={handleProductImagesUpload} />
                </div>
            </div>

            <div className="flex items-center justify-end gap-4 pt-4">
                <Button label="Cancel" onClick={() => navigate("/products")} color="var(--color-secondary)" hoverColor="var(--color-secondary-hover)" />
                <Button label="Save" onClick={handleSubmitForm} color="var(--color-primary)" hoverColor="var(--color-primary-hover)" isLoading={isLoading}
                    disabled={isLoading} />
            </div>
        </div>
    );
};

export default ProductCreation;