import Link from "next/link";
import { getAllFriends } from "@/db";

export default async function FriendsPage() {
  const friends = await getAllFriends();

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 p-6 md:p-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight">Friends</h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            People you loan books to. Sorting and filtering will be added next.
          </p>
        </div>

        <Link
          href="/friends/create_friend"
          className="inline-flex items-center justify-center rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:opacity-90"
        >
          Add friend
        </Link>
      </header>

      {friends.length === 0 ? (
        <p className="text-zinc-600 dark:text-zinc-400">
          No friends yet. Add someone you might loan a book to.
        </p>
      ) : (
        <ul className="divide-y divide-zinc-200 rounded-xl border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
          {friends.map((friend) => (
            <li key={friend.id}>
              <Link
                href={`/friends/${friend.id}`}
                className="flex flex-col gap-1 px-4 py-4 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-950"
              >
                <span className="font-medium">{friend.name}</span>
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  {friend.email}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
