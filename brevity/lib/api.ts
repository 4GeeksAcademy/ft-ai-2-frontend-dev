/**
 * API client — prepends NEXT_PUBLIC_API_URL and injects Authorization.
 */

import {
  isAuthUser,
  isPost,
  isPostList,
  isUserPublic,
  type AuthUser,
  type LoginResponse,
  type Post,
  type RegisterResponse,
  type UserMe,
  type UserPublic,
} from "@/lib/types";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

type ApiClientOptions = {
  token?: string;
  method?: string;
  body?: unknown;
};

function getBrowserApiUrl(): string {
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base) {
    throw new Error("NEXT_PUBLIC_API_URL is not set");
  }
  return base.replace(/\/$/, "");
}

/** Server-side fetch base (Compose DNS when available). */
export function getServerApiUrl(): string {
  const base =
    process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "";
  if (!base) {
    throw new Error("API_URL / NEXT_PUBLIC_API_URL is not set");
  }
  return base.replace(/\/$/, "");
}

async function readErrorDetail(response: Response): Promise<string> {
  const text = await response.text();
  if (!text) {
    return response.statusText || `HTTP ${response.status}`;
  }
  try {
    const data: unknown = JSON.parse(text);
    if (
      typeof data === "object" &&
      data !== null &&
      "detail" in data
    ) {
      const detail = (data as { detail: unknown }).detail;
      if (typeof detail === "string") {
        return detail;
      }
      if (Array.isArray(detail)) {
        return detail
          .map((item) => {
            if (
              typeof item === "object" &&
              item !== null &&
              "msg" in item &&
              typeof (item as { msg: unknown }).msg === "string"
            ) {
              return (item as { msg: string }).msg;
            }
            return JSON.stringify(item);
          })
          .join("; ");
      }
    }
  } catch {
    // fall through
  }
  return text;
}

export async function apiClient<T>(
  path: string,
  options: ApiClientOptions = {},
): Promise<T> {
  const headers: Record<string, string> = {
    Accept: "application/json",
  };
  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }
  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${getBrowserApiUrl()}${path}`, {
    method: options.method ?? (options.body !== undefined ? "POST" : "GET"),
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    throw new ApiError(response.status, await readErrorDetail(response));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export async function loginRequest(
  email: string,
  password: string,
): Promise<LoginResponse> {
  const data = await apiClient<LoginResponse>("/auth/login", {
    body: { email, password },
  });
  if (!data.token || !isAuthUser(data.user)) {
    throw new ApiError(500, "Invalid login response");
  }
  return data;
}

export async function registerRequest(
  email: string,
  username: string,
  password: string,
): Promise<RegisterResponse> {
  const data = await apiClient<RegisterResponse>("/auth/register", {
    body: { email, username, password },
  });
  if (!data.token || typeof data.username !== "string") {
    throw new ApiError(500, "Invalid register response");
  }
  return data;
}

export async function fetchTimeline(token: string): Promise<Post[]> {
  const data = await apiClient<unknown>("/posts/timeline", { token });
  if (!isPostList(data)) {
    throw new ApiError(500, "Invalid timeline response");
  }
  return data;
}

export async function createPost(
  token: string,
  content: string,
): Promise<Post> {
  const data = await apiClient<unknown>("/posts", {
    token,
    body: { content },
  });
  if (!isPost(data)) {
    throw new ApiError(500, "Invalid create-post response");
  }
  return data;
}

export async function fetchUserProfile(
  username: string,
  token?: string,
): Promise<UserPublic> {
  const data = await apiClient<unknown>(
    `/users/${encodeURIComponent(username)}`,
    { token },
  );
  if (!isUserPublic(data)) {
    throw new ApiError(500, "Invalid profile response");
  }
  return data;
}

export async function fetchUserPosts(
  username: string,
  token?: string,
): Promise<Post[]> {
  const data = await apiClient<unknown>(
    `/users/${encodeURIComponent(username)}/posts`,
    { token },
  );
  if (!isPostList(data)) {
    throw new ApiError(500, "Invalid user posts response");
  }
  return data;
}

export async function fetchMe(token: string): Promise<UserMe> {
  return apiClient<UserMe>("/users/me", { token });
}

export async function likePost(token: string, postId: string): Promise<void> {
  await apiClient(`/social/like/${postId}`, { token, method: "POST", body: {} });
}

export async function unlikePost(token: string, postId: string): Promise<void> {
  await apiClient(`/social/like/${postId}`, { token, method: "DELETE" });
}

export async function followUser(
  token: string,
  username: string,
): Promise<void> {
  await apiClient(`/social/follow/${encodeURIComponent(username)}`, {
    token,
    method: "POST",
    body: {},
  });
}

export async function unfollowUser(
  token: string,
  username: string,
): Promise<void> {
  await apiClient(`/social/follow/${encodeURIComponent(username)}`, {
    token,
    method: "DELETE",
  });
}

export function toAuthUser(user: {
  id: string;
  email: string;
  username: string;
  display_name: string;
}): AuthUser {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    display_name: user.display_name,
  };
}
