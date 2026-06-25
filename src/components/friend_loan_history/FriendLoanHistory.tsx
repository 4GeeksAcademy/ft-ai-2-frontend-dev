import Link from "next/link";
import { formatLoanDate, isLoanOverdue, type FriendLoan } from "@/db";
import "@/components/loan_history/LoanHistory.css";

interface FriendLoanHistoryProps {
  loans: FriendLoan[];
}

function loanStatus(loan: FriendLoan): { label: string; className: string } {
  if (loan.returned_date) {
    return {
      label: `Returned ${formatLoanDate(loan.returned_date)}`,
      className: "loan-history__status loan-history__status--returned",
    };
  }

  if (isLoanOverdue(loan)) {
    return {
      label: "Overdue",
      className: "loan-history__status loan-history__status--overdue",
    };
  }

  return {
    label: "On loan",
    className: "loan-history__status loan-history__status--active",
  };
}

/**
 * Shows every book a friend has borrowed, with dates and current status.
 */
export default function FriendLoanHistory({ loans }: FriendLoanHistoryProps) {
  return (
    <section className="loan-history">
      <h2 className="loan-history__title">Borrowing history</h2>

      {loans.length === 0 ? (
        <p className="loan-history__empty">
          This friend hasn&apos;t borrowed any books yet.
        </p>
      ) : (
        <ul className="loan-history__list">
          {loans.map((loan) => {
            const status = loanStatus(loan);

            return (
              <li key={loan.id} className="loan-history__item">
                <Link
                  href={`/library/${loan.book_id}`}
                  className="loan-history__borrower hover:underline"
                >
                  {loan.book_title}
                </Link>
                <p className="loan-history__meta">
                  Borrowed {formatLoanDate(loan.borrow_date)}
                </p>
                <span className={status.className}>{status.label}</span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
