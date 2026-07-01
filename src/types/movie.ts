export type Movie = {
  id: number;
  title: string;
  posterPath: string | null;
  overview: string;
  releaseDate: string;
  genreIds: number[];
  voteAverage: number;
};

export const TMDB_POSTER_BASE = "https://image.tmdb.org/t/p/w342";

export function posterUrl(posterPath: string | null): string | null {
  if (!posterPath) return null;
  return `${TMDB_POSTER_BASE}${posterPath}`;
}

export const GENRE_NAMES: Record<number, string> = {
  12: "Adventure",
  14: "Fantasy",
  16: "Animation",
  18: "Drama",
  27: "Horror",
  28: "Action",
  35: "Comedy",
  36: "History",
  53: "Thriller",
  80: "Crime",
  878: "Science Fiction",
  9648: "Mystery",
  10749: "Romance",
};

export function formatGenres(
  genreIds: number[],
  genreNames: Record<number, string> = GENRE_NAMES,
): string {
  return genreIds
    .map((id) => genreNames[id])
    .filter(Boolean)
    .join(", ");
}

export function buildGenreNameMap(
  genres: { id: number; name: string }[],
): Record<number, string> {
  return Object.fromEntries(genres.map((genre) => [genre.id, genre.name]));
}
