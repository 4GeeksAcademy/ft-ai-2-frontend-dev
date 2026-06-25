"use client";

import { useActionState } from "react";
import FormField, { type FormState } from "@/components/form/FormField";

interface FriendFormProps {
  /** Server action that saves the friend and redirects on success. */
  action: (state: FormState, formData: FormData) => Promise<FormState>;
}

const INITIAL_STATE: FormState = {};

/**
 * Form for adding a new friend.
 */
export default function FriendForm({ action }: FriendFormProps) {
  const [state, formAction, pending] = useActionState(action, INITIAL_STATE);

  return (
    <form action={formAction} className="form">
      {state.error ? (
        <p className="form__error" role="alert">
          {state.error}
        </p>
      ) : null}

      <FormField label="Name" name="name" required placeholder="e.g. Alex Rivera" />

      <FormField
        label="Email"
        name="email"
        type="email"
        placeholder="alex@example.com"
      />

      <FormField
        label="Phone number"
        name="phone_number"
        type="tel"
        placeholder="(555) 123-4567"
        hint="We'll strip out spaces and symbols so it works in tel: links."
      />

      <div className="form__actions">
        <button type="submit" className="form__submit" disabled={pending}>
          {pending ? "Saving..." : "Save friend"}
        </button>
      </div>
    </form>
  );
}
