"use client";

import Link from "next/link";
import { useActionState } from "react";
import FormSelect from "@/components/form/FormSelect";
import type { FormState } from "@/components/form/FormField";
import "@/components/form/Form.css";

interface LoanFormProps {
  bookId: number;
  friends: Friend[];
  /** Server action that records the loan and refreshes the page. */
  action: (state: FormState, formData: FormData) => Promise<FormState>;
}

const INITIAL_STATE: FormState = {};

/**
 * Form for loaning a book to a friend from the book detail page.
 */
export default function LoanForm({ bookId, friends, action }: LoanFormProps) {
  const [state, formAction, pending] = useActionState(action, INITIAL_STATE);

  if (friends.length === 0) {
    return (
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Add a friend before you can loan this book.{" "}
        <Link href="/friends/create_friend" className="font-medium underline">
          Create a friend
        </Link>
      </p>
    );
  }

  return (
    <form action={formAction} className="form">
      <input type="hidden" name="book_id" value={bookId} />

      {state.error ? (
        <p className="form__error" role="alert">
          {state.error}
        </p>
      ) : null}

      <FormSelect
        label="Loan to"
        name="friend_id"
        required
        placeholder="Choose a friend"
        options={friends.map((friend) => ({
          value: String(friend.id),
          label: friend.name,
        }))}
      />

      <div className="form__actions">
        <button type="submit" className="form__submit" disabled={pending}>
          {pending ? "Saving..." : "Loan book"}
        </button>
      </div>
    </form>
  );
}
