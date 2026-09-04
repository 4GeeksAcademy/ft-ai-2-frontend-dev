# HTML — Comments & Documentation Reference

## Overview

HTML has a single comment syntax (`<!-- ... -->`). Unlike programming languages, HTML comments are not executable and are visible in the page source. They are used for organizing markup, explaining structure, and temporarily disabling sections.

---

## 1. HTML Comment Syntax

```html
<!-- This is an HTML comment -->
<p>This paragraph is visible on the page.</p>
```

Comments can span multiple lines:

```html
<!--
  This section handles the user profile card.
  It includes the avatar, name, and bio.
-->
<div class="profile-card">
  <img src="avatar.jpg" alt="User avatar" />
  <h2>Jane Doe</h2>
  <p>Software developer and open-source enthusiast.</p>
</div>
```

> **Important:** HTML comments are transmitted to the browser and visible in "View Page Source". Never put sensitive information in HTML comments.

---

## 2. Commenting Out HTML

Comments can temporarily hide markup without deleting it:

```html
<div class="navigation">
  <a href="/">Home</a>
  <a href="/about">About</a>
  <!-- <a href="/old-page">Old Link</a> -->
  <a href="/contact">Contact</a>
</div>
```

### Multi-line commenting out

```html
<!--
<div class="experimental-banner">
  <p>This feature is in beta testing.</p>
</div>
-->
```

> ⚠️ **Caution:** Comments cannot be nested in HTML. If the section you are commenting out already contains `-->`, you must remove or replace those markers first.

---

## 3. Section & Structural Comments

Use comments to label major sections of a document for readability:

```html
<!-- ============================================
     HEADER
     ============================================ -->
<header>
  <h1>My Website</h1>
  <nav>
    <!-- ... navigation links ... -->
  </nav>
</header>

<!-- ============================================
     MAIN CONTENT
     ============================================ -->
<main>
  <article>
    <h2>Article Title</h2>
    <!-- ... article body ... -->
  </article>
</main>

<!-- ============================================
     FOOTER
     ============================================ -->
<footer>
  <p>&copy; 2025 My Website</p>
</footer>
```

---

## 4. Inline / Conditional Comments

### Template Engine Style (Conceptual)

When using server-side or client-side templating (like Liquid, Handlebars, EJS, or JSX), comments often differ:

```html
<!-- {% comment %} This won't be rendered by Liquid {% endcomment %} -->
```

```handlebars
{{! This is a Handlebars comment — not visible in HTML output }}
```

```ejs
<%# This is an EJS comment — not visible in HTML output %>
```

### Conditional Comments (Legacy / IE-specific)

```html
<!--[if IE]>
  <p>You are using an outdated browser.</p>
<![endif]-->

<!--[if lte IE 8]>
  <script src="html5shiv.js"></script>
<![endif]-->
```

> **Note:** Conditional comments are only supported in Internet Explorer 5–9 and are obsolete in modern browsers.

---

## 5. Documenting Forms

```html
<!--
  Registration Form
  Fields marked with * are required.
  Submits POST to /api/register.
-->
<form action="/api/register" method="POST">
  <!-- Email input with built-in validation -->
  <label for="email">Email *</label>
  <input
    type="email"
    id="email"
    name="email"
    required
    placeholder="you@example.com"
  />

  <!-- Password field with minimum length constraint -->
  <label for="password">Password *</label>
  <input
    type="password"
    id="password"
    name="password"
    minlength="8"
    required
  />

  <button type="submit">Create Account</button>
</form>
```

---

## 6. Documenting Data Attributes

Use comments to clarify custom `data-*` attributes:

```html
<!--
  data-user-id: The unique database ID for the user
  data-role:    The user's role (admin, editor, viewer)
  data-last-login: ISO 8601 timestamp of last login
-->
<div
  class="user-card"
  data-user-id="42"
  data-role="admin"
  data-last-login="2025-01-15T10:30:00Z"
>
  <!-- ... -->
</div>
```

---

## 7. Documenting Complex Tables

```html
<!--
  Table: Quarterly Sales Report
  Columns:
    Q1 - January to March
    Q2 - April to June
    Q3 - July to September
    Q4 - October to December
  The "Total" row is computed server-side.
-->
<table>
  <thead>
    <tr>
      <th>Region</th>
      <th>Q1</th>
      <th>Q2</th>
      <th>Q3</th>
      <th>Q4</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>North</td>
      <td>12000</td>
      <td>15000</td>
      <td>14000</td>
      <td>18000</td>
    </tr>
    <!-- ... more rows ... -->
  </tbody>
</table>
```

---

## 8. Accessibility Annotations

Use comments to mark accessibility-relevant structures:

```html
<!--
  Skip link: Allows keyboard users to bypass the navigation
  and jump straight to the main content.
-->
<a href="#main-content" class="skip-link">Skip to main content</a>

<!-- ARIA landmark: Main content region -->
<main id="main-content" role="main">
  <!-- ... -->
</main>
```

---

## 9. SVG Comments

SVG elements can also contain HTML-style comments:

```html
<svg width="200" height="200" viewBox="0 0 200 200">
  <!-- Background circle -->
  <circle cx="100" cy="100" r="90" fill="#f0f0f0" stroke="#333" stroke-width="2" />

  <!-- Center text -->
  <text x="100" y="105" text-anchor="middle" font-size="20">
    Hello, SVG!
  </text>
</svg>
```

---

## 10. TODO / FIXME / HACK Comments

```html
<!-- TODO: Add responsive image srcset for mobile devices -->
<!-- FIXME: This section breaks layout on Safari < 15 -->
<!-- HACK: Extra wrapper div needed for Flexbox compatibility in IE 11 -->
```

---

## 11. Best Practices

```html
<!-- ❌ Bad — redundant comment -->
<div class="footer"><!-- This is the footer --></div>

<!-- ❌ Bad — leaving commented-out code in production -->
<!-- <div class="old-banner">...</div> -->

<!-- ✅ Good — explaining non-obvious structure -->
<!--
  The nested grid wrapper is required because the parent container
  uses display: contents, which prevents direct grid styling.
-->
<div class="grid-wrapper">
  <div class="nested-content">...</div>
</div>

<!-- ✅ Good — documenting data attributes -->
<!-- data-theme: light | dark | auto -->
```

---

## Reference

- [MDN Web Docs — HTML Comments](https://developer.mozilla.org/en-US/docs/Web/HTML/Comments)
- [HTML Living Standard — Comments](https://html.spec.whatwg.org/multipage/syntax.html#comments)
- [W3C HTML5 — Comments](https://www.w3.org/TR/2011/WD-html5-author-20110809/comment.html)