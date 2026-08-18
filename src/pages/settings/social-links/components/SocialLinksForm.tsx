import Modal from "../../../../components/modals/CommonModal";
import { useState, ChangeEvent, useEffect } from "react";
import ImageUpload from "../../../../components/image/ImageUpload";
import { useAPI } from "../../../../hooks/useApi";
import apiConfig from "../../../../config/api.json";
import { socialLinksQueryKey } from "../../../../config/query-key";
import Button from "../../../../components/buttons/ButtonStyleOne";
import InputField from "../../../../components/Inputs/InputField";


const initialFieldValues = {
    link: "",
    icon: "" as string | File,
};

const requiredFields: any = [
    { key: "icon", value: "icon" },
    { key: "link", value: "link" }
];

const SocialLinksForm = ({ isOpen, onClose, editData }: any) => {
    const { postFormMutation, patchFormMutation, handleApiMutation } = useAPI();
    const [isLoading, setIsLoading] = useState(false);
    const [fieldValues, setFieldValues] = useState(initialFieldValues);
    const apiUrl = apiConfig.socialLinks.socialLinks;

    useEffect(() => {
        if (editData) {
            setFieldValues(editData);
        } else {
            setFieldValues(initialFieldValues);
        }
    }, [editData]);

    const resetForm = () => {
        setFieldValues(initialFieldValues);
    };

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setFieldValues((prevState) => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleImageUpload = (file: File | null) => {
        if (file) {
            setFieldValues((prevState) => ({ ...prevState, icon: file }));
        }
    };

    const handleSubmitForm = async () => {
        setIsLoading(true);
        const mutation = editData ? patchFormMutation : postFormMutation;
        const url = editData ? `${apiUrl}/${editData.id}` : apiUrl;

        const result = await handleApiMutation({
            // @ts-ignore
            mutation,
            url,
            body: fieldValues,
            invalidateQueryKey: [socialLinksQueryKey],
            showSuccessMessage: true,
            showErrorMessage: true,
            requiredFields
        });

        if (result?.success) {
            onClose();
            resetForm();
        }
        setIsLoading(false);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={editData ? "Edit Social Links" : "Create Social Links"}
            footerButtons={
                <>
                    <Button label="Cancel" onClick={onClose} color="var(--color-secondary)" hoverColor="var(--color-secondary-hover)" />
                    <Button
                        label="Save"
                        onClick={handleSubmitForm}
                        color="var(--color-primary)"
                        hoverColor="var(--color-primary-hover)"
                        isLoading={isLoading}
                        disabled={isLoading}
                    />
                </>
            }
        >
            <div className="space-y-4">
                <div>
                    <h3 className="block text-sm font-medium text-gray-700">Image (Recommended Size: 512*512 PX)</h3>
                    <ImageUpload
                        value={
                            typeof fieldValues.icon === "string"
                                ? fieldValues.icon
                                : URL.createObjectURL(fieldValues.icon)
                        }
                        onChange={handleImageUpload}
                    />
                </div>
                <div>
                    <InputField label="Link" type="text" name="link" value={fieldValues.link} required onChange={handleChange} />
                </div>
            </div>
        </Modal>
    );
};

export default SocialLinksForm;
