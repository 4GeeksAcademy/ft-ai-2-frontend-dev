# Movie Browser App

A minimal application for browsing the TMDB API and managing your TMDB account watchlist.

## Implementation Status

| Phase | Status | Notes |
|-------|--------|-------|
| Phase 1 | **Complete** | Placeholder UI, components, in-memory watchlist |
| Phase 2a | **Complete** | TMDB browse/search, layout, loading & error states |
| Phase 2b | **Complete** | TMDB login redirect, session persistence, auth UI |
| Phase 2c | **Complete** | TMDB watchlist API sync |

**Also implemented (not originally phased):** dark mode via system `prefers-color-scheme` preference.

**Current watchlist behavior:** Synced with the TMDB account watchlist API. Fetched on login and page refresh; add/remove calls the account watchlist endpoint and refetches.

## Prerequisites

- Node.js 18+
- Basic familiarity with React (components, props, state)
- A [TMDB](https://www.themoviedb.org/) account and API read token (Bearer token)

## Tech Stack

- React on Vite using TypeScript
- Tailwind CSS v4 for styling (including `dark:` variants)
- Zustand stores for global application state
- TMDB API for data

## Environment Setup

- Store the read token in `.env` as `VITE_TMDB_TOKEN` (Vite only exposes variables prefixed with `VITE_`)
- Copy `.env.example` to `.env` and replace the placeholder with your token
- Never commit `.env`; `.env.example` uses a placeholder only

All API requests include `Authorization: Bearer <VITE_TMDB_TOKEN>`.

## Data Model

Use a minimal `Movie` type shared across components and the Zustand store:

```ts
type Movie = {
  id: number;
  title: string;
  posterPath: string | null;
  overview: string;
  releaseDate: string;
  genreIds: number[];
  voteAverage: number;
};
```

Poster images use TMDB's image base URL:

```
https://image.tmdb.org/t/p/w342{poster_path}
```

Omit or use a placeholder when `poster_path` is null.

Genre names come from `GET /genre/movie/list`. Map `genreIds` to names for display.

## TMDB Endpoints

Reference docs live in `memory-bank/tmdb-api-docs/`.

### Browse & search (read token only)

| Feature       | Endpoint                    |
|---------------|-----------------------------|
| Initial load  | `GET /movie/now_playing`    |
| Search        | `GET /search/movie`         |
| Genre list    | `GET /genre/movie/list`     |

Use the first page of results only (no pagination in v1).

### Watchlist (user session required)

| Action              | Endpoint                                              |
|---------------------|-------------------------------------------------------|
| List watchlist      | `GET /account/{account_id}/watchlist/movies`        |
| Add / remove movie  | `POST /account/{account_id}/watchlist?session_id=...` |

Add/remove request body:

```json
{
  "media_type": "movie",
  "media_id": 550,
  "watchlist": true
}
```

Set `watchlist` to `false` to remove a movie.

## Authentication

Watchlist features require a TMDB **user session**, not just the read token. The read token identifies your app; the session identifies the logged-in user.

### Login flow

1. `GET /authentication/token/new` → `request_token`
2. Redirect the user to `https://www.themoviedb.org/authenticate/{request_token}?redirect_to={app_url}`
3. After the user approves, `POST /authentication/session/new` with `{ "request_token": "..." }` → `session_id`
4. `GET /account?session_id=...` → `account_id` and `username`

A `tmdb_login_pending` flag in `sessionStorage` tracks in-progress logins across the redirect.

### Session storage

- Persist `session_id` and `account_id` in `sessionStorage` (survives refresh within the same tab; cleared when the tab closes)
- On app load, restore the session if present and fetch the watchlist
- Provide a **Log in with TMDB** action when no session exists
- Provide a **Log out** action that clears session state and empties the cached watchlist

### Logged-out behavior

- Browse and search work without a session
- The watchlist column shows a prompt to log in
- `WatchlistButton` on movie cards is disabled (or prompts login) when logged out

## Search & Filters

**Search**

- Query `GET /search/movie` with the user's input
- Debounce input (~300ms) before calling the API
- Minimum 2 characters before searching
- Show a "no results" message when the API returns an empty list

**Filters**

- Genre filter only in v1: dropdown populated from `GET /genre/movie/list`
- Filtering applies to the current results list (Now Playing or search results) by matching `genre_ids`
- Clearing the filter restores the unfiltered list

Search and genre filter can be used together.

## Layout

**Mobile** (`< 768px`): single-column layout with an expanding menu at the top of the page. Sections (search/filters, results, watchlist) are reachable via the menu.

**Desktop** (`≥ 768px`): 3-column layout:

- **Left:** filters and search
- **Middle:** results. On initial load, display Now Playing movies
- **Right:** watchlist (login required; shows login prompt when logged out)

Use Tailwind's `md:` breakpoint for the desktop layout.

### Theming

- Dark mode follows the browser/OS `prefers-color-scheme` setting (no manual toggle)
- Tailwind `dark:` variant configured via `@custom-variant dark (@media (prefers-color-scheme: dark))`
- `color-scheme: light dark` on `html` so native form controls respect system theme

### Components

**Core (Phase 1)**

- `MovieCard`: Horizontal card with poster on the left and details on the right. `WatchlistButton` in the top-right corner.
- `MovieCardSmall`: Compact card for the watchlist column — poster, title, genre, and a remove button only.
- `WatchlistButton`: Toggles add/remove. Shows `+` when the movie is not on the watchlist, `−` when it is. Disabled when logged out.

**Layout & browse (Phase 2a)**

- `FiltersPanel`: Wraps search and genre filter controls
- `SearchBar`: Debounced search input (local state; submits to store after 300ms)
- `GenreFilter`: Genre dropdown populated from TMDB
- `MovieResults`: Results list with loading skeletons, error/retry, and empty states
- `WatchlistPanel`: Watchlist column; login prompt when logged out, list when logged in
- `MobileNav`: Expanding top menu for switching sections on mobile

**Authentication (Phase 2b)**

- `AuthBar`: Header login/logout controls and signed-in username display

### UI states

- **Loading:** skeleton or spinner while fetching movies, search results, or watchlist
- **Error:** user-visible message when an API call fails (optional retry button)
- **Empty watchlist:** message when logged in but watchlist is empty
- **No search results:** message when search returns nothing

### Accessibility

- Poster `alt` text = movie title
- `WatchlistButton` uses `aria-label` ("Add to watchlist" / "Remove from watchlist")
- All interactive controls are keyboard-focusable

## State Ownership

**Zustand (global)** — `useMovieStore`

- Movies list (Now Playing or search results)
- Genre list and active genre filter
- Loading and error flags
- `searchQuery`, `browseMode` (`now_playing` | `search`)
- `watchlist`: full `Movie` objects fetched from TMDB
- `watchlistLoading`, `watchlistMutating`, `watchlistError`

**Zustand (global)** — `useAuthStore`

- `sessionId`, `accountId`, `username`
- `authLoading`, `authError`
- Login, logout, session restore, and post-redirect callback handling

**Component-local**

- Search input value (debounced before updating global query)
- Mobile menu open/closed and active section

**Zustand selector rule:** Selectors must return stable references (primitives or store state directly). Never return a newly allocated array/object from a selector — use `useMemo` in the component instead.

## Folder Structure

```
src/
  components/
    MovieCard.tsx
    MovieCardSmall.tsx
    WatchlistButton.tsx
    AuthBar.tsx
    FiltersPanel.tsx
    SearchBar.tsx
    GenreFilter.tsx
    MovieResults.tsx
    WatchlistPanel.tsx
    MobileNav.tsx
  stores/
    useMovieStore.ts
    useAuthStore.ts
  services/
    tmdb.ts
    auth.ts
  types/
    movie.ts
    tmdb.ts
  data/
    placeholderMovies.ts   # Phase 1 sample data (retained for reference)
```

## Non-Goals (v1)

- No routing or movie detail pages
- No pagination or infinite scroll
- TV shows (movies only)
- Custom TMDB lists (`/list` endpoints)
- User accounts beyond TMDB's built-in session login
- Automated tests (optional extension)

## Project Phases

### Phase 1: UI with placeholder data ✅

**Goal:** Learn component composition, props, TypeScript interfaces, and Zustand without API complexity.

- Placeholder `Movie` data in a Zustand store
- Build `MovieCard`, `MovieCardSmall`, and `WatchlistButton`
- Watchlist add/remove works in memory (local Zustand state only)

**Acceptance criteria**

- [x] Placeholder movies render in `MovieCard`
- [x] Watchlist add/remove updates Zustand state
- [x] `WatchlistButton` shows `+` or `−` based on watchlist membership
- [x] `MovieCardSmall` renders in a watchlist section with remove working

### Phase 2a: Layout and browse API ✅

**Goal:** Responsive layout and read-only TMDB integration.

- Desktop 3-column / mobile single-column layout
- Fetch and display Now Playing on initial load
- Search with debounce
- Genre filter
- Loading and error states

**Acceptance criteria**

- [x] Layout switches at the `md` breakpoint
- [x] Now Playing movies load on first visit
- [x] Search returns results; empty state shown when none
- [x] Genre filter narrows the visible results

### Phase 2b: TMDB authentication ✅

**Goal:** Understand user-level API access vs app-level read tokens.

- Implement the TMDB login redirect flow
- Store and restore `session_id` and `account_id`
- Log in / log out UI

**Acceptance criteria**

- [x] User can log in via TMDB and return to the app with an active session
- [x] Session persists across page refresh (same tab)
- [x] Log out clears session and watchlist cache

### Phase 2c: Watchlist API integration ✅

**Goal:** Mutate server state and keep the UI in sync.

- Fetch watchlist on login
- `WatchlistButton` calls add/remove endpoints
- Right column shows watchlist via `MovieCardSmall`
- Disable watchlist actions when logged out

**Acceptance criteria**

- [x] Watchlist loads after login
- [x] Add/remove syncs with TMDB and updates the UI
- [x] Watchlist column shows login prompt when logged out
- [x] Changes appear on [themoviedb.org](https://www.themoviedb.org/) when viewing the same account

## Extension Ideas

- Movie detail modal on card click
- Sort watchlist by title or date added
- Manual dark mode toggle (currently system-preference only)
- `localStorage` fallback for offline demo (explicitly separate from TMDB sync)

## Common Pitfalls

- **Poster images:** TMDB returns `poster_path` as a relative path; prepend the image base URL
- **401 errors:** Check `VITE_TMDB_TOKEN` and the `Authorization: Bearer` header
- **Watchlist 401:** Session may have expired; prompt the user to log in again
- **Env vars:** Must be prefixed with `VITE_` to be available in the browser bundle
- **CORS:** TMDB allows browser requests; no proxy needed for this project
- **Zustand selectors:** Returning a new array/object from a selector (e.g. `.map()` or a getter that allocates) causes infinite re-renders. Select primitives or stable store references; derive computed lists with `useMemo`
- **Auth redirect:** Store `request_token` and a `login_pending` flag before redirecting to TMDB; complete the session exchange on return, not on every page load
