"use client";

export interface User {
  id: string;
  email: string;
  display_name: string;
  gravatar_url: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface ApiError {
  detail: string;
  error_code: string;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/**
 * Thin wrapper around `fetch` that:
 *  - prepends the API base URL
 *  - attaches the Authorization header when a token is given
 *  - parses JSON and throws structured errors on non-2xx responses
 */
export async function apiClient<T>(
  path: string,
  options: RequestInit & { token?: string } = {},
): Promise<T> {
  const { token, ...fetchOptions } = options;

  const headers = new Headers(fetchOptions.headers);

  if (!headers.has("Content-Type") && fetchOptions.body) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    let errorBody: ApiError;
    try {
      errorBody = await response.json();
    } catch {
      errorBody = {
        detail: `Request failed with status ${response.status}`,
        error_code: "UNKNOWN",
      };
    }
    throw errorBody;
  }

  // 204 No Content (e.g., some DELETE responses)
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}