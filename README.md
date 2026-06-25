# ft-ai-2-frontend-dev

## Repo Structure

Each section will have its' own branch:
- Providing Visual Specs To The AI: [module/specs-pt-1](https://github.com/4GeeksAcademy/ft-ai-2-frontend-dev/tree/module/specs-pt-1)
- Single Page Apps: [module/spa](https://github.com/4GeeksAcademy/ft-ai-2-frontend-dev/tree/module/spa)
- Structure: [module/structure](https://github.com/4GeeksAcademy/ft-ai-2-frontend-dev/tree/module/structure)

## Devlog

A running log of what we have built, in the order we built it. Each entry maps
to one commit so students can follow along step by step. See [SPEC.md](./SPEC.md)
for the full project specification.

1. **Bootstrap the project.** Scaffolded a Next.js app (App Router) with
   TypeScript, Tailwind CSS, and ESLint. Added the shared `types.d.ts`
   (`Friend`, `Book`, `Loan`) and a `components/` folder following the
   per-component-folder convention.
2. **Adopt a `src/` layout.** Moved `components/` and `types.d.ts` under `src/`,
   then moved the App Router to `src/app` for the conventional Next.js layout.
   The `@/*` import alias maps to `src/*`.
3. **Add the data layer and page routes.** Wired up a local libSQL/SQLite
   database (`src/db/`) with `friends`, `books`, and `loans` tables plus seed
   data for the demo. Built a shared `Header`, a `LoanPanel` component, and
   scaffolded every route from the spec: the dashboard (`/`), library
   (`/library`, `/library/[id]`, `/library/create_book`), and friends
   (`/friends`, `/friends/[id]`, `/friends/create_friend`).
4. **Add create forms.** Built working create-book and create-friend forms
   backed by server actions, with reusable form field components and light
   validation (phone number normalization, placeholder cover images).
5. **Loan a book from its detail page.** Added a friend picker on
   `/library/[id]` that records a new loan, shows who currently has the book,
   and lists the full borrowing history with active/overdue/returned status.
6. **Mark a book as returned.** Added a "Mark as returned" button on the book
   detail page that stamps the active loan with a return date, frees the book
   to be loaned again, and updates the dashboard.

## Getting Started

```bash
npm install
npm run db:init   # create and seed the local database (optional; runs automatically too)
npm run dev       # start the dev server at http://localhost:3000
```
