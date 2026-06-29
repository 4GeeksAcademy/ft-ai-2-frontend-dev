# Library App — Class Walkthrough

This document is a guided tour of the Library App for students. It explains **how
the app is put together** and **why** each piece exists, so you can read the code
with confidence and extend it yourself.

If you want the original requirements, see [SPEC.md](./SPEC.md).

---

## 1. What we are building

A single-page app for managing a collection of books that lives in a remote API.
From one screen you can:

- **Browse** every book in the library as a grid of cards.
- **Add** a new book with a create form.
- **Edit** an existing book by selecting its card.
- **Delete** a book, with a confirmation modal so you can back out.

Unlike a typical tutorial app, we own **none** of the data. Every book lives on
the [dotlag.space Library API](https://library.dotlag.space/openapi.json). Our
whole job is to talk to that API cleanly and present the results.

## 2. The tech stack

| Tool                | Role                                                                                   |
| ------------------- | -------------------------------------------------------------------------------------- |
| **Vite**            | Dev server and build tool. Fast startup, instant HMR.                                  |
| **React 19**        | UI library. The whole app is client-side components.                                   |
| **React Compiler**  | Auto-memoizes components so we don't hand-write `useMemo`/`useCallback` everywhere.    |
| **TypeScript**      | Types for safety and editor help, shared between the API layer and components.         |
| **Tailwind CSS v4** | Utility classes via `@apply`, organized into per-component CSS files using BEM naming. |
| **`fetch`**         | The browser's built-in HTTP client. No extra data library.                             |

## 3. Running the app

```bash
npm install
npm run dev       # http://localhost:5173
```

Useful scripts:

- `npm run dev` — start the dev server with hot reloading.
- `npm run build` — production build (also type-checks the whole project).
- `npm run preview` — serve the production build locally.
- `npm run lint` — run the linter.

---

## 4. Project structure

Everything lives under `src/`. A standard Vite React app, with the component
convention from the spec layered on top.

```
src/
  main.tsx                  # Entry point: mounts <App /> into the page
  App.tsx                   # The single page: owns state and wires everything together
  App.css                   # Page-level layout styles
  index.css                 # Tailwind import + base body styles
  api/
    library.ts              # All talking to the Library API lives here
  types/
    book.ts                 # Book, BookCreate, BookUpdate, BooksResponse
  components/               # One folder per component (TSX + matching CSS)
    bookCard/
      BookCard.tsx
      BookCard.css
    bookCreateForm/
      BookCreateForm.tsx
      BookCreateForm.css
    bookUpdateForm/
      BookUpdateForm.tsx
      BookUpdateForm.css
    bookDeleteForm/
      BookDeleteForm.tsx
      DeleteConfirmModal.tsx    # The "are you sure?" modal
      BookDeleteForm.css
      DeleteConfirmModal.css
```

### The component convention

Each component gets its own folder containing the component and its styles:

```
components/bookCard/
  BookCard.tsx
  BookCard.css
```

Variants live in their own files (e.g. a horizontal card layout would be
`BookCardHorizontal.tsx` next to `BookCard.tsx`).

---

## 5. The big idea: one owner of state

This is a **single-page app**, so there is no router and no server rendering.
The most important concept is **who owns the data**.

`App.tsx` is the single source of truth. It holds:

- `books` — the list fetched from the API.
- `selectedBook` — the card you clicked (drives the edit and delete panels).
- `loading` / `error` — so the UI can show progress and problems.

Every child component is **"dumb"**: it receives data and callbacks as props and
never fetches on its own. The pattern we use everywhere:

> **Fetch and store data in `App`, pass it down as props, and let children call
> back up when the user does something.**

For example, a card doesn't know how to select itself — it just calls the
`onSelect` prop and lets `App` decide what that means:

```tsx
// src/App.tsx
<BookCard
  book={book}
  selected={selectedBook?.id === book.id}
  onSelect={setSelectedBook}
/>
```

---

## 6. The data layer (`src/api/library.ts`)

All network access is centralized here so components never call `fetch`
directly. Each function maps to one endpoint on the Library API:

| Function               | HTTP call              | Purpose                |
| ---------------------- | ---------------------- | ---------------------- |
| `fetchBooks()`         | `GET /library`         | Get the whole library. |
| `fetchBook(id)`        | `GET /library/{id}`    | Get a single book.     |
| `createBook(data)`     | `POST /library/add`    | Add a new book.        |
| `updateBook(id, data)` | `PATCH /library/{id}`  | Edit an existing book. |
| `deleteBook(id)`       | `DELETE /library/{id}` | Remove a book.         |

### One shared response handler

Every function routes its `Response` through a single helper, `handleResponse`.
Centralizing this means error handling and JSON parsing are written **once**:

```ts
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error.detail?.[0]?.msg ?? `Request failed with status ${response.status}`,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  if (!text) {
    return undefined as T;
  }

  return JSON.parse(text) as T;
}
```

Two things worth calling out:

- **Errors become exceptions.** A non-`2xx` response throws, so callers can use a
  plain `try/catch` instead of checking `response.ok` everywhere. We dig the
  validation message out of the API's `detail` array when it's there.
- **Empty bodies are handled.** `DELETE` returns `204 No Content` with **no
  body**. Calling `response.json()` on an empty body throws
  `Unexpected end of JSON input`, so we check for `204` and empty text first and
  return `undefined` instead of parsing.

### Why a `types/book.ts` file?

The API's OpenAPI schema defines three shapes, and we mirror them as TypeScript
interfaces so the compiler can catch mistakes:

- **`Book`** — a full book as it comes back from the API (every field, plus `id`).
- **`BookCreate`** — what you send to create one (`title` required, the rest
  optional).
- **`BookUpdate`** — what you send to edit one (every field optional).

Keeping create/update separate from `Book` is intentional: you can't send an
`id` when creating, and you shouldn't be forced to resend every field when
editing.

---

## 7. Reading and writing data

### Reading

`App` loads the library once on mount and re-loads it after any change. The
fetch logic is wrapped so it can be called again later:

```tsx
// src/App.tsx
const loadBooks = useCallback(async () => {
  setError(null);
  setLoading(true);
  try {
    const response = await fetchBooks();
    setBooks(response.books);
  } catch (err) {
    setError(err instanceof Error ? err.message : "Failed to load library");
  } finally {
    setLoading(false);
  }
}, []);

useEffect(() => {
  loadBooks();
}, [loadBooks]);
```

### Writing

Mutations follow the same rhythm: **call the API, then re-load the list so the UI
reflects the server's truth.**

```tsx
// src/App.tsx
async function handleCreate(data: BookCreate) {
  const created = await createBook(data);
  await loadBooks();
  setSelectedBook(created);
}

async function handleDelete(id: number) {
  await deleteBook(id);
  setSelectedBook(null); // nothing is selected after a delete
  await loadBooks();
}
```

Re-fetching after a write is the simplest way to stay in sync. It costs an extra
request, but it guarantees the screen matches the database without us having to
carefully patch local state by hand.

---

## 8. Feature walkthrough: deleting a book

Let's trace one feature end to end. This ties together everything above and
shows why the confirmation modal exists.

1. **You click a card.** `BookCard` calls `onSelect(book)`, and `App` stores it
   in `selectedBook`. The edit and delete panels in the sidebar light up.
2. **You click "Delete Book".** `BookDeleteForm` opens the `DeleteConfirmModal`
   by flipping its own `modalOpen` state. Nothing has been sent yet — this is
   your chance to back out.
3. **You confirm.** The modal's confirm button calls `handleConfirm`, which calls
   the `onDelete` prop. That prop is `App`'s `handleDelete`.
4. **The API call happens.** `handleDelete` calls `deleteBook(id)`, which sends
   `DELETE /library/{id}`. The API replies `204 No Content` — our response
   handler sees the empty body and resolves cleanly instead of choking on JSON.
5. **The UI refreshes.** `App` clears `selectedBook` and re-runs `loadBooks()`,
   so the deleted card disappears from the grid.
6. **Errors stay local.** If the delete fails, `BookDeleteForm` catches the
   thrown error and shows it **inside the modal**, so you keep your place and can
   retry.

Creating and editing follow the same shape: a form gathers input, calls a prop
that hits the API, and `App` re-loads the list afterward.

---

## 9. Styling approach

The spec asks for **Tailwind with BEM, CSS nesting, and `@apply`** — clean,
readable CSS rather than a wall of utility classes in the JSX.

- Each component imports its own CSS file (e.g. `BookCard.css`).
- Class names follow **BEM**: `block`, `block__element`, `block--modifier`
  (e.g. `.book-card`, `.book-card__title`, `.book-card--selected`).
- Styles are composed from Tailwind utilities with `@apply`:

```css
/* src/components/bookCard/BookCard.css */
@reference "tailwindcss";

.book-card {
  @apply flex flex-col overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm;

  &:hover {
    @apply shadow-md;
  }
}

.book-card--selected {
  @apply border-amber-400 ring-2 ring-amber-200;
}
```

> **Gotcha — native CSS nesting is not Sass.** You can nest a real selector like
> `&:hover`, but you **cannot** glue text onto `&` to build a class name
> (`&__title`, `&--selected`). That's a Sass-only trick, and the build tool
> silently drops those rules, leaving the page unstyled. Write BEM element and
> modifier names out as full classes (`.book-card__title { ... }`), and reserve
> `&` for genuine nested selectors like `&:hover`, `&:focus`, and `&:disabled`.

Two more notes:

- `@reference "tailwindcss";` at the top of each component CSS file lets `@apply`
  resolve Tailwind's utilities in that file.
- `index.css` imports Tailwind once and sets base `body` styles for the whole
  app.

---

## 10. Try it yourself

Good exercises to deepen your understanding:

1. **Show a detail view.** Use `fetchBook(id)` to open a full-page or modal view
   of a single book when its card is clicked.
2. **Filter and sort.** Add a search box and an A–Z / Z–A sort over the `books`
   array in `App`, handled in the browser for instant feedback.
3. **Optimistic updates.** Instead of re-fetching after every change, update the
   local `books` array immediately and only re-sync on error.
4. **Validate input.** Reject obviously bad ISBNs or negative page counts in the
   create form and show the error inline.
5. **Add a "have read" toggle** directly on each card that calls `updateBook`
   without opening the edit form.

For each change, follow the project's rhythm: make one focused change, run
`npm run lint` and `npm run build`, then check it in the browser.
