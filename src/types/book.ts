export interface Book {
  id: number | null;
  title: string;
  author: string | null;
  cover: string | null;
  num_pages: number | null;
  year_published: number | null;
  isbn13: string | null;
  isbn10: string | null;
  is_awesome: boolean;
  have_read: boolean;
}

export interface BookCreate {
  title: string;
  author?: string | null;
  cover?: string | null;
  num_pages?: number | null;
  year_published?: number | null;
  isbn13?: string | null;
  isbn10?: string | null;
  is_awesome?: boolean;
  have_read?: boolean;
}

export interface BookUpdate {
  title?: string | null;
  author?: string | null;
  cover?: string | null;
  num_pages?: number | null;
  year_published?: number | null;
  isbn13?: string | null;
  isbn10?: string | null;
  is_awesome?: boolean | null;
  have_read?: boolean;
}

export interface BooksResponse {
  books: Book[];
  count: number;
}
