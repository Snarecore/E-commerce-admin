import React, { useState, useEffect } from "react";
import Modal from "../../../../../components/modals/CommonModal";
import ImageUpload from "../../../../../components/image/ImageUpload";
import InputField from "../../../../../components/Inputs/InputField";
import ToggleInput from "../../../../../components/Inputs/ToggleButton";
import Button from "../../../../../components/buttons/ButtonStyleOne";
import TextEditor from "../../../../../components/Editor/TextEditor";
import { useAPI } from "../../../../../hooks/useApi";
import apiConfig from "../../../../../config/api.json";
import { popupQueryKey } from "../../../../../config/query-key";
import toast from "react-hot-toast";

interface PopupModalProps {
    isOpen: boolean;
    onClose: () => void;
    editData: any | null;
    fetchData: () => void;
}

interface FormState {
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
    image: string | File;
}

const initialFormState: FormState = {
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    isActive: true,
    image: ""
};

const PopupModal: React.FC<PopupModalProps> = ({
    isOpen,
    onClose,
    editData,
    fetchData
}) => {
    const { postFormMutation, patchFormMutation, handleApiMutation } = useAPI();
    const [formData, setFormData] = useState<FormState>(initialFormState);
    const [isLoading, setIsLoading] = useState(false);
    const apiUrl = apiConfig.setting.popupUrl;

    const sanitizeString = (val: any) => {
        if (!val || val === "undefined" || val === "null") return "";
        return String(val);
    };

    useEffect(() => {
        if (editData) {
            setFormData({
                title: sanitizeString(editData.title),
                description: sanitizeString(editData.description),
                startDate: editData.startDate && editData.startDate !== "undefined" ? new Date(editData.startDate).toISOString().slice(0, 16) : "",
                endDate: editData.endDate && editData.endDate !== "undefined" ? new Date(editData.endDate).toISOString().slice(0, 16) : "",
                isActive: editData.isActive !== undefined ? editData.isActive : true,
                image: editData.image || ""
            });
        } else {
            setFormData(initialFormState);
        }
    }, [editData, isOpen]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleDescriptionChange = (value: string) => {
        setFormData((prev) => ({
            ...prev,
            description: value
        }));
    };

    const handleImageUpload = (file: File | null) => {
        if (file) {
            setFormData((prev) => ({ ...prev, image: file }));
        }
    };

    const handleToggleChange = (checked: boolean) => {
        setFormData((prev) => ({
            ...prev,
            isActive: checked
        }));
    };

    const handleSubmit = async () => {
        // Validate Image on create
        if (!editData && !formData.image) {
            toast.error("Popup image is required.");
            return;
        }

        // Validate Date Range
        if (formData.startDate && formData.endDate) {
            const start = new Date(formData.startDate).getTime();
            const end = new Date(formData.endDate).getTime();
            if (start >= end) {
                toast.error("Start Date must be earlier than Expiration Date.");
                return;
            }
        }

        setIsLoading(true);
        try {
            const mutation = editData ? patchFormMutation : postFormMutation;
            const url = editData ? `${apiUrl}/${editData.id}` : apiUrl;

            const payload: any = {
                title: formData.title?.trim() ? formData.title.trim() : "",
                description: formData.description?.trim() ? formData.description.trim() : "",
                startDate: formData.startDate ? new Date(formData.startDate).toISOString() : "",
                endDate: formData.endDate ? new Date(formData.endDate).toISOString() : "",
                isActive: formData.isActive
            };

            // Only attach image if a new File was selected or on create
            if (formData.image instanceof File) {
                payload.image = formData.image;
            }

            const result = await handleApiMutation({
                // @ts-ignore
                mutation,
                url,
                body: payload,
                invalidateQueryKey: [popupQueryKey],
                showSuccessMessage: true,
                showErrorMessage: true,
                requiredFields: editData ? [] : [{ key: "image", value: "image", label: "Image" }]
            });

            if (result?.success || result?.data) {
                fetchData();
                onClose();
            }
        } catch (err) {
            console.error("Failed to save popup banner:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const getImagePreviewUrl = () => {
        if (formData.image instanceof File) {
            return URL.createObjectURL(formData.image);
        }
        if (typeof formData.image === "string" && formData.image) {
            return formData.image;
        }
        return "";
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            width="w-[700px] max-w-2xl"
            title={editData ? "Edit Popup Banner" : "Create Popup Banner"}
            footerButtons={
                <>
                    <Button
                        label="Cancel"
                        onClick={onClose}
                        color="var(--color-secondary)"
                        hoverColor="var(--color-secondary-hover)"
                    />
                    <Button
                        label="Save Popup"
                        onClick={handleSubmit}
                        color="var(--color-primary)"
                        hoverColor="var(--color-primary-hover)"
                        isLoading={isLoading}
                        disabled={isLoading}
                    />
                </>
            }
        >
            <div className="space-y-4 text-sm text-left">
                {/* Image Upload */}
                <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                        Popup Banner Image <span className="text-red-500">*</span>
                        <span className="text-xs text-gray-400 font-normal ml-1">(Recommended: 600x600 or 800x600 px)</span>
                    </label>
                    <ImageUpload
                        value={getImagePreviewUrl()}
                        onChange={handleImageUpload}
                    />
                </div>

                {/* Title */}
                <div>
                    <InputField
                        label="Popup Title / Campaign Name (Optional)"
                        type="text"
                        name="title"
                        value={formData.title}
                        placeholder="e.g. Eid Offer or Special Discount"
                        onChange={handleInputChange}
                    />
                </div>

                {/* Description (Rich Text Summernote / Quill Editor) */}
                <div className="w-full">
                    <TextEditor
                        value={formData.description}
                        onChange={handleDescriptionChange}
                    />
                </div>

                {/* Scheduling Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-orange-50/50 p-3 rounded-xl border border-orange-100">
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                            Active Start Date & Time
                        </label>
                        <input
                            type="datetime-local"
                            name="startDate"
                            value={formData.startDate}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded-lg p-2 bg-white focus:ring-2 focus:ring-orange-400 outline-none text-xs"
                        />
                        <p className="text-[10px] text-gray-400 mt-1">Leave empty to activate immediately</p>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                            Expiration Date & Time
                        </label>
                        <input
                            type="datetime-local"
                            name="endDate"
                            value={formData.endDate}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded-lg p-2 bg-white focus:ring-2 focus:ring-orange-400 outline-none text-xs"
                        />
                        <p className="text-[10px] text-gray-400 mt-1">Leave empty to keep active indefinitely</p>
                    </div>
                </div>

                {/* Active Toggle */}
                <div className="pt-2">
                    <ToggleInput
                        label="Status (Active / Enabled)"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleToggleChange}
                    />
                </div>
            </div>
        </Modal>
    );
};

export default PopupModal;
