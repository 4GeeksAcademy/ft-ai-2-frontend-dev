export type TmdbMovieResult = {
  id: number;
  title: string;
  poster_path: string | null;
  overview: string;
  release_date: string;
  genre_ids: number[];
  vote_average: number;
};

export type TmdbPagedResponse<T> = {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
};

export type TmdbGenre = {
  id: number;
  name: string;
};

export type TmdbGenreListResponse = {
  genres: TmdbGenre[];
};
