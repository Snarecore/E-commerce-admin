import { ChangeEvent, useEffect, useState } from "react";
import { useAPI } from "../../../../hooks/useApi";
import apiConfig from "../../../../config/api.json";
import { headerFooterCmsQueryKey } from "../../../../config/query-key";
import CmsSkeleton from "../../../../components/skeleton/CmsSkeleton";
import ImageUpload from "../../../../components/image/ImageUpload";
import { IoMdAddCircleOutline, IoMdRemoveCircleOutline } from "react-icons/io";
import Button from "../../../../components/buttons/ButtonStyleOne";
import { extractCmsData } from "../../../../utils/cms-utils";

const initialFieldValues = {
    bannerText: "",
    helpline: "",
    footerDescription: "",
    copyrightText: "",
    contactEmail: "",
    contactPhone: "",
    contactAddress: "",
    headerLogo: "" as string | File,
    footerLogo: "" as string | File,
    footerSectionTwoTitle: "",
    footerSectionThreeTitle: ""
};

const requiredFields = [
    { key: "headerLogo", value: "header logo", label: "image" },
    { key: "bannerText", value: "banner text", label: "text" },
    { key: "helpline", value: "helpline", label: "text" },
    { key: "footerLogo", value: "footer logo", label: "image" },
    { key: "footerDescription", value: "footer description", label: "text" },
    { key: "copyrightText", value: "copyright text", label: "text" },
    { key: "contactEmail", value: "contact email", label: "text" },
    { key: "contactPhone", value: "contact phone", label: "text" },
    { key: "contactAddress", value: "contact address", label: "text" },
    { key: "footerSectionTwoTitle", value: "footer section two title", label: "text" },
    { key: "footerSectionThreeTitle", value: "footer section three title", label: "text" }
];

const HeaderFooterCmsForm = () => {
    const apiUrl = apiConfig.setting.headerFooterCms;
    const { postFormMutation, fetchData, handleApiMutation } = useAPI();
    const [fieldValues, setFieldValues] = useState(initialFieldValues);
    const [footerSectionTwo, setFooterSectionTwo] = useState([{ value: '', link: '' }]);
    const [footerSectionThree, setFooterSectionThree] = useState([{ value: '', link: '' }]);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setFieldValues((prevState) => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleLogoUpload = (name: 'headerLogo' | 'footerLogo', file: File | null) => {
        if (file) {
            setFieldValues((prevState) => ({ ...prevState, [name]: file }));
        }
    };

    const handleDynamicChange = (
        index: number,
        field: 'value' | 'link',
        value: string,
        sectionSetter: React.Dispatch<React.SetStateAction<{ value: string; link: string }[]>>
    ) => {
        const updated = [...(sectionSetter === setFooterSectionTwo ? footerSectionTwo : footerSectionThree)];
        updated[index][field] = value;
        sectionSetter(updated);
    };

    const addMoreField = (sectionSetter: React.Dispatch<React.SetStateAction<{ value: string; link: string }[]>>) => {
        sectionSetter(prevState => [...prevState, { value: '', link: '' }]);
    };

    const removeField = (index: number, sectionSetter: React.Dispatch<React.SetStateAction<{ value: string; link: string }[]>>) => {
        sectionSetter(prevState => prevState.filter((_, i) => i !== index));
    };

    const handleSubmitForm = async () => {
        setIsLoading(true);
        const mutation = postFormMutation;
        const url = apiUrl;

        const result = await handleApiMutation({
            // @ts-ignore
            mutation,
            url,
            body: {
                ...fieldValues,
                footerSectionTwo,
                footerSectionThree
            },
            invalidateQueryKey: [headerFooterCmsQueryKey],
            showSuccessMessage: true,
            showErrorMessage: true,
            requiredFields
        });

        if (result?.success) {
            fetchHeaderFooterCmsData();
        }
        setIsLoading(false);
    };

    const fetchHeaderFooterCmsData = async () => {
        setIsLoading(true);
        try {
            const result = await fetchData({ apiUrl });
            const data = extractCmsData(result);
            if (data) {
                setFieldValues(data);
                setFooterSectionTwo(() => {
                    const sec = data.footerSectionTwo;
                    if (typeof sec === 'string') {
                        try { return JSON.parse(sec); } catch { return [{ value: '', link: '' }]; }
                    }
                    return Array.isArray(sec) && sec.length > 0 ? sec : [{ value: '', link: '' }];
                });
    
                setFooterSectionThree(() => {
                    const sec = data.footerSectionThree;
                    if (typeof sec === 'string') {
                        try { return JSON.parse(sec); } catch { return [{ value: '', link: '' }]; }
                    }
                    return Array.isArray(sec) && sec.length > 0 ? sec : [{ value: '', link: '' }];
                });
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchHeaderFooterCmsData();
    }, []);

    if (isLoading) return <CmsSkeleton />;

    return (
        <div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="mb-4">
                    <h3 className="block text-sm font-medium text-gray-700">Header Logo: <span className="text-red-500">*</span> (Recommended Size: 200*40 PX)</h3>
                    <ImageUpload
                        onChange={(file) => handleLogoUpload('headerLogo', file)}
                        value={typeof fieldValues.headerLogo === 'string' ? fieldValues.headerLogo : URL.createObjectURL(fieldValues.headerLogo)}
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div>
                        <label className="block text-[14px] font-medium text-[#212b36] mb-1">
                            Banner Text: <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="bannerText"
                            value={fieldValues.bannerText}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#FE9F43] focus:outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-[14px] font-medium text-[#212b36] mb-1">
                            Helpline: <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="helpline"
                            value={fieldValues.helpline}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-[var(--color-primary)] focus:outline-none"
                            required
                        />
                    </div>
                </div>
                <div className="mb-4">
                    <h3 className="block text-sm font-medium text-gray-700">Footer Logo: <span className="text-red-500">*</span>(Recommended Size: 200*40 PX)</h3>
                    <ImageUpload
                        onChange={(file) => handleLogoUpload('footerLogo', file)}
                        value={typeof fieldValues.footerLogo === 'string' ? fieldValues.footerLogo : URL.createObjectURL(fieldValues.footerLogo)}
                    />
                </div>
                <div className="grid grid-cols-1 gap-6 mb-8">
                    <div>
                        <label className="block text-[14px] font-medium text-[#212b36] mb-1">
                            Footer Description: <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="footerDescription"
                            value={fieldValues.footerDescription}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-[var(--color-primary)] focus:outline-none"
                            required
                        />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div>
                        <label className="block text-[14px] font-medium text-[#212b36] mb-1">
                            Copyright Text: <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="copyrightText"
                            value={fieldValues.copyrightText}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-[var(--color-primary)] focus:outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-[14px] font-medium text-[#212b36] mb-1">
                            Contact Email: <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="contactEmail"
                            value={fieldValues.contactEmail}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-[var(--color-primary)] focus:outline-none"
                            required
                        />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div>
                        <label className="block text-[14px] font-medium text-[#212b36] mb-1">
                            Contact Phone: <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="contactPhone"
                            value={fieldValues.contactPhone}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-[var(--color-primary)] focus:outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-[14px] font-medium text-[#212b36] mb-1">
                            Contact Address: <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="contactAddress"
                            value={fieldValues.contactAddress}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-[var(--color-primary)] focus:outline-none"
                            required
                        />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div>
                        <label className="block text-[14px] font-medium text-[#212b36] mb-1">
                            Footer Section Two Title: <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="footerSectionTwoTitle"
                            value={fieldValues.footerSectionTwoTitle}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-[var(--color-primary)] focus:outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-[14px] font-medium text-[#212b36] mb-1">
                            Footer Section Three Title: <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="footerSectionThreeTitle"
                            value={fieldValues.footerSectionThreeTitle}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-[var(--color-primary)] focus:outline-none"
                            required
                        />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {[{
                        title: "Footer Section Two",
                        section: footerSectionTwo,
                        setSection: setFooterSectionTwo
                    }, {
                        title: "Footer Section Three",
                        section: footerSectionThree,
                        setSection: setFooterSectionThree
                    }].map(({ title, section, setSection }, idx) => (
                        <div key={idx}>
                            <label className="block text-sm font-medium text-gray-700">{title}:</label>
                            {section.map((item, index) => (
                                <div key={index} className="flex gap-2 items-center mb-2">
                                    <input
                                        type="text"
                                        value={item.value}
                                        onChange={(e) => handleDynamicChange(index, 'value', e.target.value, setSection)}
                                        className="flex-1 p-2 border border-gray-300 rounded-md"
                                        placeholder="Value"
                                    />
                                    <input
                                        type="text"
                                        value={item.link}
                                        onChange={(e) => handleDynamicChange(index, 'link', e.target.value, setSection)}
                                        className="flex-1 p-2 border border-gray-300 rounded-md"
                                        placeholder="Link"
                                    />
                                    {index > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => removeField(index, setSection)}
                                            className="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-red-500 text-white rounded-lg hover:bg-red-600 cursor-pointer"
                                        ><IoMdRemoveCircleOutline className="text-xl" /></button>
                                    )}
                                </div>
                            ))}
                            <Button
                                label="Add More"
                                onClick={() => addMoreField(setSection)}
                                color="var(--color-primary)" hoverColor="var(--color-primary-hover)" icon={<IoMdAddCircleOutline size={18} />}
                            ></Button>
                        </div>
                    ))}
                </div>
                <div className="flex justify-end gap-3">
                    <Button onClick={handleSubmitForm} color="var(--color-primary)" hoverColor="var(--color-primary-hover)" isLoading={isLoading} disabled={isLoading}>
                        Save
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default HeaderFooterCmsForm;
