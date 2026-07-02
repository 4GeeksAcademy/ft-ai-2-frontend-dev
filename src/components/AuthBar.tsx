import { useAuthStore } from "../stores/useAuthStore";

export function AuthBar() {
  const sessionId = useAuthStore((state) => state.sessionId);
  const username = useAuthStore((state) => state.username);
  const authLoading = useAuthStore((state) => state.authLoading);
  const authError = useAuthStore((state) => state.authError);
  const startLogin = useAuthStore((state) => state.startLogin);
  const logout = useAuthStore((state) => state.logout);

  return (
    <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="text-sm text-slate-500 dark:text-slate-400">
        {sessionId ? (
          <span>
            Signed in as <span className="font-medium text-slate-700 dark:text-slate-200">{username}</span>
          </span>
        ) : (
          <span>Sign in to manage your TMDB watchlist</span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {sessionId ? (
          <button
            type="button"
            onClick={logout}
            disabled={authLoading}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            Log out
          </button>
        ) : (
          <button
            type="button"
            onClick={() => void startLogin()}
            disabled={authLoading}
            className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
          >
            {authLoading ? "Redirecting…" : "Log in with TMDB"}
          </button>
        )}
      </div>

      {authError && (
        <p className="text-sm text-red-600 dark:text-red-400 sm:basis-full">
          {authError}
        </p>
      )}
    </div>
  );
}
