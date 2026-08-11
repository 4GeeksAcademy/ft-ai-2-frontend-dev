"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { apiClient, type ApiError } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

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
      await apiClient("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          email: formData.get("email"),
          password: formData.get("password"),
          display_name: formData.get("displayName"),
        }),
      });

      // Registration succeeded — redirect to login
      router.replace("/login");
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      setError(apiErr.detail ?? "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center">
      <div className="w-full max-w-sm rounded-xl border border-zinc-800 bg-zinc-900 p-8 shadow-sm">
        <h1 className="mb-6 text-2xl font-bold tracking-tight text-white">Register</h1>

        <form action={handleSubmit} className="flex flex-col gap-4">
          {/* Display name */}
          <div>
            <label
              htmlFor="displayName"
              className="mb-1 block text-sm font-medium text-zinc-300"
            >
              Display name
            </label>
            <input
              id="displayName"
              name="displayName"
              type="text"
              required
              aria-describedby={error ? "register-error" : undefined}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
            />
          </div>

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
              aria-describedby={error ? "register-error" : undefined}
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
              autoComplete="new-password"
              minLength={8}
              maxLength={128}
              aria-describedby={error ? "register-error" : undefined}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
            />
            <p className="mt-1 text-xs text-zinc-400">
              8–128 characters
            </p>
          </div>

          {/* Error */}
          {error && (
            <p
              id="register-error"
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
            {loading ? "Creating account…" : "Register"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-400">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-white underline underline-offset-2 hover:text-zinc-300"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}