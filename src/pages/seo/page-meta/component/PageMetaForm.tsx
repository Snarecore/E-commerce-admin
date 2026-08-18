import { useState, ChangeEvent, useEffect } from "react";
import { useAPI } from "../../../../hooks/useApi";
import apiConfig from "../../../../config/api.json";
import { pageMetaQueryKey } from "../../../../config/query-key";
import Modal from "../../../../components/modals/CommonModal";
import Button from "../../../../components/buttons/ButtonStyleOne";
import InputField from "../../../../components/Inputs/InputField";

interface MetaData {
    page: string;
    metaTitle: string;
    metaDescription: string;
    metaKeywords: string;
    status: boolean;
    id?: string;
}

interface PageMetaFormProps {
    isOpen: boolean;
    onClose: () => void;
    editData: MetaData | null;
}

const initialFieldValues: MetaData = {
    page: "",
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    status: false,
};

const requiredFields: { key: keyof MetaData; value: string; label: string }[] = [
    { key: "page", value: "page", label: "Page" },
    { key: "metaTitle", value: "metaTitle", label: "Meta Title" },
    { key: "metaDescription", value: "metaDescription", label: "Meta Description" },
    { key: "metaKeywords", value: "metaKeywords", label: "Meta Keywords" },
];

const PageMetaForm = ({ isOpen, onClose, editData }: PageMetaFormProps) => {
    const { postMutation, patchMutation, handleApiMutation } = useAPI();
    const [fieldValues, setFieldValues] = useState<MetaData>(initialFieldValues);
    const apiUrl = apiConfig.pageMeta.pageMetaUrl;

    useEffect(() => {
        if (editData) {
            setFieldValues(editData);
        } else {
            resetForm();
        }
    }, [editData]);

    const resetForm = () => {
        setFieldValues(initialFieldValues);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setFieldValues((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmitForm = async () => {
        const mutation = editData ? patchMutation : postMutation;
        const url = editData ? `${apiUrl}/${editData.id}` : apiUrl;

        const result = await handleApiMutation({
            // @ts-expect-error - handleApiMutation expects specific mutation types
            mutation,
            url,
            body: fieldValues as unknown as Record<string, unknown>,
            invalidateQueryKey: [pageMetaQueryKey],
            showSuccessMessage: true,
            showErrorMessage: true,
            requiredFields,
        });

        if (result?.success) {
            handleClose();
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={editData ? "Edit Page Meta" : "Create Page Meta"}
            footerButtons={
                <>
                    <Button label="Cancel" onClick={handleClose} color="var(--color-secondary)" hoverColor="var(--color-secondary-hover)" />
                    <Button label="Save" onClick={handleSubmitForm} color="var(--color-primary)" hoverColor="var(--color-primary-hover)" />
                </>
            }
        >
            <div className="space-y-6">
                {/* Basic Information Section */}
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">Basic Information</h2>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-6">
                            <InputField
                                label="Page"
                                type="text"
                                name="page"
                                value={fieldValues.page}
                                required
                                onChange={handleChange}
                            />
                        </div>
                        <div className="grid grid-cols-1 gap-6">
                            <InputField
                                label="Meta Title"
                                type="text"
                                name="metaTitle"
                                value={fieldValues.metaTitle}
                                required
                                onChange={handleChange}
                            />
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                            <p>Meta Description <span className="text-red-500 font-bold">*</span></p>
                            <textarea
                                label="Meta Description"
                                type="textarea"
                                name="metaDescription"
                                value={fieldValues.metaDescription}
                                required
                                rows={4}
                                // @ts-ignore
                                onChange={handleChange}
                                className="border border-gray-300 bg-white rounded-md p-2 text-justify"
                            />
                        </div>
                        <div className="grid grid-cols-1 gap-6">
                            <InputField
                                label="Meta Keywords"
                                type="text"
                                name="metaKeywords"
                                value={fieldValues.metaKeywords}
                                required
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default PageMetaForm;
