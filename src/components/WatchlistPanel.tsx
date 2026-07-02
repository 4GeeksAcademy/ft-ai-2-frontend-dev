import { useAuthStore } from "../stores/useAuthStore";
import { useMovieStore } from "../stores/useMovieStore";
import { MovieCardSmall } from "./MovieCardSmall";

function WatchlistSkeleton() {
  return (
    <div className="flex animate-pulse items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
      <div className="h-16 w-12 shrink-0 rounded bg-slate-200 dark:bg-slate-700" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-3/4 rounded bg-slate-200 dark:bg-slate-700" />
        <div className="h-3 w-1/2 rounded bg-slate-100 dark:bg-slate-800" />
      </div>
    </div>
  );
}

export function WatchlistPanel() {
  const sessionId = useAuthStore((state) => state.sessionId);
  const authLoading = useAuthStore((state) => state.authLoading);
  const startLogin = useAuthStore((state) => state.startLogin);
  const watchlist = useMovieStore((state) => state.watchlist);
  const watchlistLoading = useMovieStore((state) => state.watchlistLoading);
  const watchlistError = useMovieStore((state) => state.watchlistError);
  const retryWatchlist = useMovieStore((state) => state.retryWatchlist);

  if (!sessionId) {
    return (
      <aside>
        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
          Watchlist
        </h2>
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-4 dark:border-slate-600 dark:bg-slate-900">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Log in with your TMDB account to view and manage your watchlist.
          </p>
          <button
            type="button"
            onClick={() => void startLogin()}
            disabled={authLoading}
            className="mt-3 rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
          >
            {authLoading ? "Redirecting…" : "Log in with TMDB"}
          </button>
        </div>
      </aside>
    );
  }

  return (
    <aside>
      <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
        Watchlist ({watchlist.length})
      </h2>

      {watchlistError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200">
          <p>{watchlistError}</p>
          <button
            type="button"
            onClick={() => void retryWatchlist()}
            className="mt-2 rounded-md bg-red-800 px-3 py-1 text-xs text-white transition hover:bg-red-900 dark:bg-red-700 dark:hover:bg-red-600"
          >
            Try again
          </button>
        </div>
      )}

      {watchlistLoading && (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <WatchlistSkeleton key={index} />
          ))}
        </div>
      )}

      {!watchlistLoading && !watchlistError && watchlist.length === 0 && (
        <p className="rounded-lg border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-400">
          No movies yet. Use the + button on a card to add one.
        </p>
      )}

      {!watchlistLoading && watchlist.length > 0 && (
        <div className="flex flex-col gap-3">
          {watchlist.map((movie) => (
            <MovieCardSmall key={movie.id} movie={movie} />
          ))}
        </div>
      )}
    </aside>
  );
}
