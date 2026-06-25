import Link from "next/link";
import FriendForm from "@/components/friend_form/FriendForm";
import { createFriendAction } from "./actions";

export default function CreateFriendPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 p-6 md:p-8">
      <Link
        href="/friends"
        className="text-sm text-zinc-600 transition-colors hover:text-foreground dark:text-zinc-400"
      >
        Back to friends
      </Link>

      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Add a friend</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Save a new contact you might loan books to.
        </p>
      </header>

      <FriendForm action={createFriendAction} />
    </div>
  );
}
