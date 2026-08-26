"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { FollowButton } from "@/components/FollowButton";
import { Navbar } from "@/components/Navbar";
import { PostCard } from "@/components/PostCard";
import { emitAnalyticsEvent } from "@/lib/analytics";
import { ApiError, fetchUserPosts, fetchUserProfile } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { Post, UserPublic } from "@/lib/types";

type ProfileViewProps = {
  username: string;
};

type ProfileState = {
  username: string;
  profile: UserPublic;
  posts: Post[];
};

export function ProfileView({ username }: ProfileViewProps) {
  const { token, user } = useAuth();
  const [state, setState] = useState<ProfileState | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loading = state?.username !== username;
  const profile = state?.username === username ? state.profile : null;
  const posts = state?.username === username ? state.posts : [];

  useEffect(() => {
    let cancelled = false;
    void Promise.all([
      fetchUserProfile(username, token ?? undefined),
      fetchUserPosts(username, token ?? undefined),
    ])
      .then(([userProfile, userPosts]) => {
        if (!cancelled) {
          setState({ username, profile: userProfile, posts: userPosts });
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setState(null);
          setError(
            err instanceof ApiError ? err.message : "Failed to load profile",
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, [username, token]);

  useEffect(() => {
    void emitAnalyticsEvent("page_view", {
      userId: user?.id ?? null,
      metadata: { path: `/profile/${username}` },
    });
  }, [username, user?.id]);

  return (
    <>
      <Navbar />
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-10">
        {loading && !error ? (
          <p className="text-sm text-zinc-500">Loading profile…</p>
        ) : null}

        {error ? (
          <p role="alert" className="text-sm text-red-400">
            {error}
          </p>
        ) : null}

        {profile ? (
          <section className="flex gap-4 border-b border-zinc-800 pb-6">
            {profile.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt={`${profile.username} avatar`}
                width={72}
                height={72}
                className="rounded-full bg-zinc-800"
              />
            ) : (
              <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-zinc-800 text-lg text-zinc-400">
                {profile.username.slice(0, 1).toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-semibold text-zinc-50">
                    {profile.display_name}
                  </h1>
                  <p className="text-zinc-400">@{profile.username}</p>
                </div>
                {typeof profile.is_following === "boolean" ? (
                  <FollowButton
                    key={`${profile.username}:${profile.is_following}`}
                    username={profile.username}
                    initiallyFollowing={profile.is_following}
                    onChanged={(following) => {
                      setState((prev) => {
                        if (!prev || prev.username !== username) {
                          return prev;
                        }
                        const delta = following ? 1 : -1;
                        return {
                          ...prev,
                          profile: {
                            ...prev.profile,
                            is_following: following,
                            follower_count: Math.max(
                              0,
                              prev.profile.follower_count + delta,
                            ),
                          },
                        };
                      });
                    }}
                  />
                ) : null}
              </div>
              {profile.bio ? (
                <p className="mt-2 text-sm text-zinc-300">{profile.bio}</p>
              ) : null}
              <p className="mt-3 text-xs text-zinc-500">
                {profile.post_count} posts · {profile.follower_count} followers ·{" "}
                {profile.following_count} following
              </p>
            </div>
          </section>
        ) : null}

        {!loading && !error ? (
          <section>
            <h2 className="mb-2 text-sm font-medium uppercase tracking-wide text-zinc-500">
              Posts
            </h2>
            {posts.length === 0 ? (
              <p className="py-6 text-sm text-zinc-500">No posts yet.</p>
            ) : (
              posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onPostPatch={(postId, patch) => {
                    setState((prev) => {
                      if (!prev || prev.username !== username) {
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
              ))
            )}
          </section>
        ) : null}
      </main>
    </>
  );
}
