import Link from "next/link";

export default function CreateBookPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 p-6 md:p-8">
      <Link
        href="/library"
        className="text-sm text-zinc-600 transition-colors hover:text-foreground dark:text-zinc-400"
      >
        Back to library
      </Link>

      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Add a book</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          The create-book form will save new titles to the libSQL database.
        </p>
      </header>
    </div>
  );
}
