import { useState, ChangeEvent, useEffect } from "react";
import Modal from "../../../../components/modals/CommonModal";
import Button from "../../../../components/buttons/ButtonStyleOne";
import InputField from "../../../../components/Inputs/InputField";
import { useAPI } from "../../../../hooks/useApi";
import apiConfig from "../../../../config/api.json";
import { faqQueryKey } from "../../../../config/query-key";


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
    name: "",
    email: "",
    phone: "",
    status: false
};

const requiredFields: any = [
    { key: "name", value: "name" },
    { key: "email", value: "email" },
    { key: "phone", value: "phone" }
];

const VendorForm = ({ isOpen, onClose, editData }: any) => {
    const { postMutation, patchMutation, handleApiMutation } = useAPI();
    const [fieldValues, setFieldValues] = useState(initialFieldValues);
    const apiUrl = apiConfig.setting.faqUrl;

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

    const handleSubmitForm = async () => {
        const mutation = editData ? patchMutation : postMutation;
        const url = editData ? `${apiUrl}/${editData.id}` : apiUrl;

        const result = await handleApiMutation({
            // @ts-ignore
            mutation,
            url,
            body: fieldValues,
            invalidateQueryKey: [faqQueryKey],
            showSuccessMessage: true,
            showErrorMessage: true,
            requiredFields
        });

        if (result?.success) {
            onClose();
            resetForm();
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={editData ? "Edit FAQ" : "Create FAQ"}
            footerButtons={
                <>
                    <Button label="Cancel" onClick={onClose} color="#000000" hoverColor="#3b444b" />
                    <Button
                        label="Save"
                        onClick={handleSubmitForm}
                        color="var(--color-primary)"
                        hoverColor="var(--color-primary-hover)"
                    />
                </>
            }
        >
            <div className="space-y-4">

                <div>
                    <InputField label="Name" type="text" name="name" value={fieldValues.name} required onChange={handleChange} />
                </div>

                <div>
                    <InputField label="Email" type="text" name="email" value={fieldValues.email} required onChange={handleChange} />
                </div>

                <div>
                    <InputField label="Phone" type="phone" name="phone" value={fieldValues.phone} required onChange={handleChange} />
                </div>
            </div>
        </Modal>
    );
};

export default VendorForm;
