import type {
  TmdbAccount,
  TmdbRequestTokenResponse,
  TmdbSessionResponse,
} from "../types/tmdb";

const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_AUTH_URL = "https://www.themoviedb.org/authenticate";

export const SESSION_STORAGE_KEYS = {
  requestToken: "tmdb_request_token",
  loginPending: "tmdb_login_pending",
  sessionId: "tmdb_session_id",
  accountId: "tmdb_account_id",
  username: "tmdb_username",
} as const;

function getToken(): string {
  const token = import.meta.env.VITE_TMDB_TOKEN;
  if (!token) {
    throw new Error(
      "Missing VITE_TMDB_TOKEN. Copy .env.example to .env and add your TMDB token.",
    );
  }
  return token;
}

async function tmdbFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${TMDB_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`TMDB request failed (${response.status})`);
  }

  return response.json() as Promise<T>;
}

export function getAuthRedirectUrl(): string {
  return `${window.location.origin}${window.location.pathname}`;
}

export async function createRequestToken(): Promise<string> {
  const data = await tmdbFetch<TmdbRequestTokenResponse>(
    "/authentication/token/new",
  );
  return data.request_token;
}

export function redirectToTmdbApproval(requestToken: string): void {
  const redirectTo = encodeURIComponent(getAuthRedirectUrl());
  window.location.href = `${TMDB_AUTH_URL}/${requestToken}?redirect_to=${redirectTo}`;
}

export async function createSession(requestToken: string): Promise<string> {
  const data = await tmdbFetch<TmdbSessionResponse>(
    "/authentication/session/new",
    {
      method: "POST",
      body: JSON.stringify({ request_token: requestToken }),
    },
  );
  return data.session_id;
}

export async function fetchAccount(sessionId: string): Promise<TmdbAccount> {
  const params = new URLSearchParams({ session_id: sessionId });
  return tmdbFetch<TmdbAccount>(`/account?${params}`);
}

export function readStoredSession(): {
  sessionId: string;
  accountId: number;
  username: string;
} | null {
  const sessionId = sessionStorage.getItem(SESSION_STORAGE_KEYS.sessionId);
  const accountId = sessionStorage.getItem(SESSION_STORAGE_KEYS.accountId);
  const username = sessionStorage.getItem(SESSION_STORAGE_KEYS.username);

  if (!sessionId || !accountId || !username) {
    return null;
  }

  return {
    sessionId,
    accountId: Number(accountId),
    username,
  };
}

export function persistSession(
  sessionId: string,
  accountId: number,
  username: string,
): void {
  sessionStorage.setItem(SESSION_STORAGE_KEYS.sessionId, sessionId);
  sessionStorage.setItem(SESSION_STORAGE_KEYS.accountId, String(accountId));
  sessionStorage.setItem(SESSION_STORAGE_KEYS.username, username);
}

export function clearStoredSession(): void {
  sessionStorage.removeItem(SESSION_STORAGE_KEYS.requestToken);
  sessionStorage.removeItem(SESSION_STORAGE_KEYS.loginPending);
  sessionStorage.removeItem(SESSION_STORAGE_KEYS.sessionId);
  sessionStorage.removeItem(SESSION_STORAGE_KEYS.accountId);
  sessionStorage.removeItem(SESSION_STORAGE_KEYS.username);
}

export function clearAuthCallbackParams(): void {
  const url = new URL(window.location.href);
  url.searchParams.delete("approved");
  window.history.replaceState({}, "", url.pathname + url.search);
}
