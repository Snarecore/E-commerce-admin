import { useState } from "react";
import { RiArrowDropDownLine } from "react-icons/ri";
import SelectInput from "../../../components/Inputs/SelectField";
import InputField from "../../../components/Inputs/InputField";

const taxOptions = [
    { label: "Choose", value: "" },
    { label: "5%", value: "5" },
    { label: "10%", value: "10" },
    { label: "15%", value: "15" },
];

const discountOptions = [
    { label: "Select", value: "" },
    { label: "Percentage", value: "percentage" },
    { label: "Fixed Amount", value: "fixed" },
];

const taxTypeOptions = [
    { label: "Select", value: "" },
    { label: "Exclusive", value: "exclusive" },
    { label: "Sales Tax", value: "salesTax" },
];

const PricingAndStocks = () => {
    const [isOpen, setIsOpen] = useState(true);
    const [formData, setFormData] = useState<Record<string, string>>({
        productType: "single",
        quantity: "",
        price: "",
        tax: "",
        taxType: "",
        discountType: "",
        discountValue: "",
        quantityAlert: "",
    });

    const handleChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    return (
        <div className="mt-6">
            {/* Pricing & Stocks Information Section */}
            <div className="bg-white rounded-lg shadow-md">
                {/* Header */}
                <div className="flex justify-between items-center text-black px-4 sm:px-6 py-3 md:py-4">
                    <div className="text-base font-bold text-[#212b36]">Pricing & Stocks</div>
                    <RiArrowDropDownLine
                        className={`text-2xl sm:text-3xl cursor-pointer transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                        onClick={() => setIsOpen(!isOpen)}
                    />
                </div>
                <hr className="border-gray-300" />

                {/* Form Inputs (Collapsible) */}
                <div className={`transition-all duration-300 ${isOpen ? "max-h-screen opacity-100 py-4 px-4 sm:px-6" : "max-h-0 opacity-0 overflow-hidden"}`}>
                    {/* Product Type Selection */}
                    <div className="flex space-x-4 py-2">
                        {["single", "variable"].map((type) => (
                            <label key={type} className="flex items-center space-x-2">
                                <input
                                    type="radio"
                                    name="productType"
                                    value={type}
                                    checked={formData.productType === type}
                                    onChange={() => handleChange("productType", type)}
                                    className="form-radio"
                                />
                                <span>{type.charAt(0).toUpperCase() + type.slice(1)} Product</span>
                            </label>
                        ))}
                    </div>

                    {/* Inputs Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        {[
                            { id: "quantity", label: "Quantity", type: "text" },
                            { id: "price", label: "Price", type: "text" },
                            { id: "tax", label: "Tax", type: "select", options: taxOptions },
                            { id: "taxType", label: "Tax Type", type: "select", options: taxTypeOptions },
                            { id: "discountType", label: "Discount Type", type: "select", options: discountOptions },
                            { id: "discountValue", label: "Discount Value", type: "text" },
                            { id: "quantityAlert", label: "Quantity Alert", type: "number" },
                        ].map(({ id, label, type, options }) => (
                            type === "select" ? (
                                <SelectInput
                                    key={id}
                                    label={label}
                                    // @ts-ignore
                                    value={formData[id] || ""}
                                    options={options || []}
                                    // @ts-ignore
                                    onChange={(val) => handleChange(id, val)}
                                    required
                                />
                            ) : (
                                <InputField
                                    key={id}
                                    // @ts-ignore
                                    label={<span>{label}</span>}
                                    value={formData[id] || ""}
                                    // @ts-ignore
                                    onChange={(val) => handleChange(id, val)}
                                    required
                                />
                            )
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PricingAndStocks;