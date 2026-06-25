import "./Form.css";

interface FormSelectOption {
  value: string;
  label: string;
}

interface FormSelectProps {
  label: string;
  name: string;
  options: FormSelectOption[];
  required?: boolean;
  placeholder?: string;
  defaultValue?: string;
}

/**
 * A labelled `<select>` dropdown used by forms such as the loan form.
 */
export default function FormSelect({
  label,
  name,
  options,
  required = false,
  placeholder = "Select an option",
  defaultValue,
}: FormSelectProps) {
  const id = `field-${name}`;

  return (
    <div className="form__field">
      <label className="form__label" htmlFor={id}>
        {label}
        {required ? <span className="form__required"> *</span> : null}
      </label>

      <select
        id={id}
        name={name}
        required={required}
        defaultValue={defaultValue ?? ""}
        className="form__select"
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
