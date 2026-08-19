"use client";

import { useEffect, useState } from "react";
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
  const token = searchParams.get("token");

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // ── State A: Email form (no token in URL) ──────────────────────────
  const [emailSent, setEmailSent] = useState(false);

  // ── State B: Password form (token in URL) ──────────────────────────
  const [success, setSuccess] = useState(false);

  async function handleRequestLink(formData: FormData) {
    setError(null);
    setLoading(true);

    try {
      await apiClient("/auth/request-reset-link", {
        method: "POST",
        body: JSON.stringify({ email: formData.get("email") }),
      });
      setEmailSent(true);
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      setError(apiErr.detail ?? "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(formData: FormData) {
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
      setSuccess(true);
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      setError(apiErr.detail ?? "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }

  // ── Redirect to login after successful reset ───────────────────────
  useEffect(() => {
    if (success) {
      const timeout = setTimeout(() => {
        router.replace("/login?reset=success");
      }, 1500);
      return () => clearTimeout(timeout);
    }
  }, [success, router]);

  return (
    <PageCenter>
      {/* ── Token present: password reset form ──────────────────────── */}
      {token && !success && (
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
            href="/reset-password"
          />
        </Card>
      )}

      {/* ── Token present: success after reset ──────────────────────── */}
      {token && success && (
        <Card>
          <h1 className="mb-6 text-2xl font-bold tracking-tight text-green-400">
            Password reset!
          </h1>
          <p className="text-sm text-zinc-300">
            Your password has been reset successfully. Redirecting to
            login…
          </p>
        </Card>
      )}

      {/* ── No token: email form ────────────────────────────────────── */}
      {!token && !emailSent && (
        <Card>
          <h1 className="mb-6 text-2xl font-bold tracking-tight text-white">
            Reset password
          </h1>
          <p className="mb-6 text-sm text-zinc-400">
            Enter your email address and we&apos;ll send you a link to reset
            your password.
          </p>

          <form action={handleRequestLink} className="flex flex-col gap-4">
            <Input
              id="email"
              name="email"
              label="Email"
              type="email"
              required
              autoComplete="email"
              errorId={error ? "reset-error" : undefined}
            />

            {error && (
              <Alert id="reset-error" variant="error">
                {error}
              </Alert>
            )}

            <Button type="submit" loading={loading} loadingLabel="Sending…">
              Send reset link
            </Button>
          </form>

          <AuthLink label="" linkLabel="Back to log in" href="/login" />
        </Card>
      )}

      {/* ── No token: email sent confirmation ───────────────────────── */}
      {!token && emailSent && (
        <Card>
          <h1 className="mb-6 text-2xl font-bold tracking-tight text-green-400">
            Check your email
          </h1>
          <p className="text-sm text-zinc-300">
            If an account with that email exists, we&apos;ve sent a password
            reset link. Check your inbox (or the backend terminal for the
            simulated email).
          </p>
          <AuthLink label="" linkLabel="Back to log in" href="/login" />
        </Card>
      )}
    </PageCenter>
  );
}