import Modal from "../../../../../components/modals/CommonModal";
import { useState, ChangeEvent, useEffect } from "react";
import ImageUpload from "../../../../../components/image/ImageUpload";
import { useAPI } from "../../../../../hooks/useApi";
import apiConfig from "../../../../../config/api.json";
import { promotionsQueryKey } from "../../../../../config/query-key";
import Button from "../../../../../components/buttons/ButtonStyleOne";
import InputField from "../../../../../components/Inputs/InputField";
import ToggleInput from "../../../../../components/Inputs/ToggleButton";

// interface HeroSliderDataProps {
//     id: string;
//     image: string;
//     link: string;
//     status: boolean;
// }

// interface HeroSliderFormProps {
//     isOpen: boolean;
//     onClose: () => void;
//     fetchData: () => void;
//     editData: HeroSliderDataProps | null;
// }

// interface FieldValues {
//     link: string;
//     image: "";
//     status: boolean;
// }

const initialFieldValues = {
    link: "",
    image: "" as string | File,
    status: false
};

const requiredFields: any = [
    { key: "image", value: "image" },
    { key: "link", value: "link" }
];

const PromotionsForm = ({ isOpen, onClose, editData }: any) => {
    const { postFormMutation, patchFormMutation, handleApiMutation } = useAPI();
    const [isLoading, setIsLoading] = useState(false);
    const [fieldValues, setFieldValues] = useState(initialFieldValues);
    const apiUrl = apiConfig.setting.promotionsUrl;

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

    // const handleImageUpload = (file: File) => {
    //     setFieldValues((prevState) => ({ ...prevState, image: file }));
    // };

    const handleImageUpload = (file: File | null) => {
        if (file) {
            setFieldValues((prevState) => ({ ...prevState, image: file }));
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
            invalidateQueryKey: [promotionsQueryKey],
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
            title={editData ? "Edit Promotion" : "Create Promotion"}
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
                    <span className="text-xs text-gray-500 ml-1">(Recommended Size: 640x400 PX)</span>
                    </h3>
                    {/* <ImageUpload value={fieldValues.image} onChange={handleImageUpload} /> */}
                    <ImageUpload
                        value={
                            typeof fieldValues.image === "string"
                                ? fieldValues.image
                                : URL.createObjectURL(fieldValues.image)
                        }
                        onChange={handleImageUpload}
                    />
                </div>
                <div>
                    <InputField label="Link" type="text" name="link" value={fieldValues.link} required onChange={handleChange} />
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

export default PromotionsForm;
