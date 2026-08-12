"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { apiClient, type ApiError } from "@/lib/api";

function ResetPasswordForm() {
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
    <div className="flex flex-1 flex-col items-center justify-center">
      <div className="w-full max-w-sm rounded-xl border border-zinc-800 bg-zinc-900 p-8 shadow-sm">
        {/* ── Token present: password reset form ──────────────────────── */}
        {token && !success && (
          <>
            <h1 className="mb-6 text-2xl font-bold tracking-tight text-white">
              Reset password
            </h1>

            <form action={handleResetPassword} className="flex flex-col gap-4">
              {/* New password */}
              <div>
                <label
                  htmlFor="newPassword"
                  className="mb-1 block text-sm font-medium text-zinc-300"
                >
                  New password
                </label>
                <input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  aria-describedby={error ? "reset-error" : undefined}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
                />
              </div>

              {/* Confirm password */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-1 block text-sm font-medium text-zinc-300"
                >
                  Confirm password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  aria-describedby={error ? "reset-error" : undefined}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
                />
              </div>

              {/* Error */}
              {error && (
                <p
                  id="reset-error"
                  role="alert"
                  aria-live="polite"
                  className="text-sm text-red-400"
                >
                  {error}
                </p>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-zinc-900 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Resetting…" : "Reset password"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-zinc-400">
              <Link
                href="/reset-password"
                className="font-medium text-white underline underline-offset-2 hover:text-zinc-300"
              >
                Request a new reset link
              </Link>
            </p>
          </>
        )}

        {/* ── Token present: success after reset ──────────────────────── */}
        {token && success && (
          <>
            <h1 className="mb-6 text-2xl font-bold tracking-tight text-green-400">
              Password reset!
            </h1>
            <p className="text-sm text-zinc-300">
              Your password has been reset successfully. Redirecting to
              login…
            </p>
          </>
        )}

        {/* ── No token: email form ────────────────────────────────────── */}
        {!token && !emailSent && (
          <>
            <h1 className="mb-6 text-2xl font-bold tracking-tight text-white">
              Reset password
            </h1>
            <p className="mb-6 text-sm text-zinc-400">
              Enter your email address and we&apos;ll send you a link to reset
              your password.
            </p>

            <form action={handleRequestLink} className="flex flex-col gap-4">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-1 block text-sm font-medium text-zinc-300"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  aria-describedby={error ? "reset-error" : undefined}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
                />
              </div>

              {/* Error */}
              {error && (
                <p
                  id="reset-error"
                  role="alert"
                  aria-live="polite"
                  className="text-sm text-red-400"
                >
                  {error}
                </p>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-zinc-900 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Sending…" : "Send reset link"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-zinc-400">
              <Link
                href="/login"
                className="font-medium text-white underline underline-offset-2 hover:text-zinc-300"
              >
                Back to log in
              </Link>
            </p>
          </>
        )}

        {/* ── No token: email sent confirmation ───────────────────────── */}
        {!token && emailSent && (
          <>
            <h1 className="mb-6 text-2xl font-bold tracking-tight text-green-400">
              Check your email
            </h1>
            <p className="text-sm text-zinc-300">
              If an account with that email exists, we&apos;ve sent a password
              reset link. Check your inbox (or the backend terminal for the
              simulated email).
            </p>
            <p className="mt-4 text-center text-sm text-zinc-400">
              <Link
                href="/login"
                className="font-medium text-white underline underline-offset-2 hover:text-zinc-300"
              >
                Back to log in
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center">
      <Suspense fallback={null}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}