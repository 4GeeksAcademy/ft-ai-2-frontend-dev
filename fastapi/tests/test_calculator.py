"""Tests for the calculator module — passing and intentionally failing."""

from __future__ import annotations

import pytest

from app import calculator


# ── add ──────────────────────────────────────────────────────────────


def test_add_positive_numbers() -> None:
    assert calculator.add(2, 3) == 5


def test_add_negative_numbers() -> None:
    assert calculator.add(-1, -1) == -2


def test_add_zero() -> None:
    assert calculator.add(0, 5) == 5


# ── divide ───────────────────────────────────────────────────────────


def test_divide_normal() -> None:
    assert calculator.divide(10, 2) == 5.0


def test_divide_float_result() -> None:
    assert calculator.divide(7, 2) == 3.5


def test_divide_by_zero_raises() -> None:
    with pytest.raises(ValueError):
        calculator.divide(1, 0)


# ── is_even ──────────────────────────────────────────────────────────


def test_is_even_true() -> None:
    assert calculator.is_even(4)


def test_is_even_false() -> None:
    assert not calculator.is_even(7)


def test_is_even_zero() -> None:
    """Zero is even — boundary test."""
    assert calculator.is_even(0)


def test_is_even_negative() -> None:
    """Negative even numbers should also return True."""
    assert calculator.is_even(-4)


def test_is_even_negative_odd() -> None:
    assert not calculator.is_even(-3)


# ── factorial ────────────────────────────────────────────────────────


def test_factorial_zero() -> None:
    """0! = 1 — edge case."""
    assert calculator.factorial(0) == 1


def test_factorial_one() -> None:
    assert calculator.factorial(1) == 1


def test_factorial_positive() -> None:
    assert calculator.factorial(5) == 120


def test_factorial_large() -> None:
    assert calculator.factorial(10) == 3_628_800


def test_factorial_negative_raises() -> None:
    """Negative input should raise ValueError."""
    with pytest.raises(ValueError):
        calculator.factorial(-1)


# ── process_data ─────────────────────────────────────────────────────


def test_process_data_normal() -> None:
    result = calculator.process_data([1, 2, 3])
    assert result["count"] == 3
    assert result["total"] == 6
    assert result["average"] == 2.0


def test_process_data_single_item() -> None:
    result = calculator.process_data([5])
    assert result["count"] == 1
    assert result["total"] == 5
    assert result["average"] == 5.0


def test_process_data_empty() -> None:
    """Empty list — edge case."""
    result = calculator.process_data([])
    assert result["count"] == 0
    assert result["total"] == 0
    assert result["average"] == 0.0


# ═══════════════════════════════════════════════════════════════════════
# Intentionally failing tests
# ═══════════════════════════════════════════════════════════════════════

def test_add_incorrect_assertion() -> None:
    """FAILS: 5 + 3 is 8, not 9."""
    assert calculator.add(5, 3) == 9


def test_is_even_large_no_assert() -> None:
    """FAILS (well, passes trivially — but doesn't test anything).

    The test never asserts on the result — it just computes and returns.
    A student might see this pass and think "great, it works", missing
    the fact that the assertion is missing.
    """
    calculator.is_even(10**20)  # No assert!


def test_factorial_negative_no_error() -> None:
    """FAILS: expects a result but factorial(-1) raises ValueError.

    The test doesn't use pytest.raises, so the exception propagates as
    an ERROR rather than a clean FAILURE — showing the difference
    between a test error and a test failure.
    """
    result = calculator.factorial(-1)
    assert result is None  # Never reached