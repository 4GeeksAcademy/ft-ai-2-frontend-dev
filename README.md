# ft-ai-2-frontend-dev

<!-- TOC:START -->
## Module Demonstrations

Each demonstration lives on its own branch:

- Providing Visual Specs To The AI: [module/specs-pt-1](https://github.com/4GeeksAcademy/ft-ai-2-frontend-dev/tree/module/specs-pt-1)
- Single Page Apps: [module/spa](https://github.com/4GeeksAcademy/ft-ai-2-frontend-dev/tree/module/spa)
- Structure: [module/structure](https://github.com/4GeeksAcademy/ft-ai-2-frontend-dev/tree/module/structure)
- Building An Application: [module/book_app](https://github.com/4GeeksAcademy/ft-ai-2-frontend-dev/tree/module/book_app)
- Making `fetch` requests: [module/restful_apis](https://github.com/4GeeksAcademy/ft-ai-2-frontend-dev/tree/module/restful_apis)
- Helping LLMs Understand APIs: [module/agents_and_apis](https://github.com/4GeeksAcademy/ft-ai-2-frontend-dev/tree/module/agents_and_apis)
- Server VS Client Components: [module/server_client_divide](https://github.com/4GeeksAcademy/ft-ai-2-frontend-dev/tree/module/server_client_divide)
<!-- TOC:END -->

## Movie Browser & the TMDB API

This repo includes a **Movie Browser** app (`npm run dev`) that talks to [The Movie Database (TMDB)](https://www.themoviedb.org/) API directly from the browser. All requests go to `https://api.themoviedb.org/3` with an `Authorization: Bearer` header.

### App token vs user session

TMDB uses two different ideas of “who is calling”:

1. **App read token** (`VITE_TMDB_TOKEN` in `.env`) — identifies your application. This is enough to browse public data: Now Playing movies, search results, and the genre list. Anyone can use the app for this without logging in.

2. **User session** (`session_id`) — identifies a logged-in TMDB user. You need this for account features like the watchlist. The read token is still sent on every request; the session tells TMDB *which* user's data to read or update.

### Browsing movies (no login required)

On load, the app calls:

- `GET /genre/movie/list` — populates the genre filter dropdown
- `GET /movie/now_playing` — fills the main results column

Search uses `GET /search/movie?query=...` (debounced in the UI, minimum 2 characters). Genre filtering happens client-side against the current result set.

Poster images are not returned as full URLs. TMDB gives a `poster_path` like `/abc123.jpg`; the app prepends `https://image.tmdb.org/t/p/w342` to build the image URL.

### Logging in

Watchlist features require a TMDB account. The login flow works like this:

1. App requests a temporary token: `GET /authentication/token/new`
2. User is redirected to `themoviedb.org/authenticate/{token}` to approve access
3. After approval, TMDB sends the user back to the app
4. App exchanges the token for a session: `POST /authentication/session/new`
5. App fetches account details: `GET /account?session_id=...` → `account_id` and `username`

`session_id`, `account_id`, and `username` are stored in `sessionStorage` so login survives a page refresh within the same tab.

### Watchlist sync

Once logged in, the watchlist column loads from:

- `GET /account/{account_id}/watchlist/movies?session_id=...`

Adding or removing a movie calls:

- `POST /account/{account_id}/watchlist?session_id=...`

with a JSON body like `{ "media_type": "movie", "media_id": 550, "watchlist": true }`. Set `watchlist` to `false` to remove. After each change, the app refetches the watchlist so the UI stays in sync with [themoviedb.org](https://www.themoviedb.org/).

### Where the code lives

- `src/services/tmdb.ts` — browse, search, genre, and watchlist API calls
- `src/services/auth.ts` — login redirect flow and session storage
- `src/stores/useMovieStore.ts` — movies, search, filters, watchlist state
- `src/stores/useAuthStore.ts` — login, logout, session restore

See `memory-bank/SPEC.md` for the full project spec and phased build plan.
