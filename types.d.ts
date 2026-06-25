/**
 * Shared data types for the Book App.
 *
 * These mirror the records we keep in the libSQL database and are used
 * throughout the app (pages, components, and data-access helpers).
 *
 * Declared as global types so they can be referenced anywhere without an
 * explicit import.
 */

/** A person you might loan a book to. */
interface Friend {
  id: number;
  name: string;
  /**
   * Phone number with all non-essential characters stripped out, so it is
   * easy to format for `tel:` links (e.g. "15551234567").
   */
  phone_number: string;
  email: string;
  /** The loans currently/previously associated with this friend. */
  books_borrowed: Loan[];
}

/** A book in your personal library. */
interface Book {
  id: number;
  title: string;
  description: string;
  /** URL or path to the cover image. */
  cover_img: string;
  /** Every time this book has been loaned out. */
  loan_history: Loan[];
}

/** A single instance of a book being loaned to a friend. */
interface Loan {
  id: number;
  borrower: Friend;
  borrow_date: Date;
  /** `null` while the book is still out on loan. */
  returned_date: Date | null;
}
