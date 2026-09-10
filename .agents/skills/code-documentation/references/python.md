# Python — Comments & Documentation Reference

## Overview

Python has built-in support for documentation through docstrings (triple-quoted strings) and standard comment syntax. Tools like Sphinx, pydoc, and modern editors leverage these conventions to generate documentation and provide IDE hints.

---

## 1. Single-Line Comments

Use `#` for brief explanations.

```python
# Calculate the discounted price after applying the coupon
final_price = price - discount

tax_rate = 0.08  # 8% sales tax
```

---

## 2. Inline Comments

Place a comment on the same line as code, separated by at least two spaces.

```python
total = subtotal + shipping  # Add shipping cost before tax
```

---

## 3. Docstrings — The Python Standard

Docstrings (documentation strings) are triple-quoted strings (`""" """` or `''' ''''`) placed immediately after a function, class, or module definition. They are accessible at runtime via `help()` and `__doc__`.

### One-Line Docstrings

```python
def add(a: int, b: int) -> int:
    """Return the sum of a and b."""
    return a + b
```

### Multi-Line Docstrings

```python
def calculate_total(base_price: float, tax_rate: float, shipping: float = 0) -> float:
    """
    Calculate the total price including tax and optional shipping.

    Parameters
    ----------
    base_price : float
        The base price before tax (must be >= 0).
    tax_rate : float
        The tax rate as a decimal (e.g., 0.08 for 8%).
    shipping : float, optional
        Optional shipping cost (default is 0).

    Returns
    -------
    float
        The final price rounded to two decimal places.

    Examples
    --------
    >>> calculate_total(100, 0.08, 5)
    108.0
    """
    total = base_price * (1 + tax_rate) + shipping
    return round(total, 2)
```

---

## 4. Docstring Formats

Python has several widely-used docstring conventions. Choose one and be consistent.

### Google Style (recommended for modern projects)

```python
def fetch_user(user_id: int) -> dict | None:
    """
    Fetch a user record from the database by their ID.

    Args:
        user_id: The unique identifier for the user.

    Returns:
        A dictionary with user data, or None if not found.

    Raises:
        ValueError: If user_id is negative.
        ConnectionError: If the database is unreachable.
    """
    if user_id < 0:
        raise ValueError("user_id must be non-negative")
    # ... fetch from database ...
    return None
```

### NumPy Style

```python
def fetch_user(user_id: int) -> dict | None:
    """
    Fetch a user record from the database by their ID.

    Parameters
    ----------
    user_id : int
        The unique identifier for the user.

    Returns
    -------
    dict or None
        A dictionary with user data, or None if not found.

    Raises
    ------
    ValueError
        If user_id is negative.
    ConnectionError
        If the database is unreachable.
    """
    if user_id < 0:
        raise ValueError("user_id must be non-negative")
    return None
```

### Sphinx / reStructuredText Style

```python
def fetch_user(user_id: int) -> dict | None:
    """
    Fetch a user record from the database by their ID.

    :param user_id: The unique identifier for the user.
    :type user_id: int
    :returns: A dictionary with user data, or None if not found.
    :rtype: dict or None
    :raises ValueError: If user_id is negative.
    :raises ConnectionError: If the database is unreachable.
    """
    if user_id < 0:
        raise ValueError("user_id must be non-negative")
    return None
```

---

## 5. Documenting Classes

```python
class User:
    """Represents a user account in the system.

    Users are created upon registration and store profile data
    as well as authentication metadata.

    Attributes:
        id: The user's unique identifier (auto-generated UUID).
        email: The user's email address (used for login).
        name: The user's display name.
    """

    def __init__(self, email: str, name: str):
        """Initialize a new User.

        Args:
            email: The email address for the account.
            name: The display name for the account.
        """
        import uuid
        self.id = str(uuid.uuid4())
        self.email = email
        self.name = name

    def greet(self) -> str:
        """Return a personalized greeting for this user.

        Returns:
            A string like "Hello, Alice!".
        """
        return f"Hello, {self.name}!"
```

---

## 6. Documenting Modules

Place a docstring at the top of a `.py` file to describe its purpose.

```python
"""
Date utility functions.

This module provides helpers for formatting, parsing, and manipulating
ISO 8601 date strings. All functions return UTC-based results unless
otherwise noted.

Typical usage example:

    >>> from date_utils import format_iso
    >>> format_iso(2025, 1, 15)
    '2025-01-15'
"""
```

---

## 7. Type Hints as Documentation

Python 3.5+ supports type hints (`: type` syntax and `-> ReturnType`). They serve as built-in documentation checked by mypy, pyright, and IDEs.

```python
from typing import Optional


# ❌ Bad — comments describe types that annotations should convey
# name: str, age: int, returns: str
def describe(name, age):
    return f"{name} is {age} years old"


# ✅ Good — type hints make the contract clear
def describe(name: str, age: int) -> str:
    """Return a description string for a person."""
    return f"{name} is {age} years old"
```

---

## 8. The `__all__` List

Use `__all__` to define a module's public API and document what is exported.

```python
"""Module for geometric calculations."""

__all__ = [
    "Circle",
    "Rectangle",
    "calculate_area",  # Only these are exported with `from module import *`
]
```

---

## 9. TODO / FIXME / HACK Comments

```python
# TODO: Implement pagination for large result sets
# FIXME: This endpoint raises a KeyError when the list is empty
# HACK: Workaround for SQLite connection timeout — revisit when migrating to Postgres
```

---

## 10. Special Comment Annotations

### Type: ignore

```python
from external_lib import something  # type: ignore[import]
```

### Noqa (skip linting on this line)

```python
x = some_long_line_that_should_be_ignored_by_linters()  # noqa: E501
```

---

## Reference

- [PEP 257 — Docstring Conventions](https://peps.python.org/pep-0257/)
- [Google Python Style Guide — Docstrings](https://google.github.io/styleguide/pyguide.html#38-comments-and-docstrings)
- [NumPy Docstring Guide](https://numpydoc.readthedocs.io/en/latest/format.html)
- [Sphinx reStructuredText Primer](https://www.sphinx-doc.org/en/master/usage/restructuredtext/basics.html)
- [Python `typing` Module](https://docs.python.org/3/library/typing.html)