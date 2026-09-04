# CSS — Comments & Documentation Reference

## Overview

CSS uses a single comment style (`/* ... */`). While CSS lacks a formal documentation standard like JSDoc or PHPDoc, consistent commenting practices are essential for maintainable stylesheets, especially in large projects using pre-processors or CSS-in-JS.

---

## 1. CSS Comment Syntax

CSS comments use the `/* */` block syntax. They can be single-line or multi-line.

```css
/* Single-line comment */
color: blue;

/*
Multi-line comment
explaining a complex rule
*/
background-color: #f0f0f0;
```

> **Note:** CSS does **not** have single-line comments like `//`. In standard CSS, `//` will cause the rule to break.

---

## 2. Section Headers & Structure

Use comments to organize stylesheets into logical sections:

```css
/* ============================================
     RESET & BASE STYLES
     ============================================ */

*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* ============================================
     TYPOGRAPHY
     ============================================ */

body {
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 16px;
  line-height: 1.5;
  color: #333;
}

/* ============================================
     LAYOUT
     ============================================ */

.container {
  max-width: 1200px;
  margin-inline: auto;
  padding-inline: 1rem;
}
```

---

## 3. Component-Specific Comments

Document the purpose and usage of CSS components:

```css
/*
 * Profile Card Component
 *
 * Displays a user's avatar, name, and brief bio.
 * Used on the /users and /team pages.
 *
 * Structure:
 *   .profile-card         — the outer container
 *   .profile-card__avatar — the user's profile image
 *   .profile-card__name   — the user's display name
 *   .profile-card__bio    — short biographical text
 */

.profile-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.profile-card__avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
}

.profile-card__name {
  font-size: 1.25rem;
  font-weight: 600;
}

.profile-card__bio {
  font-size: 0.875rem;
  color: #666;
}
```

---

## 4. Value & Magic Number Explanations

Explain non-obvious values or "magic numbers":

```css
.element {
  /* 2px accounts for the border on both sides */
  width: calc(100% - 2px);

  /* Negative margin pulls the element up to overlap the preceding section */
  margin-top: -2rem;

  /* 150ms is the optimal duration for a subtle hover transition */
  transition: transform 150ms ease;
}
```

---

## 5. Browser-Specific Comments / Hacks

```css
/* Target WebKit browsers (Safari, Chrome) */
.custom-select {
  -webkit-appearance: none;
  appearance: none;
}

/* @supports blocks can document feature queries */
/* Fallback for browsers that do not support grid */
@supports not (display: grid) {
  .layout {
    display: flex;
    flex-wrap: wrap;
  }
}
```

---

## 6. Color & Design Token Documentation

```css
/*
 * Design Tokens — Colors
 *
 * --color-primary:    #2563eb — Brand blue (primary actions, links)
 * --color-secondary:  #7c3aed — Brand purple (secondary actions)
 * --color-success:    #16a34a — Green (success states)
 * --color-warning:    #d97706 — Amber (warning states)
 * --color-error:      #dc2626 — Red (error states)
 * --color-bg:         #ffffff — Page background
 * --color-text:       #1a1a1a — Primary text color
 */

:root {
  --color-primary: #2563eb;
  --color-secondary: #7c3aed;
  --color-success: #16a34a;
  --color-warning: #d97706;
  --color-error: #dc2626;
  --color-bg: #ffffff;
  --color-text: #1a1a1a;
}
```

---

## 7. Media Query Annotations

```css
/* Tablet: 768px and above */
@media (min-width: 768px) {
  .layout {
    grid-template-columns: 1fr 1fr;
  }
}

/* Desktop: 1024px and above */
@media (min-width: 1024px) {
  .layout {
    grid-template-columns: 1fr 1fr 1fr;
  }
}

/* Reduced motion preference */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 8. Commenting Out CSS Rules

Temporarily disable rules without deleting them:

```css
.button {
  /* background-color: red; */
  background-color: blue;
  color: white;

  /* font-size: 14px; */
  font-size: 16px;
}
```

To disable an entire block at once:

```css
/*
.button--experimental {
  background: linear-gradient(45deg, red, blue);
  animation: pulse 2s infinite;
}
*/
```

> ⚠️ **Caution:** Comments cannot be nested in CSS. If the commented block already contains `*/`, you must remove or escape those markers.

---

## 9. Documenting Keyframe Animations

```css
/*
 * @keyframes fadeIn
 *
 * Animates an element from transparent to fully opaque.
 * Usage: animation: fadeIn 300ms ease-out;
 *
 * @param {duration} 300ms — recommended default
 * @param {easing}   ease-out — starts fast, decelerates
 */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
```

---

## 10. SCSS / Sass-Specific Comments

Sass and SCSS support both `//` (compiled away) and `/* */` (preserved in output) comments.

```scss
// This comment will NOT appear in the compiled CSS
// It is for developers only.

/* This comment WILL appear in the compiled CSS output. */

// Use // for internal implementation notes
@mixin respond-to($breakpoint) {
  // Generate a min-width media query from the breakpoint map
  @if map-has-key($breakpoints, $breakpoint) {
    @media (min-width: map-get($breakpoints, $breakpoint)) {
      @content;
    }
  } @else {
    @warn "Unknown breakpoint: #{$breakpoint}";
  }
}
```

### Documenting Variables & Mixins

```scss
// ============================================
// VARIABLES — Spacing Scale
// ============================================

/// Base unit for consistent spacing (4px)
$spacing-unit: 4px;

/// Spacing scale derived from the base unit
$spacing-sm: $spacing-unit * 2;  // 8px
$spacing-md: $spacing-unit * 4;  // 16px
$spacing-lg: $spacing-unit * 8;  // 32px
$spacing-xl: $spacing-unit * 16; // 64px

// ============================================
// MIXINS
// ============================================

/// Visually hide an element while keeping it accessible
/// to screen readers (screen-reader-only utility).
@mixin sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

---

## 11. CSS-in-JS Comments

### Styled Components / Emotion

```js
const Button = styled.button`
  /* Base button styles — applies to all variants */
  display: inline-flex;
  align-items: center;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;

  /* Primary variant — used for main call-to-action */
  ${({ variant }) =>
    variant === 'primary' &&
    css`
      background-color: var(--color-primary);
      color: white;
    `}
`;
```

---

## 12. TODO / FIXME / HACK Comments

```css
/* TODO: Add dark mode styles using prefers-color-scheme */
/* FIXME: This gradient does not render correctly in Safari 15 */
/* HACK: Using !important to override third-party widget styles */
```

---

## 13. Best Practices

```css
/* ❌ Bad — obvious comment */
/* Red text */
color: red;

/* ✅ Good — explains the reasoning */
/* Use error color to match the destructive action pattern */
color: var(--color-error);

/* ❌ Bad — leaving large blocks of unused CSS */
/*
.old-section { ... many lines ... }
*/

/* ✅ Good — cleaning up stale code; rely on version control */
```

---

## Reference

- [MDN Web Docs — CSS Comments](https://developer.mozilla.org/en-US/docs/Web/CSS/Comments)
- [CSS-Tricks — Comments in CSS](https://css-tricks.com/comments-in-css/)
- [Sass Documentation — Comments](https://sass-lang.com/documentation/syntax/comments/)
- [Google HTML/CSS Style Guide — Comments](https://google.github.io/styleguide/htmlcssguide.html#Comments)