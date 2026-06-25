import type { Client } from "@libsql/client";

/**
 * SQL statements that create the Book App tables.
 *
 * We keep friends, books, and loans in separate tables and link loans to the
 * other two with foreign keys. Dates are stored as ISO strings because SQLite
 * does not have a dedicated date type.
 */
const CREATE_TABLES_SQL = `
CREATE TABLE IF NOT EXISTS friends (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  email TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS books (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  cover_img TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS loans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  book_id INTEGER NOT NULL,
  friend_id INTEGER NOT NULL,
  borrow_date TEXT NOT NULL,
  returned_date TEXT,
  FOREIGN KEY (book_id) REFERENCES books(id),
  FOREIGN KEY (friend_id) REFERENCES friends(id)
);
`;

/**
 * Creates the database tables when they do not already exist.
 */
export async function initializeSchema(db: Client): Promise<void> {
  await db.executeMultiple(CREATE_TABLES_SQL);
}
