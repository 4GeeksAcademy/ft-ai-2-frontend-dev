"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { apiClient, type ApiError } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { PageCenter } from "@/components/layout/PageCenter";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

export function ChangePasswordForm() {
  const { token, isLoading, isAuthenticated } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleChangePassword(formData: FormData) {
    if (loading || !token) {
      return;
    }

    const currentPassword = String(formData.get("currentPassword") ?? "");
    const newPassword = String(formData.get("newPassword") ?? "");
    const confirmNewPassword = String(formData.get("confirmNewPassword") ?? "");

    setError(null);
    setSuccess(null);

    if (newPassword !== confirmNewPassword) {
      setError("New password and confirmation do not match.");
      return;
    }

    setLoading(true);

    try {
      await apiClient<{ detail: string }>("/auth/change-password", {
        method: "POST",
        token,
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });

      setSuccess("Password changed successfully.");
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      setError(apiErr.detail ?? "Failed to change password.");
    } finally {
      setLoading(false);
    }
  }

  if (isLoading || !isAuthenticated) {
    return null;
  }

  return (
    <PageCenter>
      <Card>
        <h1 className="mb-6 text-2xl font-bold tracking-tight text-white">
          Change password
        </h1>

        {success && (
          <Alert variant="success" ariaLive="polite">
            {success}
          </Alert>
        )}

        {error && (
          <Alert id="change-password-error" variant="error">
            {error}
          </Alert>
        )}

        <form action={handleChangePassword} className="mt-4 flex flex-col gap-4">
          <Input
            id="currentPassword"
            name="currentPassword"
            label="Current password"
            type="password"
            required
            autoComplete="current-password"
            errorId={error ? "change-password-error" : undefined}
          />

          <Input
            id="newPassword"
            name="newPassword"
            label="New password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            errorId={error ? "change-password-error" : undefined}
          />

          <Input
            id="confirmNewPassword"
            name="confirmNewPassword"
            label="Confirm new password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            errorId={error ? "change-password-error" : undefined}
          />

          <Button type="submit" loading={loading} loadingLabel="Updating…">
            Update password
          </Button>
        </form>
      </Card>
    </PageCenter>
  );
}
