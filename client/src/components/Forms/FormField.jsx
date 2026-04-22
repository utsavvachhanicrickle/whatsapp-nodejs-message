import { useState } from "react";
import InputField from "./InputField";
import Button from "../Button";
import { buttonInputTypes } from "../../utils/schema";

function FormField({ header = "", fields, onSubmit, buttons, footer = {} }) {
  const initalData = Object.fromEntries(
    fields.map((field) => [
      field.name,
      field.type === buttonInputTypes.CHECKBOX_GROUP
        ? field.value || []
        : field.value || "",
    ])
  );

  const [formData, setFormData] = useState(initalData);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleReset = () => {
    setFormData(initalData);
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
      } else if (type === buttonInputTypes.DATETIME_LOCAL) {
        return { ...prev, [name]: new Date(value).toISOString() };
      } else {
        return { ...prev, [name]: value };
      }
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="
        bg-(--card)
        shadow-(--shadow)
        text-(--text-primary)
        rounded-2xl
        p-6
        w-[90%]
        max-w-md
        border border-(--border)
      "
    >
      {/* HEADER */}
      <h2 className="text-2xl font-semibold text-center mb-6">
        {header}
      </h2>

      {/* INPUTS */}
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

      {/* BUTTONS */}
      <div className="flex gap-3 mt-6">
        {buttons.map((button, index) => (
          <Button
            key={index}
            type={button.type}
            variant={button.variant}
            className={`w-full ${button.className || ""}`}
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
        <p className="text-sm text-center mt-5 text-(--text-secondary)">
          {footer.message}{" "}
          <span
            className="text-(--primary) cursor-pointer hover:underline"
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