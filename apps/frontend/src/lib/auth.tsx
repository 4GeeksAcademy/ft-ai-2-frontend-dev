"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { apiClient, type LoginResponse, type User } from "./api";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AuthContextValue {
  /** The currently authenticated user, or `null` if not logged in. */
  user: User | null;
  /** The current JWT, or `null` if not logged in. */
  token: string | null;
  /** `true` when a user is authenticated (token + user are set). */
  isAuthenticated: boolean;
  /**
   * Authenticate with email + password.
   * Stores the token in memory (not localStorage — see spec).
   * Throws an `ApiError` on failure.
   */
  login: (email: string, password: string) => Promise<void>;
  /** Clear the session and redirect to `/`. */
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
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const isAuthenticated = user !== null && token !== null;

  const login = useCallback(async (email: string, password: string) => {
    const data = await apiClient<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    setToken(data.access_token);
    setUser(data.user);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, token, isAuthenticated, login, logout, setUser }),
    [user, token, isAuthenticated, login, logout, setUser],
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