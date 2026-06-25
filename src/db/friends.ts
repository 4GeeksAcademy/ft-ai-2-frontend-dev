import { ensureDbInitialized } from "@/db/init";
import { getDb } from "@/db/client";
import { mapFriendRow } from "@/db/mappers";
import type { FriendRow } from "@/db/rows";

function rowToFriend(row: Record<string, unknown>): FriendRow {
  return {
    id: Number(row.id),
    name: String(row.name),
    phone_number: String(row.phone_number),
    email: String(row.email),
  };
}

/** Fetch every friend, without their loan history attached yet. */
export async function getAllFriends(): Promise<Friend[]> {
  await ensureDbInitialized();

  const result = await getDb().execute(
    "SELECT id, name, phone_number, email FROM friends ORDER BY name COLLATE NOCASE",
  );

  return result.rows.map((row) => mapFriendRow(rowToFriend(row)));
}

/** Fetch a single friend by id. Returns `null` when the id does not exist. */
export async function getFriendById(id: number): Promise<Friend | null> {
  await ensureDbInitialized();

  const result = await getDb().execute({
    sql: "SELECT id, name, phone_number, email FROM friends WHERE id = ?",
    args: [id],
  });

  const row = result.rows[0];
  if (!row) {
    return null;
  }

  return mapFriendRow(rowToFriend(row));
}

/** The fields needed to add a new friend. */
export interface NewFriend {
  name: string;
  phone_number: string;
  email: string;
}

/** Insert a new friend and return their generated id. */
export async function createFriend(friend: NewFriend): Promise<number> {
  await ensureDbInitialized();

  const result = await getDb().execute({
    sql: "INSERT INTO friends (name, phone_number, email) VALUES (?, ?, ?)",
    args: [friend.name, friend.phone_number, friend.email],
  });

  return Number(result.lastInsertRowid);
}
