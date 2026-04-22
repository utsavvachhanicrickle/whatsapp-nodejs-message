import React, { useState } from "react";
import { buttonInputTypes } from "../../utils/schema";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

function InputField({
  type = buttonInputTypes.TEXT,
  className = "",
  name,
  placeholder,
  value,
  onChange,
  required = false,
  options = [],
  onKeyDown = () => {},
}) {
  const [showPassword, setShowPassword] = useState(false);

  const inptType =
    type === buttonInputTypes.PASSWORD
      ? showPassword
        ? buttonInputTypes.TEXT
        : buttonInputTypes.PASSWORD
      : type;

  const formatDatetimeLocal = (isoString) => {
    if (!isoString) return "";
    const dt = new Date(isoString);
    const offset = dt.getTimezoneOffset();
    const local = new Date(dt.getTime() - offset * 60 * 1000);
    return local.toISOString().slice(0, 16);
  };

  const baseInputStyle =
    "w-full p-2.5 rounded-lg outline-none transition-all duration-200 " +
    "bg-[var(--bg-primary)] text-[var(--text-primary)] " +
    "border border-[var(--border)] focus:border-[var(--primary)] " +
    "focus:ring-2 focus:ring-[var(--primary)]/30";

  const baseWrapper = "w-full mb-3";

  const labelStyle = "text-sm text-[var(--text-secondary)] mb-1 block";

  if (type === buttonInputTypes.SELECT) {
    return (
      <div className={baseWrapper}>
        <select
          name={name}
          value={value}
          onChange={(e) => onChange(name, e.target.value, type)}
          required={required}
          className={`${baseInputStyle} ${className}`}
        >
          <option value="" className="bg-(--bg-primary)">
            {placeholder}
          </option>

          {options.map((opt, index) => (
            <option
              key={index}
              value={opt.value}
              className="bg-(--bg-primary) text-(--text-primary)"
            >
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  if (type === buttonInputTypes.RADIO_GROUP) {
    return (
      <div className={baseWrapper}>
        <p className={labelStyle}>{placeholder}</p>

        <div className="flex flex-col gap-2">
          {options.map((opt) => (
            <label
              key={opt.value}
              className="flex items-center gap-2 text-(--text-primary) text-sm cursor-pointer"
            >
              <input
                type="radio"
                name={name}
                value={opt.value}
                checked={value === opt.value}
                onChange={(e) => onChange(name, e.target.value, type)}
                required={required}
                className="accent-(--primary)"
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`${baseWrapper} relative`}>
      <input
        type={inptType}
        className={`${baseInputStyle} pr-10 ${className}`}
        name={name}
        value={
          type === buttonInputTypes.DATETIME_LOCAL
            ? formatDatetimeLocal(value)
            : value
        }
        onChange={(e) => onChange(name, e.target.value, type)}
        required={required}
        placeholder={placeholder}
        onKeyDown={onKeyDown}
      />

      {type === buttonInputTypes.PASSWORD && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-(--text-muted) hover:text-(--text-primary) transition"
        >
          {showPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
        </button>
      )}
    </div>
  );
}

export default InputField;
