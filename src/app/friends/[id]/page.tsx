import Link from "next/link";
import { notFound } from "next/navigation";
import FriendLoanHistory from "@/components/friend_loan_history/FriendLoanHistory";
import { getFriendById, getLoansForFriend } from "@/db";

interface FriendPageProps {
  params: Promise<{ id: string }>;
}

export default async function FriendPage({ params }: FriendPageProps) {
  const { id } = await params;
  const friendId = Number(id);
  const [friend, loans] = await Promise.all([
    getFriendById(friendId),
    getLoansForFriend(friendId),
  ]);

  if (!friend) {
    notFound();
  }

  const currentlyBorrowed = loans.filter((loan) => !loan.returned_date);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 p-6 md:p-8">
      <Link
        href="/friends"
        className="text-sm text-zinc-600 transition-colors hover:text-foreground dark:text-zinc-400"
      >
        Back to friends
      </Link>

      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">{friend.name}</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          {currentlyBorrowed.length === 0
            ? "No books currently borrowed."
            : `Currently has ${currentlyBorrowed.length} book${
                currentlyBorrowed.length === 1 ? "" : "s"
              } on loan.`}
        </p>
      </header>

      <dl className="grid gap-4 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
        <div className="flex flex-col gap-1">
          <dt className="text-sm text-zinc-500">Email</dt>
          <dd>
            <a href={`mailto:${friend.email}`} className="font-medium">
              {friend.email}
            </a>
          </dd>
        </div>
        <div className="flex flex-col gap-1">
          <dt className="text-sm text-zinc-500">Phone</dt>
          <dd>
            <a href={`tel:${friend.phone_number}`} className="font-medium">
              {friend.phone_number}
            </a>
          </dd>
        </div>
      </dl>

      <FriendLoanHistory loans={loans} />
    </div>
  );
}
