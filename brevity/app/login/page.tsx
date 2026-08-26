"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import { Navbar } from "@/components/Navbar";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function LoginPage() {
  const { user, login } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (user) {
      router.replace("/");
    }
  }, [user, router]);

  async function handleAction(formData: FormData) {
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    setError(null);
    startTransition(async () => {
      try {
        await login(email, password);
        router.replace("/");
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Login failed");
      }
    });
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto flex min-h-full w-full max-w-md flex-col gap-6 px-6 py-16">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-50">Log in</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Welcome back. Sessions live in memory only.
          </p>
        </div>

        <form action={handleAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm text-zinc-400">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              disabled={pending}
              className="rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100 focus:border-zinc-500 focus:outline-none"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm text-zinc-400">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              disabled={pending}
              className="rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100 focus:border-zinc-500 focus:outline-none"
            />
          </div>

          {error ? (
            <p role="alert" className="text-sm text-red-400">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-white disabled:opacity-60"
          >
            {pending ? "Signing in…" : "Log in"}
          </button>
        </form>

        <p className="text-sm text-zinc-500">
          No account?{" "}
          <Link href="/register" className="text-zinc-300 hover:text-zinc-100">
            Register
          </Link>
        </p>
      </main>
    </>
  );
}
