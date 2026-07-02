import type { Movie } from "../types/movie";
import type {
  TmdbGenre,
  TmdbGenreListResponse,
  TmdbMovieResult,
  TmdbPagedResponse,
} from "../types/tmdb";

const TMDB_BASE = "https://api.themoviedb.org/3";

function getToken(): string {
  const token = import.meta.env.VITE_TMDB_TOKEN;
  if (!token) {
    throw new Error(
      "Missing VITE_TMDB_TOKEN. Copy .env.example to .env and add your TMDB token.",
    );
  }
  return token;
}

async function tmdbFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${TMDB_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${getToken()}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`TMDB request failed (${response.status})`);
  }

  return response.json() as Promise<T>;
}

export function mapTmdbMovie(movie: TmdbMovieResult): Movie {
  return {
    id: movie.id,
    title: movie.title,
    posterPath: movie.poster_path,
    overview: movie.overview,
    releaseDate: movie.release_date,
    genreIds: movie.genre_ids ?? [],
    voteAverage: movie.vote_average,
  };
}

export async function fetchNowPlaying(): Promise<Movie[]> {
  const data = await tmdbFetch<TmdbPagedResponse<TmdbMovieResult>>(
    "/movie/now_playing?language=en-US&page=1",
  );
  return data.results.map(mapTmdbMovie);
}

export async function searchMovies(query: string): Promise<Movie[]> {
  const params = new URLSearchParams({
    query,
    language: "en-US",
    page: "1",
  });
  const data = await tmdbFetch<TmdbPagedResponse<TmdbMovieResult>>(
    `/search/movie?${params}`,
  );
  return data.results.map(mapTmdbMovie);
}

export async function fetchGenres(): Promise<TmdbGenre[]> {
  const data = await tmdbFetch<TmdbGenreListResponse>(
    "/genre/movie/list?language=en-US",
  );
  return data.genres;
}

export async function fetchWatchlistMovies(
  accountId: number,
  sessionId: string,
): Promise<Movie[]> {
  const params = new URLSearchParams({
    session_id: sessionId,
    language: "en-US",
    page: "1",
  });
  const data = await tmdbFetch<TmdbPagedResponse<TmdbMovieResult>>(
    `/account/${accountId}/watchlist/movies?${params}`,
  );
  return data.results.map(mapTmdbMovie);
}

export async function setWatchlistItem(
  accountId: number,
  sessionId: string,
  movieId: number,
  onWatchlist: boolean,
): Promise<void> {
  const params = new URLSearchParams({ session_id: sessionId });
  await tmdbFetch<{ success: boolean }>(
    `/account/${accountId}/watchlist?${params}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        media_type: "movie",
        media_id: movieId,
        watchlist: onWatchlist,
      }),
    },
  );
}
