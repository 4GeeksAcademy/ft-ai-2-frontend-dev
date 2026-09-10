# Rust — Comments & Documentation Reference

## Overview

Rust has a rich documentation system built into the language and toolchain. It supports regular comments, inner/outer doc comments (which become part of the compiled documentation), and an attribute-based system. The `rustdoc` tool generates HTML documentation from doc comments.

---

## 1. Single-Line Comments

```rust
// Calculate the discounted price after applying the coupon
let final_price = price - discount;

let tax_rate = 0.08; // 8% sales tax
```

---

## 2. Block Comments

```rust
/*
 * This block handles user authentication.
 * It checks the session token and refreshes it
 * if the token is about to expire.
 */
if !session.is_valid() {
    session.refresh();
}
```

Block comments can also be nested (unique to Rust):

```rust
/* This is a comment /* with nesting */ still part of the outer comment */
```

---

## 3. Doc Comments (`///` and `//!`)

Rust doc comments are parsed by `rustdoc` and compiled into HTML documentation. They support **Markdown** syntax.

### Outer Doc Comments (`///`) — Document Items

Place `///` **above** the item being documented (functions, structs, enums, traits, modules, etc.).

```rust
/// Calculates the total price including tax and optional shipping.
///
/// # Arguments
///
/// * `base_price` - The base price before tax (must be >= 0).
/// * `tax_rate` - The tax rate as a decimal (e.g., 0.08 for 8%).
/// * `shipping` - Optional shipping cost (defaults to 0.0).
///
/// # Returns
///
/// The final price rounded to two decimal places.
///
/// # Examples
///
/// ```
/// use crate::pricing::calculate_total;
///
/// let result = calculate_total(100.0, 0.08, 5.0);
/// assert_eq!(result, 108.0);
/// ```
///
/// # Panics
///
/// Panics if `base_price` is negative.
pub fn calculate_total(base_price: f64, tax_rate: f64, shipping: f64) -> f64 {
    assert!(base_price >= 0.0, "base_price must be non-negative");
    let total = base_price * (1.0 + tax_rate) + shipping;
    (total * 100.0).round() / 100.0
}
```

### Inner Doc Comments (`//!`) — Document the Parent

Place `//!` **inside** a module or crate to document the enclosing container.

```rust
//! # Pricing Module
//!
//! This module provides utilities for calculating product prices,
//! including tax, discounts, and shipping costs.
//!
//! ## Organization
//!
//! - [`calculate_total`] — full price with tax and shipping
//! - [`apply_discount`] — apply a percentage discount
```

```rust
//! # My Crate
//!
//! `my_crate` is a collection of utilities for doing useful things.
//! See individual modules for detailed documentation.
```

---

## 4. Documenting Structs and Enums

```rust
/// Represents a user account in the system.
///
/// Users are created upon registration and store profile data
/// as well as authentication metadata.
pub struct User {
    /// The user's unique identifier (auto-generated UUID v4).
    pub id: String,

    /// The user's email address (used for login).
    pub email: String,

    /// The user's display name.
    pub name: String,
}

/// Possible states of a network request.
///
/// This enum is returned by the [`fetch_data`] function.
pub enum AsyncState<T> {
    /// The request has not been started yet.
    Idle,
    /// The request is currently in progress.
    Loading,
    /// The request completed successfully.
    Success(T),
    /// The request failed with an error.
    Error(String),
}
```

---

## 5. Documenting Traits

```rust
/// Types that can be serialized into a byte stream.
///
/// # Implementing
///
/// Implement `Serialize` for custom types to enable encoding
/// into the application's wire format.
///
/// # Example
///
/// ```ignore
/// impl Serialize for MyType {
///     fn serialize(&self) -> Vec<u8> {
///         // ... implementation ...
///     }
/// }
/// ```
pub trait Serialize {
    /// Serialize this value into a byte vector.
    fn serialize(&self) -> Vec<u8>;
}
```

---

## 6. Documenting Modules

Use `//!` at the top of a module file or use `#[doc = "..."]` attributes.

```rust
//! Date utility functions.
//!
//! This module provides helpers for formatting, parsing, and manipulating
//! ISO 8601 date strings. All functions return UTC-based results unless
//! otherwise noted.
//!
//! # Example
//!
//! ```rust
//! use crate::date_utils::format_iso;
//!
//! let date = format_iso(2025, 1, 15);
//! assert_eq!(date, "2025-01-15");
//! ```
```

---

## 7. Doc Comment Sections

Rustdoc supports Markdown with conventional section headers:

| Section Header  | Purpose                                             |
|-----------------|-----------------------------------------------------|
| `# Examples`    | Code examples (run as tests with `cargo test`)      |
| `# Panics`      | Conditions under which the function will panic       |
| `# Errors`      | Describes error variants returned (for `Result`)     |
| `# Safety`      | Documents unsafe preconditions (for `unsafe` fns)    |
| `# Arguments`   | Describes each parameter                             |
| `# Returns`     | Describes the return value                           |
| `# Aborts`      | Conditions under which the process may abort         |
| `# Cancellation`| Whether the function can be cancelled mid-execution  |

---

## 8. Documentation Attributes

### `#[doc]` attribute

Equivalent to `///` but written as an attribute.

```rust
#[doc = "This is the equivalent of a doc comment above a function"]
pub fn documented_fn() {}
```

### `#[doc(alias = "...")]`

Adds search aliases in the generated docs.

```rust
#[doc(alias = "create")]
#[doc(alias = "new")]
pub fn make_user() -> User {
    User { /* ... */ }
}
```

### `#[doc(hidden)]`

Hides an item from the generated documentation.

```rust
#[doc(hidden)]
pub fn internal_helper() {}
```

### `#[allow(missing_docs)]`

Silences the `missing_docs` lint for specific items.

---

## 9. Documentation Tests

Code blocks in doc comments are automatically run as tests during `cargo test`.

```rust
/// Adds two numbers together.
///
/// ```
/// let result = my_crate::add(2, 3);
/// assert_eq!(result, 5);
/// ```
pub fn add(a: i32, b: i32) -> i32 {
    a + b
}
```

### Hiding Lines in Doc Tests

```rust
/// ```
/// # // This line is hidden from docs but runs as a test
/// # let setup_value = 10;
/// let result = my_crate::compute(setup_value);
/// assert!(result.is_ok());
/// ```
```

### Compile-Fail Tests

```rust
/// Ensures the function rejects negative input at compile time.
///
/// ```compile_fail
/// let result = my_crate::only_positive(-1);
/// ```
pub fn only_positive(x: i32) -> i32 {
    if x < 0 { panic!("input must be non-negative"); }
    x
}
```

---

## 10. Regular Comments Best Practices

```rust
// ❌ Bad — states the obvious
// Increment i by 1
i += 1;

// ✅ Good — explains the reasoning
// Bump the counter to account for the header row
i += 1;
```

---

## 11. TODO / FIXME / HACK Comments

```rust
// TODO: Implement pagination for large result sets
// FIXME: This endpoint panics when the list is empty
// HACK: Workaround for LLVM codegen issue — remove when LLVM 19 ships
```

---

## 12. Crate-Level Documentation (`lib.rs` or `main.rs`)

```rust
//! # My Crate
//!
//! `my_crate` is an ergonomic library for doing awesome things.
//!
//! ## Quick Start
//!
//! ```rust
//! use my_crate::Awesome;
//!
//! let thing = Awesome::new();
//! thing.do_thing();
//! ```
//!
//! ## Feature Flags
//!
//! - `serde` (default): Enables serialization support
//! - `async`: Enables async/await APIs

pub mod date_utils;
pub mod pricing;
```

---

## Reference

- [The Rustdoc Book](https://doc.rust-lang.org/rustdoc/)
- [Rust by Example — Documentation](https://doc.rust-lang.org/stable/rust-by-example/meta/doc.html)
- [Rust API Guidelines — Documentation](https://rust-lang.github.io/api-guidelines/documentation.html)
- [RFC 1574 — More API Documentation Conventions](https://rust-lang.github.io/rfcs/1574-more-api-documentation-conventions.html)