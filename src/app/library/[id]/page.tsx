import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBookById } from "@/db";

interface BookPageProps {
  params: Promise<{ id: string }>;
}

export default async function BookPage({ params }: BookPageProps) {
  const { id } = await params;
  const book = await getBookById(Number(id));

  if (!book) {
    notFound();
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 p-6 md:p-8">
      <Link
        href="/library"
        className="text-sm text-zinc-600 transition-colors hover:text-foreground dark:text-zinc-400"
      >
        Back to library
      </Link>

      <div className="flex flex-col gap-6 md:flex-row">
        <Image
          src={book.cover_img}
          alt={`Cover of ${book.title}`}
          width={192}
          height={288}
          className="h-72 w-48 rounded-lg object-cover"
        />

        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-semibold tracking-tight">{book.title}</h1>
          <p className="text-zinc-600 dark:text-zinc-400">{book.description}</p>
          <p className="text-sm text-zinc-500">
            Loan history and the loan-to-friend form will be added on this page.
          </p>
        </div>
      </div>
    </div>
  );
}
