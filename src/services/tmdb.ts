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

async function tmdbFetch<T>(path: string): Promise<T> {
  const response = await fetch(`${TMDB_BASE}${path}`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
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
