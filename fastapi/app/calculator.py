"""Business logic functions for the calculator demo.

All functions are pure — no I/O, no side effects — making them ideal
for unit testing.
"""

from __future__ import annotations


def add(a: int, b: int) -> int:
    """Return the sum of a and b."""
    return a + b


def divide(a: int, b: int) -> float:
    """Return a divided by b.

    Raises ValueError if b is zero.
    """
    if b == 0:
        raise ValueError("Cannot divide by zero")
    return a / b


def is_even(n: int) -> bool:
    """Return True if n is even, False otherwise."""
    return n % 2 == 0


def factorial(n: int) -> int:
    """Return n! (n factorial).

    Raises ValueError if n is negative.
    """
    if n < 0:
        raise ValueError("Cannot compute factorial of a negative number")
    if n == 0:
        return 1
    result = 1
    for i in range(1, n + 1):
        result *= i
    return result


def process_data(items: list[int]) -> dict[str, float]:
    """Return summary statistics for a list of integers.

    Returns a dict with keys: count, total, average.
    For an empty list, count and total are 0, average is 0.0.
    """
    count = len(items)
    total = sum(items)
    average = total / count if count > 0 else 0.0
    return {"count": count, "total": total, "average": average}