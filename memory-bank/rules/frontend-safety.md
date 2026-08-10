# Frontend Safety Rules (NextJS / TypeScript)

> Related specs: *Frontend spec planned for future phase* | See [Project Architecture](../specs/project-architecture.md)

## TypeScript

1. **Strict mode is mandatory.** The `strict: true` flag in `tsconfig.json` must
   never be disabled. This catches `null`/`undefined` access, implicit `any`
   types, and other common pitfalls at compile time.

2. **Avoid `any`.** Prefer `unknown` when the type is not known at design time.
   Use branded types or discriminated unions to model domain concepts instead of
   raw strings or numbers.

3. **Use `satisfies` over type assertions.** When you need to ensure a value
   conforms to a type without widening it, prefer `satisfies` over `as` casts.
   `as` should be reserved for cases where you have information the compiler
   doesn't (e.g., DOM element types after a query selector).

4. **No `@ts-ignore` or `@ts-expect-error`** unless accompanied by a comment
   explaining *why* the rule must be suspended and a linked issue to remove it.

## Component Safety

5. **Destructure props at the component boundary.** Always define a named props
   interface and destructure at the top of the component — never access
   `props.something` throughout the body.

6. **Validate external data at the API boundary.** Data from `fetch`, `axios`,
   or any external source must be validated against a known shape before being
   stored in state. Use type guards or a validation library (e.g., Zod).

7. **Never pass unsanitized HTML to `dangerouslySetInnerHTML`.** If raw HTML
   must be rendered, sanitize it through a library like DOMPurify first. Document
   the necessity in a comment.

## React / NextJS

8. **Use Server Components by default.** Only add `'use client'` when you
   explicitly need interactivity, browser APIs, or React hooks. This shrinks the
   client bundle and keeps sensitive logic server-side.

9. **Sanitize search params.** URL query parameters (`searchParams`) in NextJS
   are user-controlled input. Always validate and sanitize before using in
   database queries or rendering back to the page.

10. **API routes are backend code.** Treat `app/api/` routes as backend endpoints:
    validate inputs, authenticate requests, sanitize outputs, and never trust
    the client.

11. **Image safety.** Use `<Image>` from `next/image` instead of `<img>` to get
    automatic sizing, lazy loading, and content security. Always specify known
    remote hosts in `next.config.js`.

12. **Form safety.** Use controlled components or form libraries (React Hook Form)
    with validation schemas. Never render raw user input back to the DOM without
    encoding it first.