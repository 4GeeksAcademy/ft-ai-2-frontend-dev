import { useEffect, useState } from "react";
import { AuthBar } from "./components/AuthBar";
import { FiltersPanel } from "./components/FiltersPanel";
import { MobileNav, type MobileSection } from "./components/MobileNav";
import { MovieResults } from "./components/MovieResults";
import { WatchlistPanel } from "./components/WatchlistPanel";
import { useAuthStore } from "./stores/useAuthStore";
import { useMovieStore } from "./stores/useMovieStore";

export default function App() {
  const initialize = useMovieStore((state) => state.initialize);
  const restoreSession = useAuthStore((state) => state.restoreSession);
  const handleAuthCallback = useAuthStore((state) => state.handleAuthCallback);
  const [mobileSection, setMobileSection] = useState<MobileSection>("results");

  useEffect(() => {
    void (async () => {
      restoreSession();
      await handleAuthCallback();
      void initialize();

      const { sessionId } = useAuthStore.getState();
      if (sessionId) {
        await useMovieStore.getState().fetchWatchlist();
      }
    })();
  }, [restoreSession, handleAuthCallback, initialize]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <header className="border-b border-slate-200 bg-white px-4 py-6 dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-2xl font-bold">Movie Browser</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Browse Now Playing and search TMDB
        </p>
        <AuthBar />
      </header>

      <MobileNav
        activeSection={mobileSection}
        onSectionChange={setMobileSection}
      />

      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-6 md:grid-cols-[240px_minmax(0,1fr)_280px] md:gap-8">
        <div
          className={`md:block ${mobileSection === "filters" ? "block" : "hidden"}`}
        >
          <FiltersPanel />
        </div>

        <div
          className={`md:block ${mobileSection === "results" ? "block" : "hidden"}`}
        >
          <MovieResults />
        </div>

        <div
          className={`md:block ${mobileSection === "watchlist" ? "block" : "hidden"}`}
        >
          <WatchlistPanel />
        </div>
      </main>
    </div>
  );
}
