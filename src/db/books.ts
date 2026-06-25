import { ensureDbInitialized } from "@/db/init";
import { getDb } from "@/db/client";
import { mapBookRow } from "@/db/mappers";
import type { BookRow } from "@/db/rows";

function rowToBook(row: Record<string, unknown>): BookRow {
  return {
    id: Number(row.id),
    title: String(row.title),
    description: String(row.description),
    cover_img: String(row.cover_img),
  };
}

/** Fetch every book in the library. */
export async function getAllBooks(): Promise<Book[]> {
  await ensureDbInitialized();

  const result = await getDb().execute(
    "SELECT id, title, description, cover_img FROM books ORDER BY title COLLATE NOCASE",
  );

  return result.rows.map((row) => mapBookRow(rowToBook(row)));
}

/** Fetch a single book by id. Returns `null` when the id does not exist. */
export async function getBookById(id: number): Promise<Book | null> {
  await ensureDbInitialized();

  const result = await getDb().execute({
    sql: "SELECT id, title, description, cover_img FROM books WHERE id = ?",
    args: [id],
  });

  const row = result.rows[0];
  if (!row) {
    return null;
  }

  return mapBookRow(rowToBook(row));
}

/** The fields needed to add a new book. */
export interface NewBook {
  title: string;
  description: string;
  cover_img: string;
}

/** Insert a new book and return its generated id. */
export async function createBook(book: NewBook): Promise<number> {
  await ensureDbInitialized();

  const result = await getDb().execute({
    sql: "INSERT INTO books (title, description, cover_img) VALUES (?, ?, ?)",
    args: [book.title, book.description, book.cover_img],
  });

  return Number(result.lastInsertRowid);
}
