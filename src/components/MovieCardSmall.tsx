import { useMemo } from "react";
import type { Movie } from "../types/movie";
import { buildGenreNameMap, formatGenres, posterUrl } from "../types/movie";
import { useMovieStore } from "../stores/useMovieStore";
import { WatchlistButton } from "./WatchlistButton";

type MovieCardSmallProps = {
  movie: Movie;
};

export function MovieCardSmall({ movie }: MovieCardSmallProps) {
  const genres = useMovieStore((state) => state.genres);
  const removeFromWatchlist = useMovieStore((state) => state.removeFromWatchlist);
  const watchlistMutating = useMovieStore((state) => state.watchlistMutating);
  const genreNames = useMemo(() => buildGenreNameMap(genres), [genres]);
  const src = posterUrl(movie.posterPath);

  return (
    <article className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="h-16 w-12 shrink-0 overflow-hidden rounded bg-slate-100 dark:bg-slate-800">
        {src ? (
          <img
            src={src}
            alt={movie.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[10px] text-slate-400">
            —
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
          {movie.title}
        </h3>
        <p className="truncate text-xs text-slate-500 dark:text-slate-400">
          {formatGenres(movie.genreIds, genreNames)}
        </p>
      </div>

      <WatchlistButton
        inWatchlist
        onClick={() => void removeFromWatchlist(movie.id)}
        disabled={watchlistMutating}
      />
    </article>
  );
}
