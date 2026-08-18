import { ChangeEvent, useState } from "react";
import Modal from "../../../../components/modals/CommonModal";
import { useAPI } from "../../../../hooks/useApi";
import apiConfig from "../../../../config/api.json";
import { adminRegistrationQueryKey } from "../../../../config/query-key";
import InputField from "../../../../components/Inputs/InputField";
import Button from "../../../../components/buttons/ButtonStyleOne";
import { Role } from "../../../../enum/role.enum";
import { showSuccessToast } from "../../../../utils/toast-utils";


const initialFieldValues = {
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: Role.ADMIN
};

const requiredFields = [
    { key: "name", value: "name", label: "text" },
    { key: "phone", value: "phone", label: "text" },
    { key: "email", value: "email", label: "text" },
    { key: "password", value: "password", label: "text" },
    { key: "confirmPassword", value: "confirm password", label: "text" }
];


const CreateAdminForm = ({ isOpen, onClose, editData, fetchData }: any) => {
    const { postMutation, handleApiMutation } = useAPI();
    const [fieldValues, setFieldValues] = useState(initialFieldValues);
    // @ts-ignore
    const [isLoading, setIsLoading] = useState(false);
    // @ts-ignore
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setFieldValues((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const validateEmail = (email: string) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
      };

    const handleSubmitForm = async () => {
        if (!validateEmail(fieldValues.email)) {
            showSuccessToast("Invalid email address");
            return;
        }
        
        if (fieldValues.password !== fieldValues.confirmPassword) {
            showSuccessToast("Passwords do not match");
            return;
        }

        const result = await handleApiMutation({
            mutation: postMutation,
            url: apiConfig.auth.registrationUrl,
            body: fieldValues,
            invalidateQueryKey: [adminRegistrationQueryKey],
            showSuccessMessage: true,
            showErrorMessage: true,
            requiredFields
        });

        if (result?.success) {
            onClose();
            fetchData();
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={editData ? "Edit First Category" : "Create New Admin"}
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
                    <InputField label="Name" type="text"
                        name="name"
                        value={fieldValues.name}
                        required
                        onChange={handleChange} />
                </div>

                <div>
                    <InputField label="Email" type="text"
                        name="email"
                        value={fieldValues.email}
                        required
                        onChange={handleChange} />
                </div>

                <div>
                    <InputField label="Phone" type="text"
                        name="phone"
                        value={fieldValues.phone}
                        required
                        onChange={handleChange} />
                </div>

                <div>
                    <InputField label="Password" type="text"
                        name="password"
                        value={fieldValues.password}
                        required
                        onChange={handleChange} />
                </div>

                <div>
                    <InputField label="Confirm Password" type="text"
                        name="confirmPassword"
                        value={fieldValues.confirmPassword}
                        required
                        onChange={handleChange} />
                </div>
            </div>
        </Modal>
    );
};

export default CreateAdminForm;