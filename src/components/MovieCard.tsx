import { useMemo } from "react";
import type { Movie } from "../types/movie";
import { buildGenreNameMap, formatGenres, posterUrl } from "../types/movie";
import { useMovieStore } from "../stores/useMovieStore";
import { WatchlistButton } from "./WatchlistButton";

type MovieCardProps = {
  movie: Movie;
};

export function MovieCard({ movie }: MovieCardProps) {
  const genres = useMovieStore((state) => state.genres);
  const isInWatchlist = useMovieStore((state) =>
    state.watchlist.some((item) => item.id === movie.id),
  );
  const toggleWatchlist = useMovieStore((state) => state.toggleWatchlist);
  const genreNames = useMemo(() => buildGenreNameMap(genres), [genres]);
  const src = posterUrl(movie.posterPath);
  const year = movie.releaseDate ? movie.releaseDate.slice(0, 4) : "—";

  return (
    <article className="relative flex gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="absolute right-3 top-3">
        <WatchlistButton
          inWatchlist={isInWatchlist}
          onClick={() => toggleWatchlist(movie.id)}
        />
      </div>

      <div className="h-36 w-24 shrink-0 overflow-hidden rounded-md bg-slate-100 dark:bg-slate-800">
        {src ? (
          <img
            src={src}
            alt={movie.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-slate-400">
            No poster
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1 pr-8">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{movie.title}</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {year} · {formatGenres(movie.genreIds, genreNames)} · ★{" "}
          {movie.voteAverage.toFixed(1)}
        </p>
        <p className="mt-2 line-clamp-3 text-sm text-slate-600 dark:text-slate-300">{movie.overview}</p>
      </div>
    </article>
  );
}
