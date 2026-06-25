"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import "@/components/list_controls/ListControls.css";

interface FriendsListProps {
  friends: Friend[];
}

type SortOption = "name-asc" | "name-desc";

/**
 * Client-side searchable and sortable list of friends.
 */
export default function FriendsList({ friends }: FriendsListProps) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortOption>("name-asc");

  const visibleFriends = useMemo(() => {
    const search = query.trim().toLowerCase();

    const filtered = friends.filter((friend) => {
      if (!search) {
        return true;
      }

      return (
        friend.name.toLowerCase().includes(search) ||
        friend.email.toLowerCase().includes(search)
      );
    });

    const sorted = [...filtered].sort((a, b) => {
      const comparison = a.name.localeCompare(b.name);
      return sort === "name-asc" ? comparison : -comparison;
    });

    return sorted;
  }, [friends, query, sort]);

  return (
    <div className="flex flex-col gap-4">
      <div className="list-controls">
        <div className="list-controls__field list-controls__field--grow">
          <label className="list-controls__label" htmlFor="friends-search">
            Search
          </label>
          <input
            id="friends-search"
            type="search"
            className="list-controls__input"
            placeholder="Search by name or email"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>

        <div className="list-controls__field">
          <label className="list-controls__label" htmlFor="friends-sort">
            Sort
          </label>
          <select
            id="friends-sort"
            className="list-controls__select"
            value={sort}
            onChange={(event) => setSort(event.target.value as SortOption)}
          >
            <option value="name-asc">Name (A–Z)</option>
            <option value="name-desc">Name (Z–A)</option>
          </select>
        </div>
      </div>

      <p className="list-controls__count">
        {visibleFriends.length} of {friends.length} friend
        {friends.length === 1 ? "" : "s"}
      </p>

      {visibleFriends.length === 0 ? (
        <p className="text-zinc-600 dark:text-zinc-400">
          No friends match your search.
        </p>
      ) : (
        <ul className="divide-y divide-zinc-200 rounded-xl border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
          {visibleFriends.map((friend) => (
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
