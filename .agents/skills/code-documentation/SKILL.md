---
name: code-documentation
description: A skill for generating code comments and docstrings for coders of various levels of skill.
---

The code documentation skill helps generate comments and docstrings for people who are learning to code, making it easier for them to understand and maintain their code. It supports four levels of commenting detail, from documenting what every line of code is doing (for beginners) to writing concise docstrings for experienced developers.

## Reference Files

Language-specific documentation conventions (comment syntax, docblock formats, annotation tags, and examples) are maintained in the [`references/`](./references/) directory:

| File | Language |
|------|----------|
| [`references/javascript-typescript.md`](./references/javascript-typescript.md) | JavaScript / TypeScript |
| [`references/python.md`](./references/python.md) | Python |
| [`references/rust.md`](./references/rust.md) | Rust |
| [`references/php.md`](./references/php.md) | PHP |
| [`references/html.md`](./references/html.md) | HTML |
| [`references/css.md`](./references/css.md) | CSS |

Consult the appropriate reference file when generating documentation to ensure language-specific syntax and conventions are followed.

## Automatic Application via `.comment-level`

To avoid asking the user every time code is generated, the skill can read — and write — a `.comment-level` file at the project root. This file stores the user's preferred documentation level and is checked on every invocation.

### File Format

The `.comment-level` file is a plain text file containing exactly one line: one of `expert`, `advanced`, `intermediate`, or `beginner`.

```
expert
```

- Must be lowercase.
- Must be one of the four valid levels.
- Trailing whitespace is tolerated; blank lines are ignored.
- If the file is missing, malformed, or contains an unrecognized value, fall back to asking the user.

### Behavior

| Scenario | Action |
|----------|--------|
| `.comment-level` exists and contains a valid level | Apply that level automatically — **do not** ask the user. |
| `.comment-level` exists but contains an invalid value | Log a warning, then ask the user as if the file did not exist. |
| `.comment-level` does not exist | Ask the user. If they choose a level, **create** `.comment-level` with that value for future sessions. |
| User explicitly says they do not want comments | Generate code without comments. Do **not** create or modify `.comment-level` unless the user also provides a level preference for future sessions. |

## Invocation

This skill should be invoked whenever an agent generates code for the user.

The agent must first check for a `.comment-level` file in the project root:

- If found and valid → apply that level **silently** (no question asked).
- If not found → ask the user:

  > "Would you like me to add comments and/or docstrings to this code? If so, what level of detail would you like (expert, advanced, intermediate, beginner)? I'll save your preference to a `.comment-level` file so you don't have to answer again."

When the user provides a level, the agent **must write** `.comment-level` to the project root with that value so the preference persists across chat sessions.

## Levels of Detail

Each level **includes** the documentation from all levels above it (e.g., "Advanced" includes Expert-level docstrings but not Intermediate or Beginner inline comments). Levels are listed from most to least detailed.

### Expert
Thorough docstrings with full parameter and return type annotations. Only the most complex or non-obvious code sections get inline comments. Follows the language's idiomatic doc comment convention (JSDoc, PHPDoc, rustdoc, etc.).

- **Good for**: Production libraries, public API code, team projects
- **Includes**: `@param` / `@return` / `@throws` / `@example` tags, type annotations in docblocks, class-level descriptions
- **Does not include**: Inline comments for straightforward code — trust the reader to understand the language

```python
def calculate_total(base_price: float, tax_rate: float, shipping: float = 0) -> float:
    """
    Calculate the total price including tax and optional shipping.

    Args:
        base_price: The base price before tax (must be >= 0).
        tax_rate: The tax rate as a decimal (e.g., 0.08 for 8%).
        shipping: Optional shipping cost (default is 0).

    Returns:
        The final price rounded to two decimal places.

    Raises:
        ValueError: If base_price is negative.

    Example:
        >>> calculate_total(100, 0.08, 5)
        108.0
    """
    total = base_price * (1 + tax_rate) + shipping
    return round(total, 2)
```

### Advanced
Concise docstrings for functions and classes with minimal inline comments. Documents the *what* and *why* at the function/class level only.

- **Good for**: Internal modules, experienced developers on the same team
- **Includes**: Brief function/class docstrings with @param/@return, no inline comments unless the code is non-obvious

```python
def calculate_total(base_price: float, tax_rate: float, shipping: float = 0) -> float:
    """Return the total price including tax and shipping, rounded to 2 decimals."""
    ...
```

### Intermediate
Adds comments explaining the purpose of code blocks and functions, without documenting every individual line.

- **Good for**: Learners who understand syntax but need help with logic flow
- **Includes**: Block-level comments describing what each section does, function-level docstrings (without full @param/@return tags unless complex)

```python
def calculate_total(base_price, tax_rate, shipping=0):
    """Calculate total price."""
    # Calculate the tax amount from the base price
    tax_amount = base_price * tax_rate

    # Add base price, tax, and shipping together
    total = base_price + tax_amount + shipping

    # Round to two decimal places for currency
    return round(total, 2)
```

### Beginner
Adds comments explaining what each line of code does, written in simple language.

- **Good for**: Absolute beginners, students, self-taught learners
- **Includes**: Line-by-line comments in plain language, no assumed knowledge

```python
def calculate_total(base_price, tax_rate, shipping=0):
    # Start with the base price of the item
    total = base_price

    # Add the tax amount (base_price multiplied by tax_rate)
    total = total + (base_price * tax_rate)

    # Add the shipping cost
    total = total + shipping

    # Round to 2 decimal places (for dollars and cents)
    total = round(total, 2)

    # Send back the final total
    return total
```

## Implementation Guidelines

### Workflow

1. **Detect the language** of the code being generated.
2. **Check for `CONVENTIONS.md`** in the memory bank:
   - If the file exists with a valid level → skip to step 4.
   - If the file does not exist → ask the user for their preference and **write** `CONVENTIONS.md` with their choice.
3. **Consult the reference file** for the detected language from `references/` to ensure correct comment syntax and docstring conventions.
4. **Apply the appropriate level** of detail to the generated code.
5. **Stick to one level** — do not mix levels within a single file unless the user requests it.

### General Rules

| Rule | Explanation |
|------|-------------|
| **Explain *why*, not *what*** | Good code already communicates *what* it does. Comments should explain *why* a certain approach was taken or *why* an edge case is handled. |
| **Don't over-comment** | At Expert/Advanced levels, avoid stating the obvious. Trust the reader to understand the language syntax. |
| **Keep comments up to date** | When code changes, comments must change too. Stale comments are worse than no comments. |
| **Use the right syntax** | Each language has its own comment syntax. Use the reference files to get it right. |
| **Respect the language's convention** | Python uses `"""` docstrings, Rust uses `///`, JavaScript/TypeScript uses `/** */`, PHP uses `/** */`, CSS uses `/* */`, HTML uses `<!-- -->`. |

### Per-Language Quick Reference

| Language | Doc Comment | Inline Comment | Reference File |
|----------|-------------|----------------|----------------|
| JavaScript / TypeScript | `/** ... */` (JSDoc / TypeDoc) | `//` | [`references/javascript-typescript.md`](./references/javascript-typescript.md) |
| Python | `""" ... """` (Google / NumPy / Sphinx style) | `#` | [`references/python.md`](./references/python.md) |
| Rust | `///` or `//!` (rustdoc) | `//` | [`references/rust.md`](./references/rust.md) |
| PHP | `/** ... */` (PHPDoc) | `//` or `#` | [`references/php.md`](./references/php.md) |
| HTML | N/A (use `<!-- -->` for structural comments) | `<!-- -->` | [`references/html.md`](./references/html.md) |
| CSS | N/A (use `/* */` for section headers & notes) | `/* */` | [`references/css.md`](./references/css.md) |
