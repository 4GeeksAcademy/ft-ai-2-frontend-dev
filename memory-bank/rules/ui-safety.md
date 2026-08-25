# UI / UX Safety Rules

> Related specs: *Frontend spec planned for future phase* | See [Project Architecture](../specs/project-architecture.md)

## Rendering Safety

1. **Never render unsanitized user content.** Any text submitted by a user that
   is displayed back to other users (or the same user) must be encoded for the
   output context. Use React's default escaping for JSX, which handles most
   cases. If `dangerouslySetInnerHTML` is required, sanitize with DOMPurify.

2. **Escape for context.** Data rendered in HTML attributes, URLs, CSS, or
   `<script>` contexts each require specific escaping. React's JSX handles HTML
   and attributes, but be cautious with `href` values — validate they start with
   an allowed protocol (`http://`, `https://`, `mailto:`).

3. **Limit re-renders.** Avoid expensive re-renders by memoizing components and
   values with `React.memo`, `useMemo`, and `useCallback` when dealing with
   large lists or graphs (like concept map nodes).

## Map / Graph Display Safety (reagraph)

4. **Validate graph data.** Before passing data to `reagraph`, validate the
   node and edge structures match the expected schema. Invalid graph data can
   cause the renderer to hang or crash.

5. **Limit node count.** Concept maps should have a reasonable maximum node
   count per view. Implement progressive loading or clustering for large maps
   to maintain browser responsiveness.

6. **Handle empty states.** A concept map with zero nodes or edges must display
   a helpful empty state message — never a blank canvas or an error.

## Search Safety (fuse.js)

7. **Sanitize fuzzy search input.** User-supplied search terms must be
   truncated to a maximum length (e.g., 200 characters) before being passed
   to fuse.js.

8. **Limit search results.** Configure fuse.js with a `maxResults` option to
   prevent unbounded result sets from overwhelming the UI.

9. **Debounce search input.** Attach a debounce (300ms minimum) to live search
   inputs to avoid triggering expensive searches on every keystroke.

## Form & Input Safety

10. **Client-side + server-side validation.** Validate all form inputs on the
    client (for UX) AND on the server (for safety). Client validation is a
    convenience; server validation is the actual security boundary.

11. **Limit input sizes.** Set `maxLength` on text inputs, `max` on numeric
    inputs, and truncate or reject oversized payloads on the API side.

12. **Confirm destructive actions.** Any action that deletes or significantly
    modifies data (delete a node, clear a map) must show a confirmation dialog
    and preferably support undo.