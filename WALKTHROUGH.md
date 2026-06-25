# Book App — Class Walkthrough

This document is a guided tour of the Book App for students. It explains **how
the app is put together** and **why** each piece exists, so you can read the
code with confidence and extend it yourself.

If you want the original requirements, see [SPEC.md](./SPEC.md). For the
step-by-step build order, see the **Devlog** in [README.md](./README.md).

---

## 1. What we are building

Book App tracks the books you own and the friends you loan them to:

- A **dashboard** showing what is currently on loan and what is overdue.
- A **library** of books you can search, sort, add to, and loan out.
- A list of **friends** you can search, sort, and add to.
- A full **borrowing history** for every book and every friend.

## 2. The tech stack

| Tool | Role |
| --- | --- |
| **Next.js (App Router)** | React framework. Handles routing, server rendering, and server actions. |
| **React 19** | UI library. We use both Server and Client Components. |
| **TypeScript** | Types for safety and editor help. |
| **Tailwind CSS** | Utility classes for layout/spacing, plus small per-component CSS files. |
| **libSQL** (SQLite) | Local database file for long-term storage. |

## 3. Running the app

```bash
npm install
npm run db:init   # create + seed the local database (optional; also runs on demand)
npm run dev       # http://localhost:3000
```

Useful scripts:

- `npm run dev` — start the dev server.
- `npm run build` — production build (also type-checks the whole project).
- `npm run lint` — run ESLint.
- `npm run db:init` — create and seed `data/book-app.db`.

---

## 4. Project structure

Everything lives under `src/`. The import alias `@/*` maps to `src/*`, so
`@/db` means `src/db`.

```
src/
  app/                      # App Router: each folder is a URL segment
    layout.tsx              # Root layout (wraps every page, renders the Header)
    page.tsx                # "/"            -> dashboard
    library/
      page.tsx              # "/library"     -> book list
      [id]/page.tsx         # "/library/123" -> one book
      [id]/actions.ts       # server actions: loan + return
      create_book/          # "/library/create_book"
    friends/
      page.tsx              # "/friends"     -> friend list
      [id]/page.tsx         # "/friends/123" -> one friend
      create_friend/        # "/friends/create_friend"
  components/               # One folder per component (Tsx + matching Css)
    header/  loan_panel/  loan_form/  loan_history/  ...
  db/                       # Database client, schema, and query helpers
  types.d.ts                # Global types: Friend, Book, Loan
```

### The component convention

Each component gets its own folder containing the component and its styles:

```
components/loan_panel/
  LoanPanel.tsx
  LoanPanel.css
```

Variants live in their own files (e.g. a horizontal card would be
`CardHorizontal.tsx` next to `Card.tsx`).

---

## 5. The big idea: Server vs Client Components

This is the most important concept in the app.

- **Server Components** (the default in the App Router) run on the server. They
  can `await` data directly from the database. They cannot use browser features
  like `useState` or `onClick`.
- **Client Components** run in the browser. They start with the
  `"use client";` directive and can use state and event handlers.

The pattern we use everywhere:

> **Fetch data in a Server Component, then hand it to a small Client Component
> only when we need interactivity.**

Example — the library page fetches books on the server and passes them to a
client list that does the searching/sorting in the browser:

```tsx
// src/app/library/page.tsx  (Server Component)
const books = await getAllBooks();
return <LibraryList books={books} />;
```

```tsx
// src/components/library_list/LibraryList.tsx  (Client Component)
"use client";
const [query, setQuery] = useState("");
// ...filter + sort books in the browser
```

---

## 6. The data layer (`src/db/`)

All database access is centralized here so pages never write SQL directly.

| File | Responsibility |
| --- | --- |
| `client.ts` | Creates one shared libSQL client (a local file at `data/book-app.db`). |
| `schema.ts` | `CREATE TABLE` statements for `friends`, `books`, `loans`. |
| `init.ts` | Lazily creates tables and seeds demo data the first time it's needed. |
| `rows.ts` | Raw row shapes returned straight from SQLite. |
| `mappers.ts` | Convert raw rows into the app's `Friend` / `Book` / `Loan` types. |
| `friends.ts` / `books.ts` / `loans.ts` | Query + mutation helpers. |
| `index.ts` | Re-exports everything so pages can `import { ... } from "@/db"`. |

### The three tables

```sql
friends(id, name, phone_number, email)
books(id, title, description, cover_img)
loans(id, book_id, friend_id, borrow_date, returned_date)
```

A **loan** links a book to a friend. `returned_date` is `NULL` while the book
is still out — that single column drives most of the app's logic:

- **Active loan** = a loan with `returned_date IS NULL`.
- **Overdue** = an active loan whose `borrow_date` is more than two weeks ago.
- **Returned** = a loan with a `returned_date`.

### Why lazy init + seeding?

`ensureDbInitialized()` runs at the start of every query helper. The first call
creates the tables and inserts starter data (2 friends, 3 books, 2 loans). This
means students can clone the repo and immediately see a populated app, with no
manual setup step.

---

## 7. Reading and writing data

### Reading (Server Components)

Pages call helpers and `await` the result. For example the dashboard:

```tsx
// src/app/page.tsx
const [activeLoans, overdueLoans] = await Promise.all([
  getActiveLoans(),
  getOverdueLoans(),
]);
```

### Writing (Server Actions)

Mutations use **Server Actions**: server functions a form can call directly. A
file marked `"use server";` exports an `async` function that receives the
submitted `FormData`.

```ts
// src/app/library/create_book/actions.ts
"use server";
export async function createBookAction(_prev, formData) {
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { error: "Please enter a title." };

  await createBook({ title, /* ... */ });

  revalidatePath("/library"); // refresh cached data
  redirect("/library");        // go back to the list
}
```

The matching form is a Client Component that uses React's `useActionState` to
track the pending state and show any returned error:

```tsx
// src/components/book_form/BookForm.tsx
"use client";
const [state, formAction, pending] = useActionState(action, {});
return <form action={formAction}> ... </form>;
```

Two helpers worth remembering:

- **`revalidatePath(path)`** tells Next.js the data for that page changed, so it
  re-renders with fresh data.
- **`redirect(path)`** sends the user to another page after a successful action.

---

## 8. Feature walkthrough: loaning a book

Let's trace one feature end to end. This ties together everything above.

1. **You open `/library/5`.** `src/app/library/[id]/page.tsx` is a Server
   Component. It reads the `id` from the URL and fetches, in parallel: the book,
   all friends, the loan history, and the current active loan (if any).
2. **The page decides what to show.** If the book is already out, it shows a
   "Currently on loan to …" banner plus a **Mark as returned** button.
   Otherwise it shows the **`LoanForm`** with a dropdown of friends.
3. **You pick a friend and submit.** The form calls the `createLoanAction`
   server action (`src/app/library/[id]/actions.ts`).
4. **The action validates and writes.** It double-checks the book isn't already
   loaned, then calls `createLoan(...)`, which inserts a row into `loans` with
   today's date and a `NULL` return date.
5. **Caches refresh and you're redirected.** The action revalidates the
   dashboard, the library, and this book page, then redirects you back here.
6. **The page re-renders** with the new active loan, and the loan now appears in
   the dashboard's "Current loans" panel.

Returning the book is the mirror image: the **`ReturnButton`** calls
`returnLoanAction`, which stamps the loan's `returned_date`, freeing the book to
be loaned again.

---

## 9. Styling approach

- **Tailwind utility classes** handle layout, spacing, and color directly in the
  JSX (e.g. `className="flex flex-col gap-4"`).
- **Per-component CSS files** (e.g. `LoanPanel.css`) handle the more involved,
  reusable styling for a component. We import the CSS at the top of the
  component file.

Both approaches coexist — reach for Tailwind for one-off layout, and a CSS file
when a component has a richer, named set of styles.

---

## 10. Try it yourself

Good exercises to deepen your understanding:

1. **Add a field.** Give books an `author` column. You'll touch `schema.ts`,
   `rows.ts`, `mappers.ts`, `books.ts`, the create form, and the book page.
2. **Add validation.** Reject invalid emails in the create-friend action and
   show the error in the form.
3. **Sort by more.** Add a "recently added" sort option to the library list.
4. **Surface overdue books on friend pages**, mirroring the dashboard's overdue
   panel.
5. **Add a "delete" action** for a book or friend (think carefully about what
   should happen to their loans).

For each change, follow the project's rhythm: make one focused change, run
`npm run lint` and `npm run build`, then commit it.
