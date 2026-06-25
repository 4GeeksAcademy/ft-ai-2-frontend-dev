"use client";

import { useActionState } from "react";
import type { FormState } from "@/components/form/FormField";
import "@/components/form/Form.css";

interface ReturnButtonProps {
  bookId: number;
  loanId: number;
  /** Server action that marks the loan as returned. */
  action: (state: FormState, formData: FormData) => Promise<FormState>;
}

const INITIAL_STATE: FormState = {};

/**
 * Button that marks the book's active loan as returned.
 */
export default function ReturnButton({
  bookId,
  loanId,
  action,
}: ReturnButtonProps) {
  const [state, formAction, pending] = useActionState(action, INITIAL_STATE);

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="book_id" value={bookId} />
      <input type="hidden" name="loan_id" value={loanId} />

      {state.error ? (
        <p className="form__error" role="alert">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        className="inline-flex w-fit items-center justify-center rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium transition-colors hover:bg-zinc-100 disabled:opacity-60 dark:border-zinc-700 dark:hover:bg-zinc-900"
        disabled={pending}
      >
        {pending ? "Marking returned..." : "Mark as returned"}
      </button>
    </form>
  );
}
