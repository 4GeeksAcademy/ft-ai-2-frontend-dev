import { useMovieStore } from "../stores/useMovieStore";
import { MovieCardSmall } from "./MovieCardSmall";

export function WatchlistPanel() {
  const watchlist = useMovieStore((state) => state.watchlist);

  return (
    <aside>
      <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
        Watchlist ({watchlist.length})
      </h2>
      <p className="mb-4 text-xs text-slate-500 dark:text-slate-400">
        Phase 2b will sync this with your TMDB account.
      </p>
      {watchlist.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-400">
          No movies yet. Use the + button on a card to add one.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {watchlist.map((movie) => (
            <MovieCardSmall key={movie.id} movie={movie} />
          ))}
        </div>
      )}
    </aside>
  );
}
