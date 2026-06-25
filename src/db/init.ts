import { getDb } from "@/db/client";
import { initializeSchema } from "@/db/schema";

let initialized = false;

/**
 * Makes sure the database file, tables, and starter data all exist.
 *
 * We call this at the start of every query helper so pages do not need to
 * worry about setup details.
 */
export async function ensureDbInitialized(): Promise<void> {
  if (initialized) {
    return;
  }

  const db = getDb();
  await initializeSchema(db);
  await seedDatabaseIfEmpty(db);
  initialized = true;
}

async function seedDatabaseIfEmpty(db: ReturnType<typeof getDb>): Promise<void> {
  const result = await db.execute("SELECT COUNT(*) AS count FROM friends");
  const count = Number(result.rows[0]?.count ?? 0);

  if (count > 0) {
    return;
  }

  // Starter records make the demo easier to explore during class.
  await db.batch(
    [
      {
        sql: `INSERT INTO friends (name, phone_number, email) VALUES (?, ?, ?)`,
        args: ["Alex Rivera", "15551234567", "alex@example.com"],
      },
      {
        sql: `INSERT INTO friends (name, phone_number, email) VALUES (?, ?, ?)`,
        args: ["Jordan Lee", "15559876543", "jordan@example.com"],
      },
      {
        sql: `INSERT INTO books (title, description, cover_img) VALUES (?, ?, ?)`,
        args: [
          "The Pragmatic Programmer",
          "A classic guide to becoming a better software developer.",
          "https://placehold.co/200x300/1e293b/f8fafc.png?text=Pragmatic",
        ],
      },
      {
        sql: `INSERT INTO books (title, description, cover_img) VALUES (?, ?, ?)`,
        args: [
          "Clean Code",
          "Principles and patterns for writing readable, maintainable code.",
          "https://placehold.co/200x300/334155/f8fafc.png?text=Clean+Code",
        ],
      },
      {
        sql: `INSERT INTO books (title, description, cover_img) VALUES (?, ?, ?)`,
        args: [
          "Designing Data-Intensive Applications",
          "A deep dive into the architecture of modern data systems.",
          "https://placehold.co/200x300/475569/f8fafc.png?text=DDIA",
        ],
      },
    ],
    "write",
  );

  const threeWeeksAgo = new Date();
  threeWeeksAgo.setDate(threeWeeksAgo.getDate() - 21);

  const lastWeek = new Date();
  lastWeek.setDate(lastWeek.getDate() - 7);

  await db.batch(
    [
      {
        sql: `INSERT INTO loans (book_id, friend_id, borrow_date, returned_date)
              VALUES (?, ?, ?, ?)`,
        args: [1, 1, threeWeeksAgo.toISOString(), null],
      },
      {
        sql: `INSERT INTO loans (book_id, friend_id, borrow_date, returned_date)
              VALUES (?, ?, ?, ?)`,
        args: [2, 2, lastWeek.toISOString(), null],
      },
    ],
    "write",
  );
}
