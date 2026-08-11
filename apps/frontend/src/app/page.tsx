"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";

export default function HomePage() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8">
      <h1 className="text-4xl font-bold tracking-tight text-white">
        Hello {isAuthenticated ? user!.display_name : "world"}!
      </h1>

      {isAuthenticated ? (
        <div className="flex items-center gap-4">
          <Link
            href="/user_profile"
            className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-zinc-900 transition hover:bg-zinc-200"
          >
            View Profile
          </Link>
          <button
            onClick={logout}
            className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 transition hover:bg-zinc-800"
          >
            Log out
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-zinc-900 transition hover:bg-zinc-200"
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 transition hover:bg-zinc-800"
          >
            Register
          </Link>
        </div>
      )}
    </div>
  );
}
            
