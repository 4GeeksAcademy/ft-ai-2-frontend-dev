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
- API Concepts Review: [module/api_review](https://github.com/4GeeksAcademy/ft-ai-2-frontend-dev/tree/module/api_review)
<!-- TOC:END -->

## How This Page Works

You're likely reading this on our [GitHub Pages site](https://4geeksacademy.github.io/ft-ai-2-frontend-dev/),
which is served from the `docs/` folder. What's interesting is that the page you
see is **not** a pre-built HTML file — it's a tiny shell that fetches this very
`README.md` and renders it in your browser, live. Here's the chain of events:

1. **The page loads `docs/index.html`.** It contains almost no content — just an
   empty `<main>` element and two `<script>` tags from a CDN: [htmx](https://htmx.org/)
   (for fetching) and [marked](https://marked.js.org/) (for turning Markdown into HTML).
2. **htmx fetches the Markdown.** The `<main>` element carries
   `hx-get="…/README.md"` and `hx-trigger="load"`, which tells htmx: "as soon as
   you load, make a GET request to this URL." htmx pulls the raw README straight
   from GitHub.
3. **We convert Markdown to HTML before it's shown.** A listener on htmx's
   `htmx:beforeSwap` event runs the fetched text through `marked.parse()`, so the
   raw `#` and `-` characters become real headings and lists instead of appearing
   as plain text.
4. **A stylesheet makes it readable.** `docs/styles.css` adds a mobile-first,
   single-column layout with light/dark mode.

A couple of details worth noticing, because they're common real-world snags:

- **CORS.** Because the page is served from one origin (GitHub Pages) but fetches
  from another (`raw.githubusercontent.com`), the browser enforces
  [Cross-Origin Resource Sharing](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
  rules. htmx normally adds custom `HX-*` request headers, which would trigger a
  stricter "preflight" check that GitHub's raw host rejects. We set
  `hx-request='{"noHeaders": true}'` to skip those headers and keep it a simple
  request.
- **Security.** htmx can be configured to refuse cross-origin requests entirely.
  We deliberately allow them but then lock things down with an
  [`htmx:validateUrl`](https://htmx.org/events/#htmx:validateUrl) handler that
  blocks every URL except the one README we expect.

Want to explore further? Start with the [htmx documentation](https://htmx.org/docs/) —
it's an approachable introduction to adding dynamic behavior to plain HTML without
writing much JavaScript. The full list of events we hooked into (like
`htmx:beforeSwap` and `htmx:validateUrl`) lives in the
[events reference](https://htmx.org/events/).
