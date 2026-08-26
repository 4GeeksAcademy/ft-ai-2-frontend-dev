"use client";

import { useState, useTransition } from "react";

import { ApiError, likePost, unlikePost } from "@/lib/api";
import { useAuth } from "@/lib/auth";

type LikeButtonProps = {
  postId: string;
  likedByMe: boolean;
  likeCount: number;
  onUpdated?: (next: { likedByMe: boolean; likeCount: number }) => void;
};

export function LikeButton({
  postId,
  likedByMe,
  likeCount,
  onUpdated,
}: LikeButtonProps) {
  const { token } = useAuth();
  const [liked, setLiked] = useState(likedByMe);
  const [count, setCount] = useState(likeCount);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!token) {
    return (
      <span className="text-xs text-zinc-500">
        {count} {count === 1 ? "like" : "likes"}
      </span>
    );
  }

  function toggle() {
    if (!token || pending) {
      return;
    }

    const prevLiked = liked;
    const prevCount = count;
    const nextLiked = !liked;
    const nextCount = Math.max(0, count + (nextLiked ? 1 : -1));

    setLiked(nextLiked);
    setCount(nextCount);
    setError(null);
    onUpdated?.({ likedByMe: nextLiked, likeCount: nextCount });

    startTransition(async () => {
      try {
        if (nextLiked) {
          await likePost(token, postId);
        } else {
          await unlikePost(token, postId);
        }
      } catch (err) {
        setLiked(prevLiked);
        setCount(prevCount);
        onUpdated?.({ likedByMe: prevLiked, likeCount: prevCount });
        setError(err instanceof ApiError ? err.message : "Like failed");
      }
    });
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        className={
          liked
            ? "text-xs font-medium text-zinc-100 hover:text-white disabled:opacity-60"
            : "text-xs text-zinc-500 hover:text-zinc-300 disabled:opacity-60"
        }
      >
        {liked ? "Unlike" : "Like"} · {count}
      </button>
      {error ? (
        <span role="alert" className="text-xs text-red-400">
          {error}
        </span>
      ) : null}
    </div>
  );
}
