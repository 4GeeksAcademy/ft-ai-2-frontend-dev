"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiClient, type ApiError } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { PageCenter } from "@/components/layout/PageCenter";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { AuthLink } from "@/components/layout/AuthLink";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token")?.trim() ?? "";

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const invalidTokenMessage =
    "This password reset link is missing, invalid, or has expired. Request a new reset link to continue.";

  async function handleResetPassword(formData: FormData) {
    if (loading) {
      return;
    }

    if (!token) {
      setError(invalidTokenMessage);
      return;
    }

    setError(null);
    setLoading(true);

    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    // Client-side confirmation check
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      await apiClient("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, new_password: newPassword }),
      });
      router.replace("/login?reset=success");
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      setError(apiErr.detail ?? invalidTokenMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageCenter>
      {!token ? (
        <Card>
          <h1 className="mb-6 text-2xl font-bold tracking-tight text-white">
            Reset password
          </h1>
          <Alert id="reset-token-error" variant="error">
            {invalidTokenMessage}
          </Alert>
          <AuthLink label="" linkLabel="Request a new reset link" href="/forgot-password" />
        </Card>
      ) : (
        <Card>
          <h1 className="mb-6 text-2xl font-bold tracking-tight text-white">
            Reset password
          </h1>

          <form action={handleResetPassword} className="flex flex-col gap-4">
            <Input
              id="newPassword"
              name="newPassword"
              label="New password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              errorId={error ? "reset-error" : undefined}
            />

            <Input
              id="confirmPassword"
              name="confirmPassword"
              label="Confirm password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              errorId={error ? "reset-error" : undefined}
            />

            {error && (
              <Alert id="reset-error" variant="error">
                {error}
              </Alert>
            )}

            <Button type="submit" loading={loading} loadingLabel="Resetting…">
              Reset password
            </Button>
          </form>

          <AuthLink
            label=""
            linkLabel="Request a new reset link"
            href="/forgot-password"
          />
        </Card>
      )}
    </PageCenter>
  );
}