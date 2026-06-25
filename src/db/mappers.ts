import type { BookRow, FriendRow, LoanRow } from "@/db/rows";

/** Convert an ISO date string from SQLite into a JavaScript `Date`. */
export function parseDate(value: string): Date {
  return new Date(value);
}

/** Store a `Date` in SQLite as an ISO string. */
export function formatDate(value: Date): string {
  return value.toISOString();
}

export function mapFriendRow(row: FriendRow, books_borrowed: Loan[] = []): Friend {
  return {
    id: row.id,
    name: row.name,
    phone_number: row.phone_number,
    email: row.email,
    books_borrowed,
  };
}

export function mapBookRow(row: BookRow, loan_history: Loan[] = []): Book {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    cover_img: row.cover_img,
    loan_history,
  };
}

export function mapLoanRow(row: LoanRow, borrower: Friend): Loan {
  return {
    id: row.id,
    borrower,
    borrow_date: parseDate(row.borrow_date),
    returned_date: row.returned_date ? parseDate(row.returned_date) : null,
  };
}
