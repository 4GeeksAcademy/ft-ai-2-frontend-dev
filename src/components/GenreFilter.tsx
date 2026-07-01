import { useMovieStore } from "../stores/useMovieStore";

export function GenreFilter() {
  const genres = useMovieStore((state) => state.genres);
  const selectedGenreId = useMovieStore((state) => state.selectedGenreId);
  const setSelectedGenre = useMovieStore((state) => state.setSelectedGenre);

  return (
    <div>
      <label htmlFor="genre-filter" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
        Genre
      </label>
      <select
        id="genre-filter"
        value={selectedGenreId ?? ""}
        onChange={(event) => {
          const value = event.target.value;
          setSelectedGenre(value ? Number(value) : null);
        }}
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-slate-500 dark:focus:ring-slate-700"
      >
        <option value="">All genres</option>
        {genres.map((genre) => (
          <option key={genre.id} value={genre.id}>
            {genre.name}
          </option>
        ))}
      </select>
    </div>
  );
}
