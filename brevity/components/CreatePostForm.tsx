"use client";

import { useRef, useState, useTransition } from "react";

import { ApiError, createPost } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { Post } from "@/lib/types";

type CreatePostFormProps = {
  onCreated?: (post: Post) => void;
};

export function CreatePostForm({ onCreated }: CreatePostFormProps) {
  const { token } = useAuth();
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!token) {
    return null;
  }

  async function handleAction(formData: FormData) {
    const content = String(formData.get("content") ?? "").trim();
    if (!content) {
      setError("Enter a single word or @username.");
      return;
    }
    if (!token) {
      setError("You must be logged in to post.");
      return;
    }

    setError(null);
    startTransition(async () => {
      try {
        const post = await createPost(token, content);
        onCreated?.(post);
        formRef.current?.reset();
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Failed to create post");
      }
    });
  }

  return (
    <form
      ref={formRef}
      action={handleAction}
      className="flex flex-col gap-3 rounded-lg border border-zinc-800 bg-zinc-900/40 p-4"
    >
      <label htmlFor="content" className="text-sm text-zinc-400">
        One word, or an @username mention
      </label>
      <div className="flex gap-2">
        <input
          id="content"
          name="content"
          type="text"
          maxLength={200}
          required
          placeholder="brevity"
          disabled={pending}
          className="min-w-0 flex-1 rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-white disabled:opacity-60"
        >
          {pending ? "Posting…" : "Post"}
        </button>
      </div>
      {error ? (
        <p role="alert" className="text-sm text-red-400">
          {error}
        </p>
      ) : null}
    </form>
  );
}
