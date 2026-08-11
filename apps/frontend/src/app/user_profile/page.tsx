"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/lib/auth";
import { apiClient, type ApiError, type User } from "@/lib/api";

export default function UserProfilePage() {
  const router = useRouter();
  const { user, token, isAuthenticated, logout, setUser } = useAuth();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  // Edit mode state
  const [editing, setEditing] = useState(false);
  const [profileUser, setProfileUser] = useState<User | null>(user);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Fetch full profile when authenticated
  useEffect(() => {
    if (!isAuthenticated || !user || !token) return;

    apiClient<User>(`/user/${user.id}`, { token }).then(setProfileUser).catch(() => {
      // If the fetch fails, we still have the auth context user
    });
  }, [isAuthenticated, user, token]);

  function startEditing() {
    setError(null);
    setSuccess(null);
    setEditing(true);
  }

  function cancelEditing() {
    setEditing(false);
    setError(null);
    setSuccess(null);
  }

  async function handleSave(formData: FormData) {
    if (!user || !token) return;

    setError(null);
    setSuccess(null);
    setSaving(true);

    try {
      const updated = await apiClient<User>(`/user/${user.id}`, {
        method: "PATCH",
        token,
        body: JSON.stringify({
          display_name: formData.get("displayName"),
          gravatar_url: formData.get("gravatarUrl"),
        }),
      });

      setProfileUser(updated);
      setUser(updated);
      setEditing(false);
      setSuccess("Profile updated successfully.");
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      setError(apiErr.detail ?? "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  }

  // Guard: render nothing during redirect
  if (!isAuthenticated || !user || !profileUser) {
    return null;
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center">
      <div className="w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-900 p-8 shadow-sm">
        {/* Avatar */}
        <div className="mb-6 flex flex-col items-center gap-4">
          <Image
            src={profileUser.gravatar_url}
            alt={`${profileUser.display_name}'s avatar`}
            className="h-20 w-20 rounded-full"
            width={80}
            height={80}
          />
          <h1 className="text-2xl font-bold tracking-tight text-white">
            {profileUser.display_name}
          </h1>
        </div>

        {/* Success message */}
        {success && (
          <p
            role="status"
            aria-live="polite"
            className="mb-4 rounded-lg bg-green-900/30 px-4 py-2 text-sm text-green-400"
          >
            {success}
          </p>
        )}

        {/* Error message */}
        {error && (
          <p
            role="alert"
            aria-live="polite"
            className="mb-4 rounded-lg bg-red-900/30 px-4 py-2 text-sm text-red-400"
          >
            {error}
          </p>
        )}

        {editing ? (
          /* ---- Edit mode ---- */
          <form action={handleSave} className="flex flex-col gap-4">
            {/* Display name */}
            <div>
              <label
                htmlFor="edit-displayName"
                className="mb-1 block text-sm font-medium text-zinc-300"
              >
                Display name
              </label>
              <input
                id="edit-displayName"
                name="displayName"
                type="text"
                required
                defaultValue={profileUser.display_name}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
              />
            </div>

            {/* Gravatar URL */}
            <div>
              <label
                htmlFor="edit-gravatar"
                className="mb-1 block text-sm font-medium text-zinc-300"
              >
                Gravatar URL
              </label>
              <input
                id="edit-gravatar"
                name="gravatarUrl"
                type="url"
                defaultValue={profileUser.gravatar_url}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 rounded-lg bg-white px-4 py-2 text-sm font-medium text-zinc-900 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save"}
              </button>
              <button
                type="button"
                onClick={cancelEditing}
                disabled={saving}
                className="flex-1 rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          /* ---- Display mode ---- */
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                Email
              </p>
              <p className="mt-0.5 text-sm text-zinc-300">{profileUser.email}</p>
            </div>

            <button
              onClick={startEditing}
              className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-zinc-900 transition hover:bg-zinc-200"
            >
              Edit Profile
            </button>
          </div>
        )}

        {/* Logout */}
        <button
          onClick={logout}
          className="mt-6 w-full text-center text-sm text-zinc-400 underline underline-offset-2 hover:text-zinc-300"
        >
          Log out
        </button>
      </div>
    </div>
  );
}