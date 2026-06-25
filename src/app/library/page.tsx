import Image from "next/image";
import Link from "next/link";
import { getAllBooks } from "@/db";

export default async function LibraryPage() {
  const books = await getAllBooks();

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 p-6 md:p-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight">Library</h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Browse the books you own. Sorting and filtering will be added next.
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
        <ul className="grid gap-4 sm:grid-cols-2">
          {books.map((book) => (
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
