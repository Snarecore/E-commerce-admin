import { ChangeEvent, useEffect, useState } from "react";
import CmsSkeleton from "../../../../../components/skeleton/CmsSkeleton";
import { useAPI } from "../../../../../hooks/useApi";
import apiConfig from "../../../../../config/api.json";
import { contactPageCmsQueryKey } from "../../../../../config/query-key";
import { extractCmsData } from "../../../../../utils/cms-utils";

const initialFieldValues = {
    pageTitle: "",
    pageSubTitle: "",
    phone: "",
    email: "",
    address: "",
    formSectionTitleOne: "",
    formSectionTitleTwo: "",
    formSectionTitleThree: "",
    buttonText: ""
};

const requiredFields = [
	{ key: "pageTitle", value: "page title", label: "text" },
	{ key: "pageSubTitle", value: "page sub title", label: "text" },
	{ key: "phone", value: "phone", label: "text" },
    { key: "email", value: "email", label: "text" },
	{ key: "address", value: "address", label: "text" },
	{ key: "phone", value: "phone", label: "text" },
    { key: "formSectionTitleOne", value: "form section title one", label: "text" },
	{ key: "formSectionTitleTwo", value: "form section title two", label: "text" },
	{ key: "formSectionTitleThree", value: "form section title three", label: "text" },
    { key: "buttonText", value: "button text", label: "text" }
];

const ContactPageCmsForm = () => {
    const { postMutation, fetchData, handleApiMutation } = useAPI();
    const [fieldValues, setFieldValues] = useState(initialFieldValues);
    const apiUrl = apiConfig.setting.contactUs.contactPageCmsUrl;

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
		const { name, value } = event.target;
		setFieldValues((prevState) => ({
			...prevState,
			[name]: value
		}));
	};

    const handleSubmitForm = async () => {
		const mutation = postMutation;
		const url = apiUrl;

		const result = await handleApiMutation({
			mutation,
			url,
			body: fieldValues,
			invalidateQueryKey: [contactPageCmsQueryKey],
			showSuccessMessage: true,
			showErrorMessage: true,
			requiredFields
		});

		if (result?.success) {
            fetchContactPageCmsData();
		}
	};

	const [isLoading, setIsLoading] = useState<boolean>(true);
    const fetchContactPageCmsData = async () => {
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
        fetchContactPageCmsData();
    }, []);

    if (isLoading) return <CmsSkeleton />;

	return (
		<div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div>
                        <label className="block text-[14px] font-medium text-[#212b36] mb-1">
                            Page Title<span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="pageTitle"
                            value={fieldValues?.pageTitle}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#FE9F43] focus:outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-[14px] font-medium text-[#212b36] mb-1">
                            Page Sub Title<span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="pageSubTitle"
                            value={fieldValues?.pageSubTitle}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#FE9F43] focus:outline-none"
                            required
                        />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div>
                        <label className="block text-[14px] font-medium text-[#212b36] mb-1">
                            Phone<span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="phone"
                            value={fieldValues?.phone}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#FE9F43] focus:outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-[14px] font-medium text-[#212b36] mb-1">
                            Email<span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="email"
                            value={fieldValues?.email}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#FE9F43] focus:outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-[14px] font-medium text-[#212b36] mb-1">
                            Address<span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="address"
                            value={fieldValues?.address}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#FE9F43] focus:outline-none"
                            required
                        />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div>
                        <label className="block text-[14px] font-medium text-[#212b36] mb-1">
                            Form Section Title One<span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="formSectionTitleOne"
                            value={fieldValues?.formSectionTitleOne}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#FE9F43] focus:outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-[14px] font-medium text-[#212b36] mb-1">
                            Form Section Title Two<span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="formSectionTitleTwo"
                            value={fieldValues?.formSectionTitleTwo}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#FE9F43] focus:outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-[14px] font-medium text-[#212b36] mb-1">
                            Form Section Title Three<span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="formSectionTitleThree"
                            value={fieldValues?.formSectionTitleThree}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#FE9F43] focus:outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-[14px] font-medium text-[#212b36] mb-1">
                            Button Text<span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="buttonText"
                            value={fieldValues?.buttonText}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#FE9F43] focus:outline-none"
                            required
                        />
                    </div>
                </div>
                <div className="flex justify-end gap-3">
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

export default ContactPageCmsForm;
