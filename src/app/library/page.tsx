import Link from "next/link";
import LibraryList from "@/components/library_list/LibraryList";
import { getAllBooks } from "@/db";

export default async function LibraryPage() {
  const books = await getAllBooks();

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 p-6 md:p-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight">Library</h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Browse, search, and sort the books you own.
          </p>
        </div>

        <Link
          href="/library/create_book"
          className="inline-flex items-center justify-center rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:opacity-90"
        >
          Add book
        </Link>
      </header>

      {books.length === 0 ? (
        <p className="text-zinc-600 dark:text-zinc-400">
          Your library is empty. Add your first book to get started.
        </p>
      ) : (
        <LibraryList books={books} />
      )}
    </div>
  );
}
