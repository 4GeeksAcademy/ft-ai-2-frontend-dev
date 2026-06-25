import Link from "next/link";
import { formatLoanDate, isLoanOverdue } from "@/db";
import "./LoanHistory.css";

interface LoanHistoryProps {
  loans: Loan[];
}

function loanStatus(loan: Loan): { label: string; className: string } {
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
 * Shows every time a book has been loaned out, with borrower and dates.
 */
export default function LoanHistory({ loans }: LoanHistoryProps) {
  return (
    <section className="loan-history">
      <h2 className="loan-history__title">Borrowing history</h2>

      {loans.length === 0 ? (
        <p className="loan-history__empty">
          This book has never been loaned out.
        </p>
      ) : (
        <ul className="loan-history__list">
          {loans.map((loan) => {
            const status = loanStatus(loan);

            return (
              <li key={loan.id} className="loan-history__item">
                <Link
                  href={`/friends/${loan.borrower.id}`}
                  className="loan-history__borrower hover:underline"
                >
                  {loan.borrower.name}
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
