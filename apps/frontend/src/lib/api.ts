"use client";

export interface UserPublic {
  id: string;
  email: string;
  display_name: string | null;
  gravatar_url: string;
  is_active: boolean;
  role: "admin" | "manager" | "user";
}

export type User = UserPublic;

export interface ProfilePublic {
  id: string;
  user_id: string;
  name: string | null;
  phone: string | null;
  address: string | null;
}

export interface AuthMeResponse {
  id: string;
  email: string;
  role: "admin" | "manager" | "user";
  is_active: boolean;
  profile: ProfilePublic;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface ApiError {
  detail: string;
  error_code: string;
  status?: number;
}

type UnauthorizedHandler = () => void;

let unauthorizedHandler: UnauthorizedHandler | null = null;

export function setUnauthorizedHandler(handler: UnauthorizedHandler | null): void {
  unauthorizedHandler = handler;
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

    errorBody.status = response.status;

    if (response.status === 401 && (Boolean(token) || headers.has("Authorization"))) {
      unauthorizedHandler?.();
    }

    throw errorBody;
  }

  // 204 No Content (e.g., some DELETE responses)
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}