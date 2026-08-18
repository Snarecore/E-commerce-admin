import { useState, ChangeEvent, useEffect } from "react";
import { useAPI } from "../../../../hooks/useApi";
import apiConfig from "../../../../config/api.json";
import { subscriptionQueryKey } from "../../../../config/query-key";
import Modal from "../../../../components/modals/CommonModal";
import Button from "../../../../components/buttons/ButtonStyleOne";
import InputField from "../../../../components/Inputs/InputField";

interface SubscriptionData {
    name: string;
    commissionRate: string;
    durationInMonths: string;
    price: string;
    id?: string;
}

interface SubscriptionFormProps {
    isOpen: boolean;
    onClose: () => void;
    editData: SubscriptionData | null;
}

const initialFieldValues: SubscriptionData = {
    name: "",
    commissionRate: "",
    durationInMonths: "",
    price: ""
};

const requiredFields: { key: keyof SubscriptionData; value: string; label: string }[] = [
    { key: "name", value: "name", label: "Name" },
    { key: "commissionRate", value: "commissionRate", label: "Commission" },
    { key: "durationInMonths", value: "durationInMonths", label: "Duration (Months)" },
    { key: "price", value: "price", label: "Price" },
];

const SubscriptionForm = ({ isOpen, onClose, editData }: SubscriptionFormProps) => {
    const { postMutation, patchMutation, handleApiMutation } = useAPI();
    const [fieldValues, setFieldValues] = useState<SubscriptionData>(initialFieldValues);
    const apiUrl = apiConfig.subscription.subscriptionUrl;

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
            body: {
                ...fieldValues,
                commissionRate: Number(fieldValues.commissionRate),
                durationInMonths: Number(fieldValues.durationInMonths),
                price: Number(fieldValues.price),
            },
            invalidateQueryKey: [subscriptionQueryKey],
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
            title={editData ? "Edit Subscription" : "Create Subscription"}
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
                                label="Name"
                                type="text"
                                name="name"
                                value={fieldValues.name}
                                required
                                onChange={handleChange}
                            />
                        </div>
                        <div className="grid grid-cols-1 gap-6">
                            <InputField
                                label="Commission Rate (%)"
                                type="number"
                                name="commissionRate"
                                value={fieldValues.commissionRate}
                                required
                                onChange={handleChange}
                                // @ts-ignore
                                className="no-spinner-input"
                            />
                        </div>
                        <div className="grid grid-cols-1 gap-6">
                            <InputField
                                label="Duration (Months)"
                                type="number"
                                name="durationInMonths"
                                value={fieldValues.durationInMonths}
                                required
                                onChange={handleChange}
                                // @ts-ignore
                                className="no-spinner-input"
                            />
                        </div>
                        <div className="grid grid-cols-1 gap-6">
                            <InputField
                                label="Price"
                                type="number"
                                name="price"
                                value={fieldValues.price}
                                required
                                onChange={handleChange}
                                // @ts-ignore
                                className="no-spinner-input"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default SubscriptionForm;
