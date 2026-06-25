import type { ReactNode } from "react";
import "./Form.css";

/**
 * Shape returned by every form server action.
 *
 * `error` holds a message to show the user when validation fails. On success
 * the action redirects, so the form never reads a "success" state.
 */
export interface FormState {
  error?: string;
}

interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  defaultValue?: string;
  /** Render a multi-line `<textarea>` instead of a single-line `<input>`. */
  multiline?: boolean;
  hint?: ReactNode;
}

/**
 * A labelled form input used by the create-book and create-friend forms.
 */
export default function FormField({
  label,
  name,
  type = "text",
  required = false,
  placeholder,
  defaultValue,
  multiline = false,
  hint,
}: FormFieldProps) {
  const id = `field-${name}`;

  return (
    <div className="form__field">
      <label className="form__label" htmlFor={id}>
        {label}
        {required ? <span className="form__required"> *</span> : null}
      </label>

      {multiline ? (
        <textarea
          id={id}
          name={name}
          required={required}
          placeholder={placeholder}
          defaultValue={defaultValue}
          className="form__textarea"
        />
      ) : (
        <input
          id={id}
          name={name}
          type={type}
          required={required}
          placeholder={placeholder}
          defaultValue={defaultValue}
          className="form__input"
        />
      )}

      {hint ? <p className="form__hint">{hint}</p> : null}
    </div>
  );
}
