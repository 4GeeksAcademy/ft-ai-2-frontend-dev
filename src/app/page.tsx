import LoanPanel from "@/components/loan_panel/LoanPanel";
import { getActiveLoans, getOverdueLoans } from "@/db";

export default async function Home() {
  const [activeLoans, overdueLoans] = await Promise.all([
    getActiveLoans(),
    getOverdueLoans(),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 p-6 md:p-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          See what is currently on loan and which books need a friendly reminder.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <LoanPanel
          title="Current loans"
          loans={activeLoans}
          emptyMessage="No books are out on loan right now."
        />
        <LoanPanel
          title="Overdue (2+ weeks)"
          loans={overdueLoans}
          emptyMessage="Nothing overdue. Everyone returned their books on time."
          variant="overdue"
        />
      </div>
    </div>
  );
}
