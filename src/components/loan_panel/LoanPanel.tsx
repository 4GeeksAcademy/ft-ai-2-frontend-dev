import Link from "next/link";
import { formatLoanDate, type ActiveLoan } from "@/db";
import "./LoanPanel.css";

interface LoanPanelProps {
  title: string;
  loans: ActiveLoan[];
  emptyMessage: string;
  variant?: "default" | "overdue";
}

/**
 * Reusable panel for showing a list of active loans on the dashboard.
 */
export default function LoanPanel({
  title,
  loans,
  emptyMessage,
  variant = "default",
}: LoanPanelProps) {
  return (
    <section
      className={`loan-panel${variant === "overdue" ? " loan-panel--overdue" : ""}`}
    >
      <h2 className="loan-panel__title">{title}</h2>

      {loans.length === 0 ? (
        <p className="loan-panel__empty">{emptyMessage}</p>
      ) : (
        <ul className="loan-panel__list">
          {loans.map((loan) => (
            <li key={loan.id} className="loan-panel__item">
              <Link
                href={`/library/${loan.book_id}`}
                className="loan-panel__book loan-panel__link"
              >
                {loan.book_title}
              </Link>
              <p className="loan-panel__meta">
                Loaned to{" "}
                <Link
                  href={`/friends/${loan.borrower.id}`}
                  className="loan-panel__link"
                >
                  {loan.borrower.name}
                </Link>{" "}
                on {formatLoanDate(loan.borrow_date)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
