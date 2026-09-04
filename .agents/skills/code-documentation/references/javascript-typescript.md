# JavaScript / TypeScript — Comments & Documentation Reference

## Overview

JavaScript (JS) and TypeScript (TS) support several types of comments and documentation annotations. TypeScript extends JavaScript with type annotations, making documentation even more powerful.

---

## 1. Single-Line Comments

Use `//` for brief explanations on a single line. Place them above the code they describe or at the end of a line.

```ts
// Calculate the discounted price after applying the coupon
const finalPrice = price - discount;

const taxRate = 0.08; // 8% sales tax
```

---

## 2. Multi-Line (Block) Comments

Use `/* ... */` for longer explanations, temporary disabling of code blocks, or license headers.

```ts
/*
 * This block of code handles user authentication.
 * It checks the session token and refreshes it
 * if the token is about to expire.
 */
if (!session.isValid()) {
  session.refresh();
}
```

> **Note:** Block comments do not work with documentation generators (like TypeDoc, JSDoc). Use JSDoc (`/** ... */`) for official documentation.

---

## 3. JSDoc / TypeDoc — The Standard for Documentation

JSDoc (JS) / TypeDoc (TS) comments start with `/**` and use `@` tags. These are parseable by editors, IDEs, and documentation generators.

### Documenting Functions

```ts
/**
 * Calculates the total price including tax and optional shipping.
 *
 * @param basePrice - The base price before tax (must be ≥ 0)
 * @param taxRate - The tax rate as a decimal (e.g., 0.08 for 8%)
 * @param shipping - Optional shipping cost (defaults to 0)
 * @returns The final price rounded to two decimal places
 *
 * @example
 * // Returns 108.00
 * calculateTotal(100, 0.08, 5);
 */
function calculateTotal(
  basePrice: number,
  taxRate: number,
  shipping?: number
): number {
  const total = basePrice * (1 + taxRate) + (shipping ?? 0);
  return Math.round(total * 100) / 100;
}
```

### Documenting Classes

```ts
/**
 * Represents a user account in the system.
 *
 * @remarks
 * Users are created upon registration and store profile data
 * as well as authentication metadata.
 */
class User {
  /** The user's unique identifier (auto-generated). */
  id: string;

  /** The user's email address (used for login). */
  email: string;

  /** The user's display name. */
  name: string;

  /**
   * Creates a new User instance.
   *
   * @param email - The email address for the account
   * @param name - The display name for the account
   */
  constructor(email: string, name: string) {
    this.id = crypto.randomUUID();
    this.email = email;
    this.name = name;
  }

  /**
   * Returns a greeting message for this user.
   *
   * @returns A string like "Hello, Alice!"
   */
  greet(): string {
    return `Hello, ${this.name}!`;
  }
}
```

### Documenting Interfaces & Types

```ts
/**
 * Configuration options for the API client.
 */
interface ApiConfig {
  /** The base URL for all API requests (e.g., "https://api.example.com") */
  baseUrl: string;

  /** Request timeout in milliseconds (default: 5000) */
  timeout?: number;

  /** Optional authorization token */
  authToken?: string;
}

/**
 * Possible states of an async operation.
 */
type AsyncState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: Error };
```

---

## 4. Common JSDoc / TypeDoc Tags

| Tag             | Purpose                                        | Example                                      |
|-----------------|------------------------------------------------|----------------------------------------------|
| `@param`        | Documents a function parameter                 | `@param name - The user's name`              |
| `@returns`      | Documents the return value                     | `@returns The sum of a and b`                |
| `@throws`       | Documents an exception that may be thrown      | `@throws {Error} If the value is negative`   |
| `@example`      | Provides a usage example                       | `@example add(1, 2) // returns 3`            |
| `@deprecated`   | Marks the API as deprecated                    | `@deprecated Use `newApi()` instead`         |
| `@type`         | Explicitly documents a type (JS only)          | `@type {string}`                             |
| `@template`     | Documents a generic type parameter             | `@template T - The item type`                |
| `@default`      | Documents the default value                    | `@default 100`                               |
| `@see`          | References related code or documentation       | `@see {@link User}`                          |

---

## 5. Inline Comments Best Practices

- **Focus on "why", not "what"** — good code is self-documenting for the "what"
- **Keep comments up to date** when code changes
- **Avoid redundant comments** that parrot the code

```ts
// ❌ Bad — states the obvious
// Increment i by 1
i++;

// ✅ Good — explains the reasoning
// Bump the counter to account for the header row
i++;
```

---

## 6. TypeScript-Specific: Using Types as Documentation

TypeScript's type system itself serves as documentation. Prefer expressive types over comments.

```ts
// ❌ Bad — comment explains what types should be
// id is a number, name is a string
function saveUser(id, name) { ... }

// ✅ Good — types document themselves
function saveUser(id: number, name: string): void { ... }

// ✅ Even better — branded types add semantic meaning
type UserId = number & { __brand: "UserId" };
function saveUser(id: UserId, name: string): void { ... }
```

---

## 7. Module & File Headers

Use a JSDoc comment at the top of a file to describe its purpose.

```ts
/**
 * @fileOverview
 * Utility functions for date formatting and parsing.
 * All functions in this module work with ISO 8601 strings.
 *
 * @module date-utils
 */
```

---

## 8. React / JSX Comments

```tsx
function ProfileCard({ user }: { user: User }) {
  return (
    <div className="card">
      {/* Render the user avatar and name */}
      <img src={user.avatarUrl} alt={`${user.name}'s avatar`} />
      <h2>{user.name}</h2>

      {/*
       * Only show the email if the user has opted in
       * to public profile visibility.
       */}
      {user.showEmail && <p>{user.email}</p>}
    </div>
  );
}
```

> **Note:** Use `{/* ... */}` inside JSX. Standard `//` and `/* */` do not work within JSX markup.

---

## 9. TODO / FIXME / HACK Comments

Many editors highlight these special prefixes:

```ts
// TODO: Implement pagination for large result sets
// FIXME: This endpoint returns a 500 error when the list is empty
// HACK: Workaround for Safari rendering bug — remove when Safari 18 ships
```

---

## Reference

- [JSDoc Official Documentation](https://jsdoc.app/)
- [TypeDoc Official Documentation](https://typedoc.org/)
- [TypeScript Handbook — JSDoc Reference](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html)