import { useEffect, useState } from "react";
import { useMovieStore } from "../stores/useMovieStore";

const DEBOUNCE_MS = 300;
const MIN_SEARCH_LENGTH = 2;

export function SearchBar() {
  const submitSearch = useMovieStore((state) => state.submitSearch);
  const clearSearch = useMovieStore((state) => state.clearSearch);
  const searchQuery = useMovieStore((state) => state.searchQuery);
  const [input, setInput] = useState(searchQuery);

  useEffect(() => {
    setInput(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const trimmed = input.trim();
      if (trimmed.length >= MIN_SEARCH_LENGTH) {
        void submitSearch(trimmed);
      } else if (trimmed.length === 0) {
        void clearSearch();
      }
    }, DEBOUNCE_MS);

    return () => window.clearTimeout(timeout);
  }, [input, submitSearch, clearSearch]);

  return (
    <div>
      <label htmlFor="movie-search" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
        Search movies
      </label>
      <input
        id="movie-search"
        type="search"
        value={input}
        onChange={(event) => setInput(event.target.value)}
        placeholder="Search by title…"
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-slate-500 dark:focus:ring-slate-700"
      />
      {input.trim().length === 1 && (
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Type at least 2 characters to search.</p>
      )}
    </div>
  );
}
