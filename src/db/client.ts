import { createClient, type Client } from "@libsql/client";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

/**
 * Default location for the local SQLite file used during development.
 * Override with DATABASE_URL in `.env` when you need a different path.
 */
const DEFAULT_DATABASE_URL = "file:data/book-app.db";

let client: Client | null = null;

/**
 * Returns a shared libSQL client. We create it once and reuse it so every
 * server request talks to the same database connection.
 */
export function getDb(): Client {
  if (client) {
    return client;
  }

  const url = process.env.DATABASE_URL ?? DEFAULT_DATABASE_URL;

  // Ensure the parent folder exists before libSQL opens the file.
  if (url.startsWith("file:")) {
    const filePath = url.slice("file:".length);
    mkdirSync(dirname(filePath), { recursive: true });
  }

  client = createClient({ url });
  return client;
}
