import type {
  Book,
  BookCreate,
  BookUpdate,
  BooksResponse,
} from "../types/book";

const API_BASE = "https://library.dotlag.space";

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error.detail?.[0]?.msg ?? `Request failed with status ${response.status}`,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  if (!text) {
    return undefined as T;
  }

  return JSON.parse(text) as T;
}

export async function fetchBooks(): Promise<BooksResponse> {
  const response = await fetch(`${API_BASE}/library`);
  return handleResponse<BooksResponse>(response);
}

export async function fetchBook(id: number): Promise<Book> {
  const response = await fetch(`${API_BASE}/library/${id}`);
  return handleResponse<Book>(response);
}

export async function createBook(data: BookCreate): Promise<Book> {
  const response = await fetch(`${API_BASE}/library/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<Book>(response);
}

export async function updateBook(id: number, data: BookUpdate): Promise<void> {
  const response = await fetch(`${API_BASE}/library/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  await handleResponse(response);
}

export async function deleteBook(id: number): Promise<void> {
  const response = await fetch(`${API_BASE}/library/${id}`, {
    method: "DELETE",
  });
  await handleResponse(response);
}
