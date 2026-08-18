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
    question: "",
    answer: "",
    status: false
};

const requiredFields: any = [
    { key: "question", value: "question" },
    { key: "answer", value: "answer" }
];

const FaqForm = ({ isOpen, onClose, editData }: any) => {
    const { postMutation, patchMutation, handleApiMutation } = useAPI();
    const [isLoading, setIsLoading] = useState(false);
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
        setIsLoading(true);
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
        setIsLoading(false);
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
                        isLoading={isLoading}
						disabled={isLoading}
                    />
                </>
            }
        >
            <div className="space-y-4">
                
                <div>
                    <InputField label="Question" type="text" name="question" value={fieldValues.question} required onChange={handleChange} />
                </div>

                <div>
                    <InputField label="Answer" type="text" name="answer" value={fieldValues.answer} required onChange={handleChange} />
                </div>
            </div>
        </Modal>
    );
};

export default FaqForm;
