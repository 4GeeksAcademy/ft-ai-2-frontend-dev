import { ensureDbInitialized } from "@/db/init";
import { getDb } from "@/db/client";
import { mapFriendRow, mapLoanRow } from "@/db/mappers";
import type { LoanRow } from "@/db/rows";

const TWO_WEEKS_IN_MS = 14 * 24 * 60 * 60 * 1000;

function rowToLoan(row: Record<string, unknown>): LoanRow {
  return {
    id: Number(row.id),
    book_id: Number(row.book_id),
    friend_id: Number(row.friend_id),
    borrow_date: String(row.borrow_date),
    returned_date: row.returned_date ? String(row.returned_date) : null,
  };
}

interface LoanWithDetailsRow extends LoanRow {
  friend_name: string;
  friend_phone_number: string;
  friend_email: string;
  book_title: string;
}

function rowToLoanWithDetails(row: Record<string, unknown>): LoanWithDetailsRow {
  const loan = rowToLoan(row);

  return {
    ...loan,
    friend_name: String(row.friend_name),
    friend_phone_number: String(row.friend_phone_number),
    friend_email: String(row.friend_email),
    book_title: String(row.book_title),
  };
}

export interface ActiveLoan extends Loan {
  book_title: string;
}

function mapActiveLoan(row: LoanWithDetailsRow): ActiveLoan {
  const borrower = mapFriendRow({
    id: row.friend_id,
    name: row.friend_name,
    phone_number: row.friend_phone_number,
    email: row.friend_email,
  });

  return {
    ...mapLoanRow(row, borrower),
    book_title: row.book_title,
  };
}

const ACTIVE_LOANS_SQL = `
  SELECT
    loans.id,
    loans.book_id,
    loans.friend_id,
    loans.borrow_date,
    loans.returned_date,
    friends.name AS friend_name,
    friends.phone_number AS friend_phone_number,
    friends.email AS friend_email,
    books.title AS book_title
  FROM loans
  INNER JOIN friends ON friends.id = loans.friend_id
  INNER JOIN books ON books.id = loans.book_id
  WHERE loans.returned_date IS NULL
  ORDER BY loans.borrow_date ASC
`;

/** Loans that are still out with the borrower and book title attached. */
export async function getActiveLoans(): Promise<ActiveLoan[]> {
  await ensureDbInitialized();

  const result = await getDb().execute(ACTIVE_LOANS_SQL);
  return result.rows.map((row) => mapActiveLoan(rowToLoanWithDetails(row)));
}

/** Active loans that have been out for longer than two weeks. */
export async function getOverdueLoans(): Promise<ActiveLoan[]> {
  const activeLoans = await getActiveLoans();
  const cutoff = Date.now() - TWO_WEEKS_IN_MS;

  return activeLoans.filter((loan) => loan.borrow_date.getTime() < cutoff);
}

/** Check whether a loan is overdue (still out and older than two weeks). */
export function isLoanOverdue(loan: Loan): boolean {
  if (loan.returned_date) {
    return false;
  }

  return loan.borrow_date.getTime() < Date.now() - TWO_WEEKS_IN_MS;
}

/** Format a loan date for display in the UI. */
export function formatLoanDate(date: Date): string {
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
