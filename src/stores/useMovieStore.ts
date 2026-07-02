import { create } from "zustand";
import {
  fetchGenres,
  fetchNowPlaying,
  fetchWatchlistMovies,
  searchMovies,
  setWatchlistItem,
} from "../services/tmdb";
import type { Movie } from "../types/movie";
import type { TmdbGenre } from "../types/tmdb";
import { useAuthStore } from "./useAuthStore";

type BrowseMode = "now_playing" | "search";

type MovieStore = {
  movies: Movie[];
  genres: TmdbGenre[];
  selectedGenreId: number | null;
  searchQuery: string;
  browseMode: BrowseMode;
  loading: boolean;
  error: string | null;
  watchlist: Movie[];
  watchlistLoading: boolean;
  watchlistMutating: boolean;
  watchlistError: string | null;
  initialize: () => Promise<void>;
  fetchNowPlaying: () => Promise<void>;
  submitSearch: (query: string) => Promise<void>;
  clearSearch: () => Promise<void>;
  setSelectedGenre: (genreId: number | null) => void;
  retry: () => Promise<void>;
  fetchWatchlist: () => Promise<void>;
  retryWatchlist: () => Promise<void>;
  clearWatchlist: () => void;
  addToWatchlist: (movieId: number) => Promise<void>;
  removeFromWatchlist: (movieId: number) => Promise<void>;
  toggleWatchlist: (movieId: number) => Promise<void>;
};

export const useMovieStore = create<MovieStore>((set, get) => ({
  movies: [],
  genres: [],
  selectedGenreId: null,
  searchQuery: "",
  browseMode: "now_playing",
  loading: false,
  error: null,
  watchlist: [],
  watchlistLoading: false,
  watchlistMutating: false,
  watchlistError: null,

  initialize: async () => {
    set({ loading: true, error: null });
    try {
      const genres = await fetchGenres();
      set({ genres });
      await get().fetchNowPlaying();
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : "Failed to load movies",
      });
    }
  },

  fetchNowPlaying: async () => {
    set({ loading: true, error: null, browseMode: "now_playing", searchQuery: "" });
    try {
      const movies = await fetchNowPlaying();
      set({ movies, loading: false });
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : "Failed to load movies",
      });
    }
  },

  submitSearch: async (query) => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      await get().clearSearch();
      return;
    }

    set({
      loading: true,
      error: null,
      browseMode: "search",
      searchQuery: trimmed,
    });

    try {
      const movies = await searchMovies(trimmed);
      set({ movies, loading: false });
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : "Search failed",
      });
    }
  },

  clearSearch: async () => {
    const { browseMode } = get();
    if (browseMode === "now_playing" && get().searchQuery === "") {
      return;
    }
    await get().fetchNowPlaying();
  },

  setSelectedGenre: (genreId) => set({ selectedGenreId: genreId }),

  retry: async () => {
    const { browseMode, searchQuery } = get();
    if (browseMode === "search" && searchQuery) {
      await get().submitSearch(searchQuery);
    } else {
      await get().fetchNowPlaying();
    }
  },

  fetchWatchlist: async () => {
    const { sessionId, accountId } = useAuthStore.getState();
    if (!sessionId || !accountId) {
      set({ watchlist: [], watchlistLoading: false, watchlistError: null });
      return;
    }

    set({ watchlistLoading: true, watchlistError: null });
    try {
      const watchlist = await fetchWatchlistMovies(accountId, sessionId);
      set({ watchlist, watchlistLoading: false });
    } catch (error) {
      set({
        watchlistLoading: false,
        watchlistError:
          error instanceof Error ? error.message : "Failed to load watchlist",
      });
    }
  },

  retryWatchlist: async () => {
    await get().fetchWatchlist();
  },

  clearWatchlist: () =>
    set({
      watchlist: [],
      watchlistLoading: false,
      watchlistMutating: false,
      watchlistError: null,
    }),

  addToWatchlist: async (movieId) => {
    const { sessionId, accountId } = useAuthStore.getState();
    if (!sessionId || !accountId) return;

    const { watchlist } = get();
    if (watchlist.some((movie) => movie.id === movieId)) return;

    set({ watchlistMutating: true, watchlistError: null });
    try {
      await setWatchlistItem(accountId, sessionId, movieId, true);
      await get().fetchWatchlist();
    } catch (error) {
      set({
        watchlistMutating: false,
        watchlistError:
          error instanceof Error ? error.message : "Failed to add to watchlist",
      });
      return;
    }
    set({ watchlistMutating: false });
  },

  removeFromWatchlist: async (movieId) => {
    const { sessionId, accountId } = useAuthStore.getState();
    if (!sessionId || !accountId) return;

    set({ watchlistMutating: true, watchlistError: null });
    try {
      await setWatchlistItem(accountId, sessionId, movieId, false);
      await get().fetchWatchlist();
    } catch (error) {
      set({
        watchlistMutating: false,
        watchlistError:
          error instanceof Error
            ? error.message
            : "Failed to remove from watchlist",
      });
      return;
    }
    set({ watchlistMutating: false });
  },

  toggleWatchlist: async (movieId) => {
    const { sessionId } = useAuthStore.getState();
    if (!sessionId) return;

    const { watchlist, addToWatchlist, removeFromWatchlist } = get();
    if (watchlist.some((movie) => movie.id === movieId)) {
      await removeFromWatchlist(movieId);
    } else {
      await addToWatchlist(movieId);
    }
  },
}));
