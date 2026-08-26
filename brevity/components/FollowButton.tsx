"use client";

import { useState, useTransition } from "react";

import { ApiError, followUser, unfollowUser } from "@/lib/api";
import { useAuth } from "@/lib/auth";

type FollowButtonProps = {
  username: string;
  initiallyFollowing: boolean;
  onChanged?: (following: boolean) => void;
};

export function FollowButton({
  username,
  initiallyFollowing,
  onChanged,
}: FollowButtonProps) {
  const { token, user } = useAuth();
  const [following, setFollowing] = useState(initiallyFollowing);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!token || !user || user.username === username) {
    return null;
  }

  function toggle() {
    if (!token || pending) {
      return;
    }

    const prev = following;
    const next = !following;
    setFollowing(next);
    setError(null);
    onChanged?.(next);

    startTransition(async () => {
      try {
        if (next) {
          await followUser(token, username);
        } else {
          await unfollowUser(token, username);
        }
      } catch (err) {
        setFollowing(prev);
        onChanged?.(prev);
        setError(err instanceof ApiError ? err.message : "Follow failed");
      }
    });
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        className={
          following
            ? "rounded-md border border-zinc-600 px-3 py-1.5 text-sm text-zinc-200 hover:border-zinc-400 disabled:opacity-60"
            : "rounded-md bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-950 hover:bg-white disabled:opacity-60"
        }
      >
        {pending ? "…" : following ? "Unfollow" : "Follow"}
      </button>
      {error ? (
        <span role="alert" className="text-xs text-red-400">
          {error}
        </span>
      ) : null}
    </div>
  );
}
