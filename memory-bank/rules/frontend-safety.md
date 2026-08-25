# Frontend Safety Rules (NextJS / TypeScript)

> Related specs: [Minimal Auth Frontend](../specs/ minimal-auth-frontend.md) | See [Project Architecture](../specs/project-architecture.md)

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

12. **Form safety.** Use `<form action={handler}>` with `FormData` (React 19
    pattern) instead of controlled `onSubmit` + `FormEvent`. Use `name` attributes
    on inputs and `formData.get("name")` to extract values. For edit forms with
    pre-populated data, use `defaultValue` instead of `value` to keep inputs
    uncontrolled. Never render raw user input back to the DOM without encoding
    it first.

## Auth Context

13. **Keep JWT in React state only.** Do not persist tokens to `localStorage`,
    `sessionStorage`, or cookies unless the spec explicitly requires it. Token
    loss on refresh is intentional for this demo.

14. **Expose `setUser` for context sync.** When the user profile is edited
    (display name, avatar), call `setUser(updatedUser)` on the auth context so
    that all consumers (navbar, homepage) reflect the change immediately without
    a full page reload.

## Redirect Safety

15. **Use `useEffect` for auth redirects.** Do not call `router.replace()` or
    `router.push()` during render — React 19 warns about updating the Router
    component while rendering. Instead, place redirects in a `useEffect` hook
    that checks the auth state.

## API Client

16. **Use a generic fetch wrapper.** Create a single `apiClient<T>(path, options)`
    function that prepends the base URL, injects the auth token, and throws
    structured errors. All API calls should go through this wrapper.

17. **Handle API errors consistently.** The backend returns `{ detail: string }`
    on errors. The API client should throw an `ApiError` with the `detail`
    message, and form pages should catch and display it with `role="alert"`.