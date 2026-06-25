"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import "@/components/list_controls/ListControls.css";

interface LibraryListProps {
  books: Book[];
}

type SortOption = "title-asc" | "title-desc";

/**
 * Client-side searchable and sortable list of books.
 *
 * The full list is rendered on the server and passed in; filtering and sorting
 * happen in the browser so they feel instant.
 */
export default function LibraryList({ books }: LibraryListProps) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortOption>("title-asc");

  const visibleBooks = useMemo(() => {
    const search = query.trim().toLowerCase();

    const filtered = books.filter((book) => {
      if (!search) {
        return true;
      }

      return (
        book.title.toLowerCase().includes(search) ||
        book.description.toLowerCase().includes(search)
      );
    });

    const sorted = [...filtered].sort((a, b) => {
      const comparison = a.title.localeCompare(b.title);
      return sort === "title-asc" ? comparison : -comparison;
    });

    return sorted;
  }, [books, query, sort]);

  return (
    <div className="flex flex-col gap-4">
      <div className="list-controls">
        <div className="list-controls__field list-controls__field--grow">
          <label className="list-controls__label" htmlFor="library-search">
            Search
          </label>
          <input
            id="library-search"
            type="search"
            className="list-controls__input"
            placeholder="Search by title or description"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>

        <div className="list-controls__field">
          <label className="list-controls__label" htmlFor="library-sort">
            Sort
          </label>
          <select
            id="library-sort"
            className="list-controls__select"
            value={sort}
            onChange={(event) => setSort(event.target.value as SortOption)}
          >
            <option value="title-asc">Title (A–Z)</option>
            <option value="title-desc">Title (Z–A)</option>
          </select>
        </div>
      </div>

      <p className="list-controls__count">
        {visibleBooks.length} of {books.length} book
        {books.length === 1 ? "" : "s"}
      </p>

      {visibleBooks.length === 0 ? (
        <p className="text-zinc-600 dark:text-zinc-400">
          No books match your search.
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {visibleBooks.map((book) => (
            <li key={book.id}>
              <Link
                href={`/library/${book.id}`}
                className="flex gap-4 rounded-xl border border-zinc-200 p-4 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-950"
              >
                <Image
                  src={book.cover_img}
                  alt={`Cover of ${book.title}`}
                  width={80}
                  height={112}
                  className="h-28 w-20 rounded object-cover"
                />
                <div className="flex flex-col gap-1">
                  <h2 className="font-medium">{book.title}</h2>
                  <p className="line-clamp-3 text-sm text-zinc-600 dark:text-zinc-400">
                    {book.description}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
