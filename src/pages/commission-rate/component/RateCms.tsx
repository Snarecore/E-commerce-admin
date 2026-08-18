import { ChangeEvent, useEffect, useState } from "react";
import apiConfig from "../../../config/api.json";
import { useAPI } from "../../../hooks/useApi";
import { commissionRateQueryKey } from "../../../config/query-key";
import InputField from "../../../components/Inputs/InputField";

const initialFieldValues = {
    commissionRate: "",
};

const requiredFields = [
    { key: "commissionRate", value: "commission rate", label: "commission rate" },
];

const CommissionRateCmsForm = () => {
    const apiUrl = apiConfig.commission.commissionRateUrl;
    const { postMutation, fetchData, handleApiMutation } = useAPI();
    const [fieldValues, setFieldValues] = useState(initialFieldValues);

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
            // @ts-ignore
            mutation,
            url,
            body: { ...fieldValues },
            invalidateQueryKey: [commissionRateQueryKey],
            showSuccessMessage: true,
            showErrorMessage: true,
            requiredFields
        });

        if (result?.success) {
            fetchCommissionRateCmsData();
        }
    };

    const fetchCommissionRateCmsData = async () => {
        try {
            const result = await fetchData({ apiUrl });
            if (result && result.length > 0) {
                setFieldValues(result[0]);
            }
        } catch{
            console.error()
        }
    };

    useEffect(() => {
        fetchCommissionRateCmsData();
    }, []);

    return (
        <div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="mb-4">
                    <InputField
                        label="Commission Rate (%)"
                        type="number"
                        name="commissionRate"
                        value={fieldValues.commissionRate}
                        onChange={handleChange}
                        required
                    />

                </div>

                <div className="flex justify-end gap-3">
                    <button onClick={handleSubmitForm} className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-md hover:bg-[var(--color-primary-hover)] cursor-pointer">
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CommissionRateCmsForm;
