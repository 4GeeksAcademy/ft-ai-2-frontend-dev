"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/Button";

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const displayName = user?.display_name ?? user?.email;

  return (
    <nav className="flex items-center justify-between border-b border-zinc-800 px-6 py-3">
      <Link
        href="/"
        className="text-lg font-semibold tracking-tight text-white hover:text-zinc-300"
      >
        Auth Demo
      </Link>

      <div className="flex items-center gap-4">
        {isAuthenticated ? (
          <>
            <Link
              href="/account/profile"
              className="text-sm font-medium text-zinc-400 underline-offset-2 hover:text-white hover:underline"
            >
              {displayName}
            </Link>
            <Button variant="secondary" onClick={logout}>
              Log out
            </Button>
          </>
        ) : (
          <>
            <Link
              href="/login"
              className="text-sm font-medium text-zinc-400 underline-offset-2 hover:text-white hover:underline"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-zinc-900 transition hover:bg-zinc-200"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}