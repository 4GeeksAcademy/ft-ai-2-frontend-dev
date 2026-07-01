import { useMemo } from "react";
import { useMovieStore } from "../stores/useMovieStore";
import { MovieCard } from "./MovieCard";

function MovieCardSkeleton() {
  return (
    <div className="flex animate-pulse gap-4 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
      <div className="h-36 w-24 shrink-0 rounded-md bg-slate-200 dark:bg-slate-700" />
      <div className="flex-1 space-y-3 py-1">
        <div className="h-5 w-2/3 rounded bg-slate-200 dark:bg-slate-700" />
        <div className="h-4 w-1/2 rounded bg-slate-100 dark:bg-slate-800" />
        <div className="h-4 w-full rounded bg-slate-100 dark:bg-slate-800" />
        <div className="h-4 w-full rounded bg-slate-100 dark:bg-slate-800" />
      </div>
    </div>
  );
}

export function MovieResults() {
  const movies = useMovieStore((state) => state.movies);
  const selectedGenreId = useMovieStore((state) => state.selectedGenreId);
  const loading = useMovieStore((state) => state.loading);
  const error = useMovieStore((state) => state.error);
  const browseMode = useMovieStore((state) => state.browseMode);
  const searchQuery = useMovieStore((state) => state.searchQuery);
  const retry = useMovieStore((state) => state.retry);

  const filteredMovies = useMemo(() => {
    if (selectedGenreId === null) return movies;
    return movies.filter((movie) => movie.genreIds.includes(selectedGenreId));
  }, [movies, selectedGenreId]);

  const title =
    browseMode === "search" ? `Results for “${searchQuery}”` : "Now Playing";

  return (
    <section>
      <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h2>

      {loading && (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <MovieCardSkeleton key={index} />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200">
          <p>{error}</p>
          <button
            type="button"
            onClick={() => void retry()}
            className="mt-3 rounded-md bg-red-800 px-3 py-1.5 text-white transition hover:bg-red-900 dark:bg-red-700 dark:hover:bg-red-600"
          >
            Try again
          </button>
        </div>
      )}

      {!loading && !error && filteredMovies.length === 0 && (
        <p className="rounded-lg border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-400">
          {browseMode === "search"
            ? "No movies found. Try a different search or clear the genre filter."
            : "No movies match the selected genre."}
        </p>
      )}

      {!loading && !error && filteredMovies.length > 0 && (
        <div className="flex flex-col gap-4">
          {filteredMovies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      )}
    </section>
  );
}
