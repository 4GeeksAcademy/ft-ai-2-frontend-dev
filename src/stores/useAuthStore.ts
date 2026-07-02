import { create } from "zustand";
import {
  clearAuthCallbackParams,
  clearStoredSession,
  createRequestToken,
  createSession,
  fetchAccount,
  persistSession,
  readStoredSession,
  redirectToTmdbApproval,
  SESSION_STORAGE_KEYS,
} from "../services/auth";
import { useMovieStore } from "./useMovieStore";

type AuthStore = {
  sessionId: string | null;
  accountId: number | null;
  username: string | null;
  authLoading: boolean;
  authError: string | null;
  restoreSession: () => void;
  handleAuthCallback: () => Promise<void>;
  startLogin: () => Promise<void>;
  logout: () => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
  sessionId: null,
  accountId: null,
  username: null,
  authLoading: false,
  authError: null,

  restoreSession: () => {
    const stored = readStoredSession();
    if (stored) {
      set({
        sessionId: stored.sessionId,
        accountId: stored.accountId,
        username: stored.username,
        authError: null,
      });
    }
  },

  handleAuthCallback: async () => {
    const params = new URLSearchParams(window.location.search);
    const approved = params.get("approved");
    const loginPending = sessionStorage.getItem(
      SESSION_STORAGE_KEYS.loginPending,
    );
    const requestToken = sessionStorage.getItem(
      SESSION_STORAGE_KEYS.requestToken,
    );

    if (approved !== null) {
      clearAuthCallbackParams();
    }

    if (approved === "false") {
      sessionStorage.removeItem(SESSION_STORAGE_KEYS.requestToken);
      sessionStorage.removeItem(SESSION_STORAGE_KEYS.loginPending);
      set({
        authError: "TMDB login was not approved.",
        authLoading: false,
      });
      return;
    }

    if (!loginPending || !requestToken) {
      return;
    }

    set({ authLoading: true, authError: null });

    try {
      const sessionId = await createSession(requestToken);
      const account = await fetchAccount(sessionId);

      sessionStorage.removeItem(SESSION_STORAGE_KEYS.requestToken);
      sessionStorage.removeItem(SESSION_STORAGE_KEYS.loginPending);
      persistSession(sessionId, account.id, account.username);

      set({
        sessionId,
        accountId: account.id,
        username: account.username,
        authLoading: false,
        authError: null,
      });
    } catch (error) {
      sessionStorage.removeItem(SESSION_STORAGE_KEYS.requestToken);
      sessionStorage.removeItem(SESSION_STORAGE_KEYS.loginPending);
      set({
        authLoading: false,
        authError:
          error instanceof Error ? error.message : "Failed to complete login",
      });
    }
  },

  startLogin: async () => {
    set({ authLoading: true, authError: null });

    try {
      const requestToken = await createRequestToken();
      sessionStorage.setItem(SESSION_STORAGE_KEYS.requestToken, requestToken);
      sessionStorage.setItem(SESSION_STORAGE_KEYS.loginPending, "1");
      redirectToTmdbApproval(requestToken);
    } catch (error) {
      set({
        authLoading: false,
        authError: error instanceof Error ? error.message : "Failed to start login",
      });
    }
  },

  logout: () => {
    clearStoredSession();
    useMovieStore.getState().clearWatchlist();
    set({
      sessionId: null,
      accountId: null,
      username: null,
      authLoading: false,
      authError: null,
    });
  },
}));

export function useIsAuthenticated(): boolean {
  return useAuthStore((state) => state.sessionId !== null);
}
