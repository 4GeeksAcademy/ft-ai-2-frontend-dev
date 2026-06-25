"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createLoan, getActiveLoanForBook, returnLoan } from "@/db";
import type { FormState } from "@/components/form/FormField";

/**
 * Server action that loans a book to the selected friend.
 *
 * On success it refreshes the book page and dashboard, then redirects back to
 * the book detail page so the updated history is visible.
 */
export async function createLoanAction(
  _previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  const bookId = Number(formData.get("book_id"));
  const friendId = Number(formData.get("friend_id"));

  if (!bookId || !friendId) {
    return { error: "Please choose a friend to loan this book to." };
  }

  const activeLoan = await getActiveLoanForBook(bookId);
  if (activeLoan) {
    return {
      error: `${activeLoan.borrower.name} already has this book on loan.`,
    };
  }

  try {
    await createLoan({ book_id: bookId, friend_id: friendId });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not create the loan.";
    return { error: message };
  }

  revalidatePath("/");
  revalidatePath("/library");
  revalidatePath(`/library/${bookId}`);
  redirect(`/library/${bookId}`);
}

/**
 * Server action that marks the active loan for a book as returned.
 *
 * On success it refreshes the book page and dashboard, then redirects back to
 * the book detail page so the loan history reflects the return.
 */
export async function returnLoanAction(
  _previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  const bookId = Number(formData.get("book_id"));
  const loanId = Number(formData.get("loan_id"));

  if (!bookId || !loanId) {
    return { error: "Could not work out which loan to return." };
  }

  const returned = await returnLoan(loanId);
  if (!returned) {
    return { error: "This loan has already been returned." };
  }

  revalidatePath("/");
  revalidatePath("/library");
  revalidatePath(`/library/${bookId}`);
  redirect(`/library/${bookId}`);
}
