import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import LoanForm from "@/components/loan_form/LoanForm";
import LoanHistory from "@/components/loan_history/LoanHistory";
import ReturnButton from "@/components/return_button/ReturnButton";
import {
  formatLoanDate,
  getActiveLoanForBook,
  getAllFriends,
  getBookById,
  getLoansForBook,
} from "@/db";
import { createLoanAction, returnLoanAction } from "./actions";

interface BookPageProps {
  params: Promise<{ id: string }>;
}

export default async function BookPage({ params }: BookPageProps) {
  const { id } = await params;
  const bookId = Number(id);
  const [book, friends, loanHistory, activeLoan] = await Promise.all([
    getBookById(bookId),
    getAllFriends(),
    getLoansForBook(bookId),
    getActiveLoanForBook(bookId),
  ]);

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

        <div className="flex flex-1 flex-col gap-4">
          <h1 className="text-3xl font-semibold tracking-tight">{book.title}</h1>
          <p className="text-zinc-600 dark:text-zinc-400">{book.description}</p>

          {activeLoan ? (
            <div className="flex flex-col gap-3">
              <p className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-100">
                Currently on loan to{" "}
                <Link
                  href={`/friends/${activeLoan.borrower.id}`}
                  className="font-medium underline"
                >
                  {activeLoan.borrower.name}
                </Link>{" "}
                since {formatLoanDate(activeLoan.borrow_date)}.
              </p>
              <ReturnButton
                bookId={book.id}
                loanId={activeLoan.id}
                action={returnLoanAction}
              />
            </div>
          ) : (
            <section className="flex flex-col gap-3">
              <h2 className="text-lg font-semibold">Loan this book</h2>
              <LoanForm
                bookId={book.id}
                friends={friends}
                action={createLoanAction}
              />
            </section>
          )}
        </div>
      </div>

      <LoanHistory loans={loanHistory} />
    </div>
  );
}
