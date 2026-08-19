"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { apiClient, type ApiError, type User } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { PageCenter } from "@/components/layout/PageCenter";
import { Avatar } from "@/components/ui/Avatar";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

export function ProfileForm() {
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
    <PageCenter>
      <Card className="max-w-md">
        {/* Avatar */}
        <div className="mb-6 flex flex-col items-center gap-4">
          <Avatar
            src={profileUser.gravatar_url}
            alt={`${profileUser.display_name}'s avatar`}
            size={80}
          />
          <h1 className="text-2xl font-bold tracking-tight text-white">
            {profileUser.display_name}
          </h1>
        </div>

        {/* Success message */}
        {success && (
          <Alert variant="success" ariaLive="polite">
            {success}
          </Alert>
        )}

        {/* Error message */}
        {error && (
          <Alert variant="error" id="profile-error">
            {error}
          </Alert>
        )}

        {editing ? (
          /* ---- Edit mode ---- */
          <form action={handleSave} className="flex flex-col gap-4">
            <Input
              id="edit-displayName"
              name="displayName"
              label="Display name"
              type="text"
              required
              defaultValue={profileUser.display_name}
            />

            <Input
              id="edit-gravatar"
              name="gravatarUrl"
              label="Gravatar URL"
              type="url"
              defaultValue={profileUser.gravatar_url}
            />

            <div className="flex gap-3">
              <Button
                type="submit"
                loading={saving}
                loadingLabel="Saving…"
                className="flex-1"
              >
                Save
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={cancelEditing}
                disabled={saving}
                className="flex-1"
              >
                Cancel
              </Button>
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

            <Button onClick={startEditing}>Edit Profile</Button>
          </div>
        )}

        {/* Logout */}
        <button
          onClick={logout}
          className="mt-6 w-full text-center text-sm text-zinc-400 underline underline-offset-2 hover:text-zinc-300"
        >
          Log out
        </button>
      </Card>
    </PageCenter>
  );
}