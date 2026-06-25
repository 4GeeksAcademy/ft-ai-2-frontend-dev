/**
 * Raw row shapes returned directly from SQLite queries.
 *
 * These are internal to the database layer. Public-facing pages and components
 * should use the global `Friend`, `Book`, and `Loan` types from `types.d.ts`.
 */

export interface FriendRow {
  id: number;
  name: string;
  phone_number: string;
  email: string;
}

export interface BookRow {
  id: number;
  title: string;
  description: string;
  cover_img: string;
}

export interface LoanRow {
  id: number;
  book_id: number;
  friend_id: number;
  borrow_date: string;
  returned_date: string | null;
}
