"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import type { ApiError } from "@/lib/api";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated } = useAuth();
  const resetSuccess = searchParams.get("reset") === "success";

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Already logged in — redirect to profile
  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/user_profile");
    }
  }, [isAuthenticated, router]);

  if (isAuthenticated) {
    return null;
  }

  async function handleSubmit(formData: FormData) {
    setError(null);
    setLoading(true);

    try {
      await login(
        formData.get("email") as string,
        formData.get("password") as string,
      );
      router.replace("/user_profile");
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      setError(apiErr.detail ?? "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm rounded-xl border border-zinc-800 bg-zinc-900 p-8 shadow-sm">
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-white">Log in</h1>

      {/* Success banner after password reset */}
      {resetSuccess && (
        <div
          role="alert"
          className="mb-6 rounded-lg border border-green-800 bg-green-950 px-4 py-3 text-sm text-green-400"
        >
          Your password has been reset successfully. Please log in with your
          new password.
        </div>
      )}

      <form action={handleSubmit} className="flex flex-col gap-4">
        {/* Email */}
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-zinc-300">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            aria-describedby={error ? "login-error" : undefined}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
          />
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="password"
            className="mb-1 block text-sm font-medium text-zinc-300"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            aria-describedby={error ? "login-error" : undefined}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
          />
          <div className="mt-1 text-right">
            <Link
              href="/reset-password"
              className="text-xs font-medium text-zinc-400 underline-offset-2 hover:text-white hover:underline"
            >
              Forgot your password?
            </Link>
          </div>
        </div>

        {/* Error */}
        {error && (
          <p
            id="login-error"
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
          {loading ? "Logging in…" : "Log in"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-400">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-medium text-white underline underline-offset-2 hover:text-zinc-300"
        >
          Register
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center">
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </div>
  );
}