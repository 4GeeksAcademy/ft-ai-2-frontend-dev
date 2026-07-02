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

export type TmdbRequestTokenResponse = {
  success: boolean;
  expires_at: string;
  request_token: string;
};

export type TmdbSessionResponse = {
  success: boolean;
  session_id: string;
};

export type TmdbAccount = {
  id: number;
  username: string;
  name: string;
};
