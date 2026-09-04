import { ChangeEvent, useEffect, useState } from "react";
import CmsSkeleton from "../../../../../components/skeleton/CmsSkeleton";
import { useAPI } from "../../../../../hooks/useApi";
import apiConfig from "../../../../../config/api.json";
import { homePageCmsQueryKey } from "../../../../../config/query-key";
import ToggleInput from "../../../../../components/Inputs/ToggleButton";
import ImageUpload from "../../../../../components/image/ImageUpload";
import { extractCmsData } from "../../../../../utils/cms-utils";

const initialFieldValues = {
    categorySectionTitle: "",
    isCategorySectionVisible: true,
    productSectionOneTitle: "",
    isProductSectionOneVisible: true,
    productSectionOneFontColor: "",
    productSectionOneBackgroundColor: "",
    productSectionTwoTitle: "",
    isProductSectionTwoVisible: true,
    productSectionTwoFontColor: "",
    productSectionTwoBackgroundColor: "",
    productSectionThreeTitle: "",
    isProductSectionThreeVisible: true,
    productSectionThreeFontColor: "",
    productSectionThreeBackgroundColor: "",
    productSectionFourTitle: "",
    isProductSectionFourVisible: true,
    productSectionFourFontColor: "",
    productSectionFourBackgroundColor: "",
    productSectionFiveTitle: "",
    isProductSectionFiveVisible: true,
    productSectionFiveFontColor: "",
    productSectionFiveBackgroundColor: "",
    productSectionSixTitle: "",
    isProductSectionSixVisible: true,
    productSectionSixFontColor: "",
    productSectionSixBackgroundColor: "",
    bannerImage: "" as string | File,
    bannerImageLink: ""
};

const requiredFields = [
    { key: "categorySectionTitle", value: "category section title", label: "text" },
    { key: "productSectionOneTitle", value: "product section one title", label: "text" },
    { key: "productSectionOneFontColor", value: "product section one font color", label: "text" },
    { key: "productSectionOneBackgroundColor", value: "product section one background color", label: "text" },
    { key: "productSectionTwoTitle", value: "product section two title", label: "text" },
    { key: "productSectionTwoFontColor", value: "product section one font color", label: "text" },
    { key: "productSectionTwoBackgroundColor", value: "product section one background color", label: "text" },
    { key: "productSectionThreeTitle", value: "product section three title", label: "text" },
    { key: "productSectionThreeFontColor", value: "product section one font color", label: "text" },
    { key: "productSectionThreeBackgroundColor", value: "product section one background color", label: "text" },
    { key: "productSectionFourTitle", value: "product section four title", label: "text" },
    { key: "productSectionFourFontColor", value: "product section one font color", label: "text" },
    { key: "productSectionFourBackgroundColor", value: "product section one background color", label: "text" },
    { key: "productSectionFiveTitle", value: "product section five title", label: "text" },
    { key: "productSectionFiveFontColor", value: "product section one font color", label: "text" },
    { key: "productSectionFiveBackgroundColor", value: "product section one background color", label: "text" },
    { key: "productSectionSixTitle", value: "product section six title", label: "text" },
    { key: "productSectionSixFontColor", value: "product section one font color", label: "text" },
    { key: "productSectionSixBackgroundColor", value: "product section one background color", label: "text" },
    { key: "bannerImage", value: "banner image", label: "image" },
    { key: "bannerImageLink", value: "banner image link", label: "text" }
];

const HomePageCmsForm = () => {
    const { postFormMutation, fetchData, handleApiMutation } = useAPI();
    const [fieldValues, setFieldValues] = useState(initialFieldValues);
    const apiUrl = apiConfig.setting.home.homePageCmsUrl;

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setFieldValues((prevState) => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleImageUpload = (file: File | null) => {
        if (file) {
            setFieldValues((prevState) => ({ ...prevState, bannerImage: file }));
        }
    };

    const handleSwitchChange = (name: string, checked: boolean) => {
        setFieldValues((prevState) => ({
            ...prevState,
            [name]: checked
        }));
    };

    const handleSubmitForm = async () => {
        const mutation = postFormMutation;
        const url = apiUrl;

        const result = await handleApiMutation({
            // @ts-ignore
            mutation,
            url,
            body: fieldValues,
            invalidateQueryKey: [homePageCmsQueryKey],
            showSuccessMessage: true,
            showErrorMessage: true,
            requiredFields
        });

        if (result?.success) {
            fetchHomePageCmsData();
        }
    };

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const fetchHomePageCmsData = async () => {
        setIsLoading(true);
        try {
            const result = await fetchData({ apiUrl });
            const data = extractCmsData(result);
            if (data) {
                setFieldValues(data);
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchHomePageCmsData();
    }, []);

    if (isLoading) return <CmsSkeleton />;

    return (
        <div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="grid grid-cols-1 gap-6 mb-12 bg-gray-50 p-4 rounded-lg">
                    <div>
                        <p className="text-xl font-bold flex items-center justify-between gap-2">
                            Category
                            <ToggleInput label="" name="isCategorySectionVisible" checked={fieldValues.isCategorySectionVisible} onChange={(checked) => handleSwitchChange("isCategorySectionVisible", checked)} />
                        </p>

                        {fieldValues.isCategorySectionVisible && (
                            <div className="mt-4">
                                <label className="block text-[14px] font-medium text-[#212b36] mb-1">
                                    Title: <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="categorySectionTitle"
                                    value={fieldValues.categorySectionTitle}
                                    onChange={handleChange}
                                    className="w-full p-2 bg-white border border-gray-300 rounded-md focus:ring-[#FE9F43] focus:outline-none"
                                    required
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Product Section One */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 bg-gray-50 p-4 rounded-xl">
                    <div className="col-span-2">
                        <p className="text-xl font-bold flex items-center justify-between gap-2">
                            Product Section One
                            <ToggleInput label="" name="isProductSectionOneVisible" checked={fieldValues.isProductSectionOneVisible} onChange={(checked) => handleSwitchChange("isProductSectionOneVisible", checked)} />
                        </p>
                    </div>
                    {fieldValues.isProductSectionOneVisible && <>
                        <div>
                            <label className="block text-[14px] font-medium text-[#212b36] mb-1 ">
                                Title: <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="productSectionOneTitle"
                                value={fieldValues.productSectionOneTitle}
                                onChange={handleChange}
                                className="w-full p-2 bg-white border border-gray-300 rounded-md focus:ring-[#FE9F43] focus:outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-[14px] font-medium text-[#212b36] mb-1">
                                Font Color: <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="productSectionOneFontColor"
                                value={fieldValues.productSectionOneFontColor}
                                onChange={handleChange}
                                className="w-full bg-white p-2 border border-gray-300 rounded-md focus:ring-[#FE9F43] focus:outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-[14px] font-medium text-[#212b36] mb-1">
                                Background Color: <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="productSectionOneBackgroundColor"
                                value={fieldValues.productSectionOneBackgroundColor}
                                onChange={handleChange}
                                className="w-full p-2 bg-white border border-gray-300 rounded-md focus:ring-[#FE9F43] focus:outline-none"
                                required
                            />
                        </div>
                    </>}
                </div>

                {/* Product Section Two */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 bg-gray-50 p-4 rounded-xl">
                    <div className="col-span-2">
                        <p className="text-xl font-bold flex items-center justify-between gap-2">
                            Product Section Two
                            <ToggleInput label="" name="isProductSectionTwoVisible" checked={fieldValues.isProductSectionTwoVisible} onChange={(checked) => handleSwitchChange("isProductSectionTwoVisible", checked)} />
                        </p>
                    </div>
                    {fieldValues.isProductSectionTwoVisible && <>
                        <div>
                            <label className="block text-[14px] font-medium text-[#212b36] mb-1">
                                Title: <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="productSectionTwoTitle"
                                value={fieldValues.productSectionTwoTitle}
                                onChange={handleChange}
                                className="w-full p-2 bg-white border border-gray-300 rounded-md focus:ring-[#FE9F43] focus:outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-[14px] font-medium text-[#212b36] mb-1">
                                Font Color: <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="productSectionTwoFontColor"
                                value={fieldValues.productSectionTwoFontColor}
                                onChange={handleChange}
                                className="w-full p-2 bg-white border border-gray-300 rounded-md focus:ring-[#FE9F43] focus:outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-[14px] font-medium text-[#212b36] mb-1">
                                Background Color: <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="productSectionTwoBackgroundColor"
                                value={fieldValues.productSectionTwoBackgroundColor}
                                onChange={handleChange}
                                className="w-full p-2 bg-white border border-gray-300 rounded-md focus:ring-[#FE9F43] focus:outline-none"
                                required
                            />
                        </div>
                    </>}
                </div>

                {/* Product Section Three */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 bg-gray-50 p-4 rounded-xl">
                    <div className="col-span-2">
                        <p className="text-xl font-bold flex items-center justify-between gap-2">
                            Product Section Three
                            <ToggleInput label="" name="isProductSectionThreeVisible" checked={fieldValues.isProductSectionThreeVisible} onChange={(checked) => handleSwitchChange("isProductSectionThreeVisible", checked)} />
                        </p>
                    </div>
                    {fieldValues.isProductSectionThreeVisible && <>
                        <div>
                            <label className="block text-[14px] font-medium text-[#212b36] mb-1">
                                Title: <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="productSectionThreeTitle"
                                value={fieldValues.productSectionThreeTitle}
                                onChange={handleChange}
                                className="w-full p-2 bg-white border border-gray-300 rounded-md focus:ring-[#FE9F43] focus:outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-[14px] font-medium text-[#212b36] mb-1">
                                Font Color: <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="productSectionThreeFontColor"
                                value={fieldValues.productSectionThreeFontColor}
                                onChange={handleChange}
                                className="w-full p-2 bg-white border border-gray-300 rounded-md focus:ring-[#FE9F43] focus:outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-[14px] font-medium text-[#212b36] mb-1">
                                Background Color: <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="productSectionThreeBackgroundColor"
                                value={fieldValues.productSectionThreeBackgroundColor}
                                onChange={handleChange}
                                className="w-full p-2 bg-white border border-gray-300 rounded-md focus:ring-[#FE9F43] focus:outline-none"
                                required
                            />
                        </div>
                    </>}
                </div>

                {/* Product Section Four */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 bg-gray-50 p-4 rounded-xl">
                    <div className="col-span-2">
                        <p className="text-xl font-bold flex items-center justify-between gap-2">
                            Product Section Four
                            <ToggleInput label="" name="isProductSectionFourVisible" checked={fieldValues.isProductSectionFourVisible} onChange={(checked) => handleSwitchChange("isProductSectionFourVisible", checked)} />
                        </p>
                    </div>
                    {fieldValues.isProductSectionFourVisible && <>
                        <div>
                            <label className="block text-[14px] font-medium text-[#212b36] mb-1">
                                Title: <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="productSectionFourTitle"
                                value={fieldValues.productSectionFourTitle}
                                onChange={handleChange}
                                className="w-full p-2 bg-white border border-gray-300 rounded-md focus:ring-[#FE9F43] focus:outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-[14px] font-medium text-[#212b36] mb-1">
                                Font Color: <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="productSectionFourFontColor"
                                value={fieldValues.productSectionFourFontColor}
                                onChange={handleChange}
                                className="w-full p-2 bg-white border border-gray-300 rounded-md focus:ring-[#FE9F43] focus:outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-[14px] font-medium text-[#212b36] mb-1">
                                Background Color: <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="productSectionFourBackgroundColor"
                                value={fieldValues.productSectionFourBackgroundColor}
                                onChange={handleChange}
                                className="w-full p-2 bg-white border border-gray-300 rounded-md focus:ring-[#FE9F43] focus:outline-none"
                                required
                            />
                        </div>
                    </>}
                </div>

                {/* Product Section Five */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 bg-gray-50 p-4 rounded-md">
                    <div className="col-span-2">
                        <p className="text-xl font-bold flex items-center justify-between gap-2">
                            Product Section Five
                            <ToggleInput label="" name="isProductSectionFiveVisible" checked={fieldValues.isProductSectionFiveVisible} onChange={(checked) => handleSwitchChange("isProductSectionFiveVisible", checked)} />
                        </p>
                    </div>
                    {fieldValues.isProductSectionFiveVisible && <>
                        <div>
                            <label className="block text-[14px] font-medium text-[#212b36] mb-1">
                                Title: <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="productSectionFiveTitle"
                                value={fieldValues.productSectionFiveTitle}
                                onChange={handleChange}
                                className="w-full p-2 bg-white border border-gray-300 rounded-md focus:ring-[#FE9F43] focus:outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-[14px] font-medium text-[#212b36] mb-1">
                                Font Color: <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="productSectionFiveFontColor"
                                value={fieldValues.productSectionFiveFontColor}
                                onChange={handleChange}
                                className="w-full p-2 bg-white border border-gray-300 rounded-md focus:ring-[#FE9F43] focus:outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-[14px] font-medium text-[#212b36] mb-1">
                                Background Color: <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="productSectionFiveBackgroundColor"
                                value={fieldValues.productSectionFiveBackgroundColor}
                                onChange={handleChange}
                                className="w-full p-2 bg-white border border-gray-300 rounded-md focus:ring-[#FE9F43] focus:outline-none"
                                required
                            />
                        </div>
                    </>}
                </div>

                {/* Product Section Six */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 bg-gray-50 p-4 rounded-md">
                    <div className="col-span-2">
                        <p className="text-xl font-bold flex items-center justify-between gap-2">
                            Product Section Six
                            <ToggleInput label="" name="isProductSectionSixVisible" checked={fieldValues.isProductSectionSixVisible} onChange={(checked) => handleSwitchChange("isProductSectionSixVisible", checked)} />
                        </p>
                    </div>
                    {fieldValues.isProductSectionSixVisible && <>
                        <div>
                            <label className="block text-[14px] font-medium text-[#212b36] mb-1">
                                Title: <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="productSectionSixTitle"
                                value={fieldValues.productSectionSixTitle}
                                onChange={handleChange}
                                className="w-full p-2 bg-white border border-gray-300 rounded-md focus:ring-[#FE9F43] focus:outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-[14px] font-medium text-[#212b36] mb-1">
                                Font Color: <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="productSectionSixFontColor"
                                value={fieldValues.productSectionSixFontColor}
                                onChange={handleChange}
                                className="w-full p-2 bg-white border border-gray-300 rounded-md focus:ring-[#FE9F43] focus:outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-[14px] font-medium text-[#212b36] mb-1">
                                Background Color: <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="productSectionSixBackgroundColor"
                                value={fieldValues.productSectionSixBackgroundColor}
                                onChange={handleChange}
                                className="w-full p-2 bg-white border border-gray-300 rounded-md focus:ring-[#FE9F43] focus:outline-none"
                                required
                            />
                        </div>
                    </>}
                </div>

                <div>
                    <p className="block text-sm font-medium text-gray-700">
                        Banner Image:
                        <span className="text-xs text-gray-500 ml-1">(Recommended Size: 1920x400 PX)</span>
                    </p>
                    <ImageUpload
                        value={
                            typeof fieldValues.bannerImage === "string"
                                ? fieldValues.bannerImage
                                : URL.createObjectURL(fieldValues.bannerImage)
                        }
                        onChange={handleImageUpload}
                    />

                    <div>
                        <label className="block text-[14px] font-medium text-[#212b36] mt-2 mb-1">
                            Banner Image Link: <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="bannerImageLink"
                            value={fieldValues.bannerImageLink}
                            onChange={handleChange}
                            className="w-full p-2 bg-white border border-gray-300 rounded-md focus:ring-[#FE9F43] focus:outline-none"
                            required
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-4">
                    <button className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer">
                        Cancel
                    </button>
                    <button onClick={handleSubmitForm} className="px-4 py-2 bg-[#FE9F43] text-white rounded-md hover:bg-[#e68a2c] cursor-pointer">
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HomePageCmsForm;
