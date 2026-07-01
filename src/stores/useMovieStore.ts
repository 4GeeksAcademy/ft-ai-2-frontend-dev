import { create } from "zustand";
import {
  fetchGenres,
  fetchNowPlaying,
  searchMovies,
} from "../services/tmdb";
import type { Movie } from "../types/movie";
import type { TmdbGenre } from "../types/tmdb";

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
  initialize: () => Promise<void>;
  fetchNowPlaying: () => Promise<void>;
  submitSearch: (query: string) => Promise<void>;
  clearSearch: () => Promise<void>;
  setSelectedGenre: (genreId: number | null) => void;
  retry: () => Promise<void>;
  addToWatchlist: (movieId: number) => void;
  removeFromWatchlist: (movieId: number) => void;
  toggleWatchlist: (movieId: number) => void;
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

  addToWatchlist: (movieId) =>
    set((state) => {
      if (state.watchlist.some((movie) => movie.id === movieId)) {
        return state;
      }
      const movie = state.movies.find((item) => item.id === movieId);
      if (!movie) return state;
      return { watchlist: [...state.watchlist, movie] };
    }),

  removeFromWatchlist: (movieId) =>
    set((state) => ({
      watchlist: state.watchlist.filter((movie) => movie.id !== movieId),
    })),

  toggleWatchlist: (movieId) => {
    const { watchlist, addToWatchlist, removeFromWatchlist } = get();
    if (watchlist.some((movie) => movie.id === movieId)) {
      removeFromWatchlist(movieId);
    } else {
      addToWatchlist(movieId);
    }
  },
}));
