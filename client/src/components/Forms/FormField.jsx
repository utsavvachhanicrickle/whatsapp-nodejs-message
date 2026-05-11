import { useState } from "react";
import InputField from "./InputField";
import Button from "../Button";
import { buttonInputTypes } from "../../utils/schema";

function FormField({ header = "", fields, onSubmit, buttons, footer = {} }) {
  const initialData = Object.fromEntries(
    fields.map((field) => [
      field.name,
      field.type === buttonInputTypes.CHECKBOX_GROUP
        ? field.value || []
        : field.value || "",
    ]),
  );

  const [formData, setFormData] = useState(initialData);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleReset = () => {
    setFormData(initialData);
  };

  const handleChange = (name, value, type = buttonInputTypes.TEXT) => {
    setFormData((prev) => {
      if (type === buttonInputTypes.CHECKBOX_GROUP) {
        const current = prev[name] || [];

        return {
          ...prev,
          [name]: current.includes(value)
            ? current.filter((v) => v !== value)
            : [...current, value],
        };
      }

      if (type === buttonInputTypes.DATETIME_LOCAL) {
        return {
          ...prev,
          [name]: new Date(value).toISOString(),
        };
      }

      return {
        ...prev,
        [name]: value,
      };
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className=" rounded-2xl border p-6 shadow-xl
        bg-(--bg-primary)
        border-(--border)
        text-(--text-primary)
      "
    >
      {/* HEADER */}
      {header && (
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-center">{header}</h2>

          <div className="w-14 h-1 mx-auto mt-2 rounded-full bg-(--primary)" />
        </div>
      )}

      {/* INPUT FIELDS */}
      <div className="flex flex-col gap-4">
        {fields.map((field) => (
          <InputField
            key={field.name}
            type={field.type || buttonInputTypes.TEXT}
            name={field.name}
            value={formData[field.name]}
            onChange={handleChange}
            placeholder={field.placeholder}
            required={field.required || false}
            options={field.options}
          />
        ))}
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex gap-3 mt-6">
        {buttons.map((button, index) => (
          <Button
            key={index}
            type={button.type}
            variant={button.variant}
            className={`
              w-full
              transition-all
              duration-200
              ${button.className || ""}
            `}
            onClick={() => {
              if (button.type === buttonInputTypes.SUBMIT) return;

              if (button.type === buttonInputTypes.RESET) {
                return button.onChange?.(handleReset, formData);
              }

              button.onClick?.();
            }}
          >
            {button.label}
          </Button>
        ))}
      </div>

      {/* FOOTER */}
      {footer?.message && (
        <p
          className="
            mt-5
            text-center
            text-sm
            text-(--text-secondary)
          "
        >
          {footer.message}{" "}
          <span
            className="
              cursor-pointer
              text-(--primary)
              hover:underline
            "
            onClick={footer.onClick}
          >
            {footer.spanText}
          </span>
        </p>
      )}
    </form>
  );
}

export default FormField;
