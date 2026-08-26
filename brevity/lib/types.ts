/** Shared API response types for Brevity. */

export type AuthUser = {
  id: string;
  email: string;
  username: string;
  display_name: string;
};

export type UserPublic = {
  id: string;
  username: string;
  display_name: string;
  bio: string;
  avatar_url: string | null;
  post_count: number;
  follower_count: number;
  following_count: number;
  created_at: string;
  is_following?: boolean | null;
};

export type UserMe = UserPublic & {
  email: string;
};

export type PostAuthor = {
  username: string;
  display_name: string;
};

export type Post = {
  id: string;
  author: PostAuthor;
  content: string;
  is_mention: boolean;
  like_count: number;
  liked_by_me: boolean;
  created_at: string;
};

export type LoginResponse = {
  token: string;
  user: AuthUser;
};

export type RegisterResponse = {
  id: string;
  email: string;
  username: string;
  display_name: string;
  token: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function isAuthUser(value: unknown): value is AuthUser {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.email === "string" &&
    typeof value.username === "string" &&
    typeof value.display_name === "string"
  );
}

export function isPost(value: unknown): value is Post {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    isRecord(value.author) &&
    typeof value.author.username === "string" &&
    typeof value.author.display_name === "string" &&
    typeof value.content === "string" &&
    typeof value.is_mention === "boolean" &&
    typeof value.like_count === "number" &&
    typeof value.liked_by_me === "boolean" &&
    typeof value.created_at === "string"
  );
}

export function isPostList(value: unknown): value is Post[] {
  return Array.isArray(value) && value.every(isPost);
}

export function isUserPublic(value: unknown): value is UserPublic {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.username === "string" &&
    typeof value.display_name === "string" &&
    typeof value.bio === "string" &&
    (value.avatar_url === null || typeof value.avatar_url === "string") &&
    typeof value.post_count === "number" &&
    typeof value.follower_count === "number" &&
    typeof value.following_count === "number" &&
    typeof value.created_at === "string" &&
    (value.is_following === undefined ||
      value.is_following === null ||
      typeof value.is_following === "boolean")
  );
}
