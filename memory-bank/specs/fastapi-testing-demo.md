# FastAPI Testing Demo — Spec

**Author:** AI Agent
**Date:** 2026-08-14
**Status:** Draft
**Version:** 1.0

---

## 1. Overview

### 1.1 Executive Summary

**What:** A minimal FastAPI application + its test suite demonstrating Python
unit testing concepts with `unittest`. The app itself is intentionally simple
(fewer than 5 functions) so students focus on testing patterns, not the
application logic.

**Why:** Students need a low-cognitive-load example to learn testing
fundamentals — test structure, assertions, fixtures, mocking, and edge-case
coverage — before applying them to real projects.

**Who:** Students who have completed basic Python and FastAPI modules and are
now learning automated testing.

**Prerequisites:** Python 3.12+, `uv` installed.

---

### 1.2 Learning Objectives

By the end of this demo, students should be able to:

1. Structure a test file using pytest (plain `def test_*` functions)
2. Write assertions (`assert`, `pytest.raises`, etc.)
3. Use `pytest.fixture` for reusable test setup
4. Mock external dependencies with `unittest.mock.patch`
5. Test edge cases (empty input, boundary values, invalid types)
6. Test error / sad paths
7. Run tests with `uv run pytest` and interpret results
8. Distinguish passing vs. intentionally failing tests

---

## 2. Application Design

### 2.1 Scope

The application is a **mini calculator** with a few pure business-logic
functions. No database, no HTTP server — just functions that take inputs and
return outputs. This keeps the focus entirely on testing.

| Aspect | Decision | Rationale |
|--------|----------|-----------|
| Framework | Pure Python functions | No server setup; tests run instantly |
| Storage | None (in-memory only) | No mocking complexity for beginners |
| External deps | None (stdlib only for business logic) | Zero friction for students |
| Test framework | `pytest` (via `pyproject.toml` dev dependency) | Clean `assert` syntax, `pytest.raises`, built-in fixtures, `-k` filtering |

### 2.2 Application — Business Logic

The calculator provides these functions in `app/calculator.py`:

| Function | Signature | Description |
|----------|-----------|-------------|
| `add(a, b)` | `(int, int) -> int` | Returns `a + b` |
| `divide(a, b)` | `(int, int) -> float` | Returns `a / b`; raises `ValueError` on zero |
| `is_even(n)` | `(int) -> bool` | Returns `True` if `n` is even |
| `factorial(n)` | `(int) -> int` | Returns `n!`; raises `ValueError` on negative |
| `process_data(items)` | `(list) -> dict` | Returns `{"count": ..., "total": ..., "average": ...}` |

> **Why these functions?** Each demonstrates a different testing challenge:
> - `add` — simple happy path, basic assertion
> - `divide` — error path (division by zero)
> - `is_even` — boundary values (0, negative numbers)
> - `factorial` — edge cases (0!, negative input error)
> - `process_data` — list processing, edge case of empty list

### 2.3 Project Structure

```
fastapi/
├── app/
│   ├── __init__.py
│   ├── calculator.py       ← Business logic under test
│   └── config.py           ← Simulated external config (for mocking demo)
├── tests/
│   ├── __init__.py
│   ├── test_calculator.py  ← Main test file with passing & failing tests
│   └── test_with_mocks.py  ← Demonstrates mocking patterns
├── pyproject.toml
└── uv.lock
```

---

## 3. Test Design

### 3.1 Test Categories

| Category | What it covers | Example |
|----------|---------------|---------|
| **Happy path** | Normal expected usage | `add(2, 3) == 5` |
| **Edge cases** | Boundary values, special inputs | `factorial(0) == 1`, `is_even(0)` |
| **Error paths** | Invalid inputs, raised exceptions | `divide(1, 0)` raises `ValueError` |
| **Mocking** | Substituting external dependencies | Mock `config.get_setting()` |
| **Fixtures** | Shared setup/teardown | `pytest.fixture` for mock setup |

### 3.2 Passing Tests (intentional) — 20 total

These tests should pass, demonstrating correct pytest style:

```python
def test_add_positive_numbers() -> None:
    assert calculator.add(2, 3) == 5


def test_add_negative_numbers() -> None:
    assert calculator.add(-1, -1) == -2


def test_divide_normal() -> None:
    assert calculator.divide(10, 2) == 5.0


def test_is_even_true() -> None:
    assert calculator.is_even(4)


def test_is_even_false() -> None:
    assert not calculator.is_even(7)


def test_is_even_zero() -> None:
    """Zero is even — boundary test."""
    assert calculator.is_even(0)


def test_factorial_zero() -> None:
    """0! = 1 — factorial edge case."""
    assert calculator.factorial(0) == 1


def test_factorial_positive() -> None:
    assert calculator.factorial(5) == 120


def test_process_data_normal() -> None:
    result = calculator.process_data([1, 2, 3])
    assert result["count"] == 3
    assert result["total"] == 6
    assert result["average"] == 2.0
```

### 3.3 Failing Tests (intentional) — 3 total (calculator)

These tests demonstrate **common mistakes** — students see the failure output
and learn to interpret it:

| Test | Mistake Demonstrated | Expected Failure |
|------|---------------------|------------------|
| `test_add_incorrect_assertion` | Wrong expected value | `5 + 3 != 9` — assertion error |
| `test_is_even_large_no_assert` | Missing assertion entirely | Test passes but doesn't verify anything (subtle!) |
| `test_factorial_negative_no_error` | Not using `pytest.raises` | `ValueError` propagates as an ERROR, not a failure |

```python
def test_add_incorrect_assertion() -> None:
    """FAILS: Expected value is wrong (5 + 3 != 9)."""
    assert calculator.add(5, 3) == 9


def test_is_even_large_no_assert() -> None:
    """FAILS (well, passes trivially — but doesn't test anything).

    The test never asserts on the result — it just computes.
    A student might see this pass and miss that the assertion is missing.
    """
    calculator.is_even(10**20)  # No assert!


def test_factorial_negative_no_error() -> None:
    """FAILS: expects a result but factorial(-1) raises ValueError.

    The test doesn't use pytest.raises, so the exception propagates as
    an ERROR rather than a clean FAILURE.
    """
    result = calculator.factorial(-1)
    assert result is None  # Never reached
```

### 3.4 Mocking Demonstration — 6 passing + 2 failing (mock tests)

```python
from unittest.mock import patch

import pytest

from app import config


@pytest.fixture
def mock_get_setting():
    """Fixture that patches config.get_setting."""
    with patch("app.config.get_setting") as mock:
        yield mock


@patch("app.config.get_setting")
def test_mock_return_value(mock_get_setting) -> None:
    """Replace get_setting with a mock that returns a fixed value."""
    mock_get_setting.return_value = "test_mode"
    result = config.get_setting("mode")
    assert result == "test_mode"
    mock_get_setting.assert_called_once_with("mode")
```

Two approaches are demonstrated:
1. **`@patch` decorator** — directly on each test function
2. **`pytest.fixture`** — reusable mock setup via `mock_get_setting` fixture

Failing mock tests (2 total):

```python
@patch("app.config.get_setting")
def test_mock_assert_not_called_incorrectly(mock_get_setting) -> None:
    """FAILS: mock was called but test asserts it wasn't."""
    config.get_setting("mode")
    mock_get_setting.assert_not_called()  # Wrong! It was called.


@patch("app.config.get_setting")
def test_mock_wrong_expected_arg(mock_get_setting) -> None:
    """FAILS: mock was called with 'mode' but test expects 'timeout'."""
    config.get_setting("mode")
    mock_get_setting.assert_called_once_with("timeout")  # Wrong argument!
```

---

## 4. Test Runner & Output

### 4.1 Commands

```bash
cd fastapi
uv run pytest              # Run all tests
uv run pytest -v           # Verbose — see each test name pass/fail
uv run pytest -k "fail"    # Run only intentionally failing tests
uv run pytest --tb=short   # Shorter traceback for readability
```

### 4.2 Expected Output (abbreviated)

```
$ uv run pytest -v
============================= test session starts ==============================
collected 30 items

tests/test_calculator.py::test_add_positive_numbers PASSED
tests/test_calculator.py::test_add_negative_numbers PASSED
tests/test_calculator.py::test_divide_normal PASSED
...
tests/test_calculator.py::test_add_incorrect_assertion FAILED
tests/test_calculator.py::test_factorial_negative_no_error FAILED
...
tests/test_with_mocks.py::test_mock_with_fixture PASSED
...
tests/test_with_mocks.py::test_mock_assert_not_called_incorrectly FAILED
tests/test_with_mocks.py::test_mock_wrong_expected_arg FAILED

=================== 26 passed, 4 failed in 0.21s ==============================
```

### 4.3 Student Takeaways

- **Passing tests** (green) = the function behaves as expected.
- **Failing tests** (red) = the test reveals a bug or a wrong assumption.
- **Failure output** shows the expected vs. actual value, the line number, and
  a traceback — teaching students to read test output.

---

## 5. Implementation Checklist

| # | Task | Details |
|---|------|---------|
| 1 | Create `fastapi/` directory | Root project folder |
| 2 | Create `app/calculator.py` | Implement all 5 business-logic functions |
| 3 | Create `app/config.py` | Simulated config (for mocking demo) |
| 4 | Create `pyproject.toml` | Minimal config with `[dependency-groups] dev = ["pytest"]` |
| 5 | `uv add pytest --dev` | Add pytest as dev dependency |
| 6 | Create `tests/test_calculator.py` | 17 passing + 3 intentionally failing tests (pytest style) |
| 7 | Create `tests/test_with_mocks.py` | 6 passing (including fixture demo) + 2 intentionally failing mock tests |
| 8 | Run full suite | Verify 26 pass, 4 fail |
| 9 | Run subset `-k fail` | Verify failing tests run |
| 10 | Run mocks only `-k mock` | Verify mock tests run |

---

## 6. Future Considerations (Out of Scope)

- Testing FastAPI endpoints (HTTP layer) — not needed for this business-logic demo
- CI/CD integration — would distract from core testing concepts
- Coverage reporting — could be a follow-up exercise
- Property-based testing (Hypothesis) — too advanced for this intro