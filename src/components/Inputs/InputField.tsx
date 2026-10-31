import React, { ChangeEvent } from "react";

interface InputFieldProps {
  label?: string;
  value?: string;
  name?: string;
  placeholder?: string;
  type?: string;
  inputClass?: string;
  required?: boolean;
  readOnly?: boolean;
  message?: string;
  wrapperClass?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  onChange?: ((value: string) => void) | ((event: ChangeEvent<HTMLInputElement>) => void);
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  value = "",
  name,
  type = "text",
  inputClass = "",
  required = false,
  readOnly = false,
  message,
  wrapperClass = "",
  icon,
  disabled = false,
  placeholder = "",
  onChange,
}) => {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (onChange) {

      if (onChange.length === 1 && typeof (onChange as any).toString() === 'function') {
        (onChange as (value: string) => void)(e.target.value);
      } else {
        (onChange as (event: ChangeEvent<HTMLInputElement>) => void)(e);
      }
    }
  };

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={name} className="text-sm font-medium text-[var(--ui-text)] block mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div
        className={`flex items-center w-full transition-all duration-300 border rounded-lg px-2 h-[34px]
          ${message ? "border-red-500" : "border-[var(--ui-border)] focus-within:border-[var(--primary-color)]"}
          bg-[var(--ui-surface)] text-[var(--ui-text)] text-base 
          ${wrapperClass}`}
      >
        {icon && <div className="pr-2 text-[var(--ui-text-muted)]">{icon}</div>}

        <input
          id={name}
          name={name}
          type={type}
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          readOnly={readOnly}
          onChange={handleChange}
          className={`w-full bg-transparent text-[var(--ui-text)] focus:outline-none placeholder:text-[var(--ui-text-muted)] placeholder:text-sm px-1.5 text-base
            ${inputClass}
            ${disabled ? "cursor-not-allowed opacity-50" : "cursor-text"}
          `}
        />
      </div>

      {message && <p className="text-xs text-red-500 mt-1">{message}</p>}
    </div>
  );
};

export default InputField;
