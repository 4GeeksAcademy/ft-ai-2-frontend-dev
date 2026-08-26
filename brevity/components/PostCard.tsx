"use client";

import Link from "next/link";

import { LikeButton } from "@/components/LikeButton";
import type { Post } from "@/lib/types";

type PostCardProps = {
  post: Post;
  onPostPatch?: (postId: string, patch: Partial<Post>) => void;
};

function formatTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function PostCard({ post, onPostPatch }: PostCardProps) {
  return (
    <article className="border-b border-zinc-800 py-4">
      <div className="flex items-baseline justify-between gap-3">
        <Link
          href={`/profile/${post.author.username}`}
          className="text-sm font-medium text-zinc-300 hover:text-zinc-100"
        >
          @{post.author.username}
          <span className="ml-2 font-normal text-zinc-500">
            {post.author.display_name}
          </span>
        </Link>
        <time
          dateTime={post.created_at}
          className="shrink-0 text-xs text-zinc-500"
        >
          {formatTime(post.created_at)}
        </time>
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-zinc-50">
        {post.content}
      </p>
      <div className="mt-3">
        <LikeButton
          key={`${post.id}:${post.liked_by_me}:${post.like_count}`}
          postId={post.id}
          likedByMe={post.liked_by_me}
          likeCount={post.like_count}
          onUpdated={({ likedByMe, likeCount }) => {
            onPostPatch?.(post.id, {
              liked_by_me: likedByMe,
              like_count: likeCount,
            });
          }}
        />
      </div>
    </article>
  );
}
