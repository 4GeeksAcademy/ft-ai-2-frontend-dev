"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { CreatePostForm } from "@/components/CreatePostForm";
import { Navbar } from "@/components/Navbar";
import { PostCard } from "@/components/PostCard";
import { ApiError, fetchTimeline } from "@/lib/api";
import { emitAnalyticsEvent } from "@/lib/analytics";
import { useAuth } from "@/lib/auth";
import type { Post } from "@/lib/types";

type FeedState = {
  forToken: string;
  posts: Post[];
  error: string | null;
};

export function FeedPage() {
  const { token, user } = useAuth();
  const [feed, setFeed] = useState<FeedState | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const posts = feed && token && feed.forToken === token ? feed.posts : [];
  const error = feed && token && feed.forToken === token ? feed.error : null;
  const loading = Boolean(token) && (feed === null || feed.forToken !== token);

  const loadTimeline = useCallback(async () => {
    if (!token) {
      return;
    }
    setRefreshing(true);
    try {
      const data = await fetchTimeline(token);
      setFeed({ forToken: token, posts: data, error: null });
    } catch (err) {
      setFeed({
        forToken: token,
        posts: [],
        error: err instanceof ApiError ? err.message : "Failed to load feed",
      });
    } finally {
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      return;
    }
    let cancelled = false;
    void fetchTimeline(token)
      .then((data) => {
        if (!cancelled) {
          setFeed({ forToken: token, posts: data, error: null });
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setFeed({
            forToken: token,
            posts: [],
            error:
              err instanceof ApiError ? err.message : "Failed to load feed",
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  useEffect(() => {
    void emitAnalyticsEvent("page_view", {
      userId: user?.id ?? null,
      metadata: { path: "/" },
    });
  }, [user?.id]);

  return (
    <>
      <Navbar />
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-10">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-50">
            Brevity
          </h1>
          <p className="mt-1 text-zinc-400">
            The micro-est microblog — one word at a time.
          </p>
        </div>

        {!user ? (
          <section className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-6">
            <p className="text-zinc-300">
              Log in to see your timeline and post a word.
            </p>
            <div className="mt-4 flex gap-3 text-sm">
              <Link
                href="/login"
                className="rounded-md bg-zinc-100 px-4 py-2 font-medium text-zinc-950 hover:bg-white"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="rounded-md border border-zinc-700 px-4 py-2 text-zinc-200 hover:border-zinc-500"
              >
                Register
              </Link>
            </div>
            <p className="mt-4 text-sm text-zinc-500">
              After seeding:{" "}
              <code className="text-zinc-400">alice@example.com</code> /{" "}
              <code className="text-zinc-400">password123</code>
            </p>
          </section>
        ) : (
          <>
            <CreatePostForm
              onCreated={(post) => {
                if (!token) {
                  return;
                }
                setFeed((prev) => ({
                  forToken: token,
                  posts: [post, ...(prev?.forToken === token ? prev.posts : [])],
                  error: null,
                }));
              }}
            />

            <section>
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-sm font-medium uppercase tracking-wide text-zinc-500">
                  Timeline
                </h2>
                <button
                  type="button"
                  onClick={() => void loadTimeline()}
                  className="text-xs text-zinc-500 hover:text-zinc-300"
                >
                  {refreshing ? "Refreshing…" : "Refresh"}
                </button>
              </div>

              {loading ? (
                <p className="py-8 text-sm text-zinc-500">Loading feed…</p>
              ) : null}

              {error ? (
                <p role="alert" className="py-4 text-sm text-red-400">
                  {error}
                </p>
              ) : null}

              {!loading && !error && posts.length === 0 ? (
                <p className="py-8 text-sm text-zinc-500">
                  No posts yet. Follow someone or post a word.
                </p>
              ) : null}

              <div>
                {posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onPostPatch={(postId, patch) => {
                      if (!token) {
                        return;
                      }
                      setFeed((prev) => {
                        if (!prev || prev.forToken !== token) {
                          return prev;
                        }
                        return {
                          ...prev,
                          posts: prev.posts.map((p) =>
                            p.id === postId ? { ...p, ...patch } : p,
                          ),
                        };
                      });
                    }}
                  />
                ))}
              </div>
            </section>
          </>
        )}
      </main>
    </>
  );
}
