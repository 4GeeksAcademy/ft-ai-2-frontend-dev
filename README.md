# ft-ai-2-frontend-dev

<!-- TOC:START -->

## Module Demonstrations

Each demonstration lives on its own branch:

- Agent Loop: [module/agent-loop](https://github.com/4GeeksAcademy/ft-ai-2-frontend-dev/tree/module/agent-loop)
- Helping LLMs Understand APIs: [module/agents_and_apis](https://github.com/4GeeksAcademy/ft-ai-2-frontend-dev/tree/module/agents_and_apis)
- API Concepts Review: [module/api_review](https://github.com/4GeeksAcademy/ft-ai-2-frontend-dev/tree/module/api_review)
- Authentication Demo: [module/auth-demo](https://github.com/4GeeksAcademy/ft-ai-2-frontend-dev/tree/module/auth-demo)
- Defining Backend Architecture: [module/backend_arch](https://github.com/4GeeksAcademy/ft-ai-2-frontend-dev/tree/module/backend_arch)
- Building An Application: [module/book_app](https://github.com/4GeeksAcademy/ft-ai-2-frontend-dev/tree/module/book_app)
- Data Pipelines: [module/data-pipelines](https://github.com/4GeeksAcademy/ft-ai-2-frontend-dev/tree/module/data-pipelines)
- TinyDB Example: [module/db-basics](https://github.com/4GeeksAcademy/ft-ai-2-frontend-dev/tree/module/db-basics)
- Designing Routes: [module/designing_routes](https://github.com/4GeeksAcademy/ft-ai-2-frontend-dev/tree/module/designing_routes)
- Docker: [module/docker](https://github.com/4GeeksAcademy/ft-ai-2-frontend-dev/tree/module/docker)
- File I/O: [module/file-io](https://github.com/4GeeksAcademy/ft-ai-2-frontend-dev/tree/module/file-io)
- File I/O Example: [module/file-io-example](https://github.com/4GeeksAcademy/ft-ai-2-frontend-dev/tree/module/file-io-example)
- Full Stack Demo: [module/full-stack-demo](https://github.com/4GeeksAcademy/ft-ai-2-frontend-dev/tree/module/full-stack-demo)
- Full Stack (Enhanced): [module/full-stack-enhanced](https://github.com/4GeeksAcademy/ft-ai-2-frontend-dev/tree/module/full-stack-enhanced)
- MCP: [module/mcp](https://github.com/4GeeksAcademy/ft-ai-2-frontend-dev/tree/module/mcp)
- Multi-Agent Systems: [module/multi-agent-systems](https://github.com/4GeeksAcademy/ft-ai-2-frontend-dev/tree/module/multi-agent-systems)
- Observability: [module/observability](https://github.com/4GeeksAcademy/ft-ai-2-frontend-dev/tree/module/observability)
- Offloading Tasks: [module/offloading-tasks](https://github.com/4GeeksAcademy/ft-ai-2-frontend-dev/tree/module/offloading-tasks)
- Python: [module/python](https://github.com/4GeeksAcademy/ft-ai-2-frontend-dev/tree/module/python)
- Queues: [module/queues](https://github.com/4GeeksAcademy/ft-ai-2-frontend-dev/tree/module/queues)
- Relational DB: [module/relational-db](https://github.com/4GeeksAcademy/ft-ai-2-frontend-dev/tree/module/relational-db)
- Making `fetch` requests: [module/restful_apis](https://github.com/4GeeksAcademy/ft-ai-2-frontend-dev/tree/module/restful_apis)
- RTC: [module/rtc](https://github.com/4GeeksAcademy/ft-ai-2-frontend-dev/tree/module/rtc)
- Server VS Client Components: [module/server_client_divide](https://github.com/4GeeksAcademy/ft-ai-2-frontend-dev/tree/module/server_client_divide)
- Single Page Apps: [module/spa](https://github.com/4GeeksAcademy/ft-ai-2-frontend-dev/tree/module/spa)
- Providing Visual Specs To The AI: [module/specs-pt-1](https://github.com/4GeeksAcademy/ft-ai-2-frontend-dev/tree/module/specs-pt-1)
- Structure: [module/structure](https://github.com/4GeeksAcademy/ft-ai-2-frontend-dev/tree/module/structure)
- Testing: [module/testing](https://github.com/4GeeksAcademy/ft-ai-2-frontend-dev/tree/module/testing)
<!-- TOC:END -->
## Devlog

A running log of what we have built, in the order we built it. Each entry maps
to one commit so students can follow along step by step. See [SPEC.md](./SPEC.md)
for the full project specification, and [WALKTHROUGH.md](./WALKTHROUGH.md) for a
guided tour of how the app is put together.

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
7. **Flesh out friend detail pages.** Friend pages now show how many books a
   friend currently has out plus their full borrowing history (with links to
   each book and active/overdue/returned status).
8. **Searchable, sortable lists.** The library and friends index pages can now
   be filtered by a search box and sorted A–Z or Z–A, handled on the client
   for instant feedback.
9. **Link the dashboard.** The dashboard loan panels now link each book title
   to its detail page and each borrower name to their friend page.
10. **Fix placeholder covers.** Added a `.png` extension to the `placehold.co`
    cover URLs (seed data and the generated fallback). Without it the service
    returns SVG, which `next/image` blocks unless `dangerouslyAllowSVG` is on.

## Getting Started

```bash
npm install
npm run db:init   # create and seed the local database (optional; runs automatically too)
npm run dev       # start the dev server at http://localhost:3000
```
