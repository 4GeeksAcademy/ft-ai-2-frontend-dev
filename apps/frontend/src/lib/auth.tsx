"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  apiClient,
  setUnauthorizedHandler,
  type AuthMeResponse,
  type LoginResponse,
  type User,
} from "./api";

const TOKEN_STORAGE_KEY = "auth.jwt";
const USER_STORAGE_KEY = "auth.user";
const FALLBACK_GRAVATAR_URL = "https://www.gravatar.com/avatar/?d=identicon&s=200";

function readStoredUser(): User | null {
  const raw = localStorage.getItem(USER_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as User;
  } catch {
    localStorage.removeItem(USER_STORAGE_KEY);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AuthContextValue {
  /** The currently authenticated user, or `null` if not logged in. */
  user: User | null;
  /** The current JWT, or `null` if not logged in. */
  token: string | null;
  /** `true` while restoring/validating a persisted JWT on app startup. */
  isLoading: boolean;
  /** `true` when a user is authenticated (token + user are set). */
  isAuthenticated: boolean;
  /**
   * Authenticate with email + password.
  * Stores the token in localStorage and in-memory state.
   * Throws an `ApiError` on failure.
   */
  login: (email: string, password: string) => Promise<void>;
  /** Clear the session and redirect to `/login`. */
  logout: () => void;
  /** Update the user object in context (e.g. after profile edit). */
  setUser: (user: User) => void;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const AuthContext = createContext<AuthContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUserState] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const setUser = useCallback((nextUser: User) => {
    setUserState(nextUser);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser));
  }, []);

  const clearSession = useCallback(() => {
    setUserState(null);
    setToken(null);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
  }, []);

  const redirectToLogin = useCallback(() => {
    if (pathname !== "/login") {
      router.replace("/login");
    }
  }, [pathname, router]);

  const handleUnauthorized = useCallback(() => {
    clearSession();
    redirectToLogin();
  }, [clearSession, redirectToLogin]);

  const isAuthenticated = user !== null && token !== null;

  useEffect(() => {
    setUnauthorizedHandler(handleUnauthorized);
    return () => setUnauthorizedHandler(null);
  }, [handleUnauthorized]);

  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
      const storedUser = readStoredUser();

      if (!storedToken) {
        if (!cancelled) {
          setIsLoading(false);
        }
        return;
      }

      try {
        const me = await apiClient<AuthMeResponse>("/auth/me", {
          token: storedToken,
        });

        let nextUser: User | null =
          storedUser && storedUser.id === me.id ? storedUser : null;

        try {
          nextUser = await apiClient<User>(`/users/${me.id}`, { token: storedToken });
        } catch {
          // Fallback to cached user when `/users/:id` cannot be fetched.
        }

        if (!nextUser) {
          nextUser = {
            id: me.id,
            email: me.email,
            display_name: me.profile.name ?? me.email,
            gravatar_url: FALLBACK_GRAVATAR_URL,
            is_active: me.is_active,
            role: me.role,
          };
        }

        if (!cancelled) {
          setToken(storedToken);
          setUserState(nextUser);
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser));
        }
      } catch {
        if (!cancelled) {
          clearSession();
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void restoreSession();

    return () => {
      cancelled = true;
    };
  }, [clearSession]);

  const login = useCallback(async (email: string, password: string) => {
    const data = await apiClient<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    const normalizedUser: User = {
      ...data.user,
      display_name: data.user.display_name ?? data.user.email,
    };

    localStorage.setItem(TOKEN_STORAGE_KEY, data.access_token);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(normalizedUser));
    setToken(data.access_token);
    setUserState(normalizedUser);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    redirectToLogin();
  }, [clearSession, redirectToLogin]);

  const value = useMemo<AuthContextValue>(
    () => ({ user, token, isLoading, isAuthenticated, login, logout, setUser }),
    [user, token, isLoading, isAuthenticated, login, logout, setUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an <AuthProvider>");
  }
  return ctx;
}