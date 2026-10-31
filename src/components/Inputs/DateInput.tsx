import React from "react";

interface DateInputProps {
    label: string;
    required?: boolean;
    placeholder?: string;
    value?: string;
    onChange?: (value: string) => void;
}

const DateInput: React.FC<DateInputProps> = ({ label, required, placeholder, value, onChange }) => {
    return (
        <div>
            <label className="text-sm font-semibold mb-2 block text-[var(--ui-text)]">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <input
                type="date"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange && onChange(e.target.value)}
                className="block w-full h-10 sm:h-10 p-2 bg-[var(--ui-surface)] text-[var(--ui-text)] border border-[var(--ui-border)] rounded-lg outline-none 
                            transition-all duration-300 cursor-pointer text-sm sm:text-base appearance-none focus:border-[var(--primary-color)]"
                style={{ height: "40px" }}
            />
        </div>
    );
};

export default DateInput;
