"use client";

import Link from "next/link";

import { useAuth } from "@/lib/auth";

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="border-b border-zinc-800 px-6 py-4">
      <nav className="mx-auto flex max-w-3xl items-center justify-between">
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight text-zinc-50"
        >
          Brevity
        </Link>
        <div className="flex items-center gap-4 text-sm text-zinc-400">
          <Link href="/analytics" className="hover:text-zinc-200">
            Analytics
          </Link>
          {user ? (
            <>
              <Link
                href={`/profile/${user.username}`}
                className="hover:text-zinc-200"
              >
                @{user.username}
              </Link>
              <button
                type="button"
                onClick={logout}
                className="hover:text-zinc-200"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-zinc-200">
                Log in
              </Link>
              <Link href="/register" className="hover:text-zinc-200">
                Register
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
