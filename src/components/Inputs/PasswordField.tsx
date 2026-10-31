import React, { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";

interface PasswordInputProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  inputClass?: string;
  required?: boolean;
  message?: string;
}

const PasswordInput: React.FC<PasswordInputProps> = ({
  label,
  value,
  onChange,
  inputClass = "",
  required = false,
  message,
}) => {
  const [isShowPassword, setIsShowPassword] = useState(false);

  return (
    <div>
      {label && (
        <label className="text-sm font-semibold text-[var(--ui-text)]">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="flex items-stretch w-full appearance-none outline-0 text-[var(--ui-text)] bg-[var(--ui-surface)] disabled:opacity-50 transition-all duration-300 ease-in-out border border-[var(--ui-border)] hover:border-[var(--primary-color)] focus-within:border-[var(--primary-color)] px-2 py-2 text-lg rounded-lg">
        {/* Input Field */}
        <input
          required={required}
          type={isShowPassword ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full bg-transparent h-full outline-none text-[var(--ui-text)] ${inputClass}`}
        />

        {/* Show/Hide Password Icon */}
        <button
          type="button"
          onClick={() => setIsShowPassword(!isShowPassword)}
          className="flex items-center justify-center px-2 text-[var(--ui-text-muted)] hover:text-[var(--primary-color)] cursor-pointer"
        >
          {isShowPassword ? <FiEyeOff /> : <FiEye />}
        </button>
      </div>

      {/* Error Message */}
      {message && <p className="text-xs text-red-500 mt-1">{message}</p>}
    </div>
  );
};

export default PasswordInput;
