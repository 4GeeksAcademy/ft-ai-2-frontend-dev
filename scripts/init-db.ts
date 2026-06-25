import { getDb } from "../src/db/client";
import { ensureDbInitialized } from "../src/db/init";

/**
 * Standalone script students can run to create the database file and seed data.
 *
 * Usage: npm run db:init
 */
async function main() {
  await ensureDbInitialized();
  const result = await getDb().execute(
    "SELECT (SELECT COUNT(*) FROM friends) AS friends, (SELECT COUNT(*) FROM books) AS books, (SELECT COUNT(*) FROM loans) AS loans",
  );

  const row = result.rows[0];
  console.log("Database ready.");
  console.log(`Friends: ${row?.friends ?? 0}`);
  console.log(`Books: ${row?.books ?? 0}`);
  console.log(`Loans: ${row?.loans ?? 0}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
