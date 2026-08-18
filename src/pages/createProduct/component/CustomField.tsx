import { useState } from "react";
import { RiArrowDropDownLine } from "react-icons/ri";
import InputField from "../../../components/Inputs/InputField";
import DateInput from "../../../components/Inputs/DateInput";
import SelectInput from "../../../components/Inputs/SelectField";

const CustomFields = () => {
    const [isOpen, setIsOpen] = useState(true);
    const [selectedFields, setSelectedFields] = useState({
        warranty: true,
        manufacturer: true,
        expiry: true,
    });

    // State for storing input values
    const [formData, setFormData] = useState({
        warranty: "",
        manufacturer: "",
        expiry: "",
        manufacturedDate: "",
    });

    // Toggle checkboxes
    const handleCheckboxChange = (field: string) => {
        setSelectedFields((prev) => ({
            ...prev,
            // @ts-ignore
            [field]: !prev[field],
        }));
    };

    // Handle input/select field changes
    const handleChange = (field: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    return (
        <div className="mt-6">
            <div className="bg-white rounded-lg shadow-md">
                {/* Header */}
                <div className="flex justify-between items-center px-4 sm:px-6 py-3 md:py-4">

                    <div className="text-base font-bold text-[#212b36]">
                        Custom Fields
                    </div>
                    <RiArrowDropDownLine
                        className={`text-2xl sm:text-3xl cursor-pointer transition-transform duration-300 ${isOpen ? "rotate-180" : ""
                            }`}
                        onClick={() => setIsOpen(!isOpen)}
                    />
                </div>
                <hr className="border-gray-200 mb-4" />

                {/* Checkbox Selection */}
                <div className="flex flex-wrap gap-3 bg-gray-100 p-3 rounded-md mx-6">
                    {Object.entries(selectedFields).map(([key, value]) => (
                        <label key={key} className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={value}
                                onChange={() => handleCheckboxChange(key)}
                                className="hidden"
                            />
                            <div
                                className={`w-5 h-5 flex items-center justify-center rounded transition-all ${value ? "bg-[var(--color-primary)] text-white" : "bg-white border border-gray-300"
                                    }`}
                            >
                                {value && <span className="font-bold">✓</span>}
                            </div>
                            <span className="text-sm text-black">
                                {key.charAt(0).toUpperCase() + key.slice(1)}
                            </span>
                        </label>
                    ))}
                </div>

                {/* Fields Section */}
                {isOpen && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pb-4 mx-6">
                        {selectedFields.warranty && (
                            <SelectInput
                                label="Warranty"
                                options={[
                                    { label: "Select", value: "" },
                                    { label: "1 Year", value: "1" },
                                    { label: "2 Years", value: "2" },
                                    { label: "3 Years", value: "3" },
                                ]}
                                // @ts-ignore
                                value={formData.warranty}
                                // @ts-ignore
                                onChange={(val) => handleChange("warranty", val)}
                                required
                            />
                        )}
                        {selectedFields.manufacturer && (
                            <InputField
                                label="Manufacturer"
                                placeholder="Enter manufacturer name"
                                value={formData.manufacturer}
                                // @ts-ignore
                                onChange={(val) => handleChange("manufacturer", val)}
                                required
                            />
                        )}
                        {selectedFields.expiry && (
                            <DateInput
                                label="Expiry On"
                                value={formData.expiry}
                                onChange={(val) => handleChange("expiry", val)}
                                required
                            />
                        )}
                        {selectedFields.warranty && (
                            <DateInput
                                label="Manufactured Date"
                                value={formData.manufacturedDate}
                                onChange={(val) => handleChange("manufacturedDate", val)}
                                required placeholder="Select Date"                            />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomFields;
