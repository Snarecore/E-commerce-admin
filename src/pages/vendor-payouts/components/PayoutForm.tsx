import { useState, ChangeEvent, useEffect } from "react";
import apiConfig from "../../../config/api.json";
import Button from "../../../components/buttons/ButtonStyleOne";
import InputField from "../../../components/Inputs/InputField";
import { useAPI } from "../../../hooks/useApi";
import SelectInput from "../../../components/Inputs/SelectField";
import Modal from "../../../components/modals/CommonModal";

interface SubscriptionData {
    id?: string; 
    status: string;
    paymentRef: string;
    gateway: string;
}

interface SubscriptionFormProps {
    isOpen: boolean;
    onClose: () => void;
    editData: SubscriptionData | null;
}

const initialFieldValues: SubscriptionData = {
    status: "",
    paymentRef: "",
    gateway: "",
};

const requiredFields: {
    key: keyof SubscriptionData;
    value: string;
    label: string;
}[] = [
        { key: "status", value: "status", label: "Status" },
    ];

const PayoutForm = ({ isOpen, onClose, editData }: SubscriptionFormProps) => {
    const { postMutation, patchMutation, handleApiMutation } = useAPI();
    const [fieldValues, setFieldValues] = useState<SubscriptionData>(initialFieldValues);
    const apiUrl = apiConfig.subscription.vendorPayoutUpdateUrl;
    const [isLoading, setIsLoading] = useState(false);

    const getStatusOptions = () => {
        if (editData?.status === "APPROVED") {
            return [{ label: "Paid", value: "PAID" }];
        } else {
            return [{ label: "Approved", value: "APPROVED" }];
        }
    };

    const statusOptions = getStatusOptions();

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
        setIsLoading(true);
        const mutation = editData ? patchMutation : postMutation;
        const url = editData ? `${apiUrl}/${editData.id}/status` : apiUrl;

        const result = await handleApiMutation({
            // @ts-ignore
            mutation,
            url,
            body: {
                ...fieldValues,
            },
            invalidateQueryKey: [],
            showSuccessMessage: true,
            showErrorMessage: true,
            requiredFields,
        });

        if (result?.success) {
            handleClose();
            setIsLoading(false)
        }
    };

    const selectedStatusOption = statusOptions.find(option => option.value === fieldValues.status) || null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={editData ? "Update Status" : "Create Subscription"}
            footerButtons={
                <>
                    <Button
                        label="Cancel"
                        onClick={handleClose}
                        color="var(--color-secondary)"
                        hoverColor="var(--color-secondary-hover)"
                    />
                    <Button
                        label="Save"
                        onClick={handleSubmitForm}
                        color="var(--color-primary)"
                        hoverColor="var(--color-primary-hover)"
                        isLoading={isLoading}
                    />
                </>
            }
        >
            <div className="space-y-6">
                <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-6">
                        <SelectInput
                            label="Status"
                            value={selectedStatusOption}
                            options={statusOptions}
                            onChange={(selected) =>
                                setFieldValues((prev) => ({
                                    ...prev,
                                    status: selected.value,
                                }))
                            }
                            required
                            disabled={fieldValues.status === 'PAID'}
                        />
                    </div>

                    {
                        fieldValues.status === 'PAID' && (
                            <>
                                <div className="grid grid-cols-1 gap-6">
                                    <InputField
                                        label="Payout Reference"
                                        type="text"
                                        name="paymentRef"
                                        value={fieldValues.paymentRef}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="grid grid-cols-1 gap-6">
                                    <InputField
                                        label="Gateway"
                                        type="text"
                                        name="gateway"
                                        value={fieldValues.gateway}
                                        onChange={handleChange}
                                    />
                                </div>
                            </>
                        )
                    }
                </div>
            </div>
        </Modal>
    );
};

export default PayoutForm;
