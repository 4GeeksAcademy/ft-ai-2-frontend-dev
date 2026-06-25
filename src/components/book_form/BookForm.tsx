"use client";

import { useActionState } from "react";
import FormField, { type FormState } from "@/components/form/FormField";

interface BookFormProps {
  /** Server action that saves the book and redirects on success. */
  action: (state: FormState, formData: FormData) => Promise<FormState>;
}

const INITIAL_STATE: FormState = {};

/**
 * Form for adding a new book to the library.
 */
export default function BookForm({ action }: BookFormProps) {
  const [state, formAction, pending] = useActionState(action, INITIAL_STATE);

  return (
    <form action={formAction} className="form">
      {state.error ? (
        <p className="form__error" role="alert">
          {state.error}
        </p>
      ) : null}

      <FormField label="Title" name="title" required placeholder="e.g. Clean Code" />

      <FormField
        label="Description"
        name="description"
        multiline
        placeholder="A short summary of the book."
      />

      <FormField
        label="Cover image URL"
        name="cover_img"
        type="url"
        placeholder="https://..."
        hint="Optional. We'll generate a placeholder cover if you leave this blank."
      />

      <div className="form__actions">
        <button type="submit" className="form__submit" disabled={pending}>
          {pending ? "Saving..." : "Save book"}
        </button>
      </div>
    </form>
  );
}
