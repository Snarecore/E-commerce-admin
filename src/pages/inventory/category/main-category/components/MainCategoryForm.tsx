import { useState, useEffect, ChangeEvent } from "react";
import Modal from "../../../../../components/modals/CommonModal";
import ImageUpload from "../../../../../components/image/ImageUpload";
import { useAPI } from "../../../../../hooks/useApi";
import apiConfig from "../../../../../config/api.json";
import { mainCategoryQueryKey } from "../../../../../config/query-key";
import InputField from "../../../../../components/Inputs/InputField";
import ToggleInput from "../../../../../components/Inputs/ToggleButton";
import Button from "../../../../../components/buttons/ButtonStyleOne";

const initialFieldValues = {
    name: "",
    image: "" as string | File,
    bannerImage: "" as string | File,
    status: true,
    position: ""
};

const requiredFields: any = [
    { key: "image", value: "image", label: "image" },
    { key: "bannerImage", value: "banner image", label: "image" },
    { key: "name", value: "name", label: "name" }
];

const MainCategoryForm = ({ isOpen, onClose, editData }: any) => {
    const [fieldValues, setFieldValues] = useState(initialFieldValues);
    const [isLoading, setIsLoading] = useState(false);
    const { postFormMutation, patchFormMutation, handleApiMutation } = useAPI();
    const apiUrl = apiConfig.inventory.mainCategoryUrl;

    useEffect(() => {
        if (editData) {
            setFieldValues({
                ...editData,
                position: editData.position === 9999 ? "" : editData.position
            });
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

    // const handleImageUpload = (file: File) => {
    //     // @ts-ignore
    //     setFieldValues((prevState) => ({ ...prevState, image: file }));
    // };

    // const handleBannerImageUpload = (file: File) => {
    //     // @ts-ignore
    //     setFieldValues((prevState) => ({ ...prevState, bannerImage: file }));
    // };

    const handleImageUpload = (file: File | null) => {
        if (file) {
            setFieldValues((prevState) => ({ ...prevState, image: file }));
        }
    };

    const handleBannerImageUpload = (file: File | null) => {
        if (file) {
            setFieldValues((prevState) => ({ ...prevState, bannerImage: file }));
        }
    };

    const handleSwitchChange = (checked: boolean) => {
        setFieldValues((prevState) => ({
            ...prevState,
            status: checked,
        }));
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
            invalidateQueryKey: [mainCategoryQueryKey],
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
            title={editData ? "Edit Category" : "Create Category"}
            footerButtons={
                <>
                    <Button label="Cancel" onClick={onClose} color="var(--color-secondary)" hoverColor="var(--color-secondary-hover)"/>
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
                    <h3 className="block text-sm font-medium text-gray-700">Image:
                    <span className="text-xs text-gray-500 ml-1">(Width: 80px)</span>
                    </h3>
                    <ImageUpload
                        value={
                            typeof fieldValues.image === "string"
                                ? fieldValues.image
                                : fieldValues.image
                                ? URL.createObjectURL(fieldValues.image)
                                : ""
                        }
                        onChange={handleImageUpload}
                    />
                </div>
                <div>
                    <h3 className="block text-sm font-medium text-gray-700">Banner Image:
                    <span className="text-xs text-gray-500 ml-1">(Recommended Size: 1920x192 PX)</span>
                    </h3>
                    <ImageUpload
                        value={
                            typeof fieldValues.bannerImage === "string"
                                ? fieldValues.bannerImage
                                : fieldValues.bannerImage
                                ? URL.createObjectURL(fieldValues.bannerImage)
                                : ""
                        }
                        onChange={handleBannerImageUpload}
                    />
                </div>

                <div>
                    <InputField label="Name" type="text" name="name" value={fieldValues.name} required onChange={handleChange} />
                </div>

                <div>
                    <InputField label="Position" type="number" name="position" value={fieldValues.position} onChange={handleChange} />
                </div>

                <ToggleInput
                    label="Status"
                    name="status"
                    checked={fieldValues.status}
                    onChange={handleSwitchChange}
                />
            </div>
        </Modal>
    );
};

export default MainCategoryForm;
