"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { apiClient, type ApiError, type ProfilePublic } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { PageCenter } from "@/components/layout/PageCenter";
import { Avatar } from "@/components/ui/Avatar";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

export function ProfileForm() {
  const { user, token, isLoading, isAuthenticated, logout } = useAuth();
  const displayName = user?.display_name ?? user?.email;

  // Edit mode state
  const [editing, setEditing] = useState(false);

  const [profile, setProfile] = useState<ProfilePublic | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Fetch full profile when authenticated
  useEffect(() => {
    if (!isAuthenticated || !token) {
      return;
    }

    apiClient<ProfilePublic>("/profiles/me", { token })
      .then(setProfile)
      .catch((err: unknown) => {
        const apiErr = err as ApiError;
        setError(apiErr.detail ?? "Failed to load profile.");
      });
  }, [isAuthenticated, token]);

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
    if (!token) {
      return;
    }

    setError(null);
    setSuccess(null);
    setSaving(true);

    try {
      const updated = await apiClient<ProfilePublic>("/profiles/me", {
        method: "PUT",
        token,
        body: JSON.stringify({
          name: formData.get("name"),
          phone: formData.get("phone"),
          address: formData.get("address"),
        }),
      });

      setProfile(updated);
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
  if (isLoading || !isAuthenticated || !user) {
    return null;
  }

  if (!profile) {
    return null;
  }

  return (
    <PageCenter>
      <Card className="max-w-md">
        {/* Avatar */}
        <div className="mb-6 flex flex-col items-center gap-4">
          <Avatar
            src={user.gravatar_url}
            alt={`${displayName}'s avatar`}
            size={80}
          />
          <h1 className="text-2xl font-bold tracking-tight text-white">
            {displayName}
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
              id="edit-name"
              name="name"
              label="Name"
              type="text"
              defaultValue={profile.name ?? ""}
            />

            <Input
              id="edit-phone"
              name="phone"
              label="Phone"
              type="text"
              defaultValue={profile.phone ?? ""}
            />

            <Input
              id="edit-address"
              name="address"
              label="Address"
              type="text"
              defaultValue={profile.address ?? ""}
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
              <p className="mt-0.5 text-sm text-zinc-300">{user.email}</p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                Name
              </p>
              <p className="mt-0.5 text-sm text-zinc-300">{profile.name ?? "-"}</p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                Phone
              </p>
              <p className="mt-0.5 text-sm text-zinc-300">{profile.phone ?? "-"}</p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                Address
              </p>
              <p className="mt-0.5 text-sm text-zinc-300">{profile.address ?? "-"}</p>
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