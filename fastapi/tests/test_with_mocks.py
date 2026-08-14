"""Tests demonstrating mocking with pytest + unittest.mock."""

from __future__ import annotations

from unittest.mock import patch

import pytest

from app import config


@pytest.fixture
def mock_get_setting():
    """Fixture that patches config.get_setting."""
    with patch("app.config.get_setting") as mock:
        yield mock


# ── Passing mock tests ───────────────────────────────────────────────


@patch("app.config.get_setting")
def test_mock_return_value(mock_get_setting) -> None:
    """Replace get_setting with a mock that returns a fixed value."""
    mock_get_setting.return_value = "test_mode"
    result = config.get_setting("mode")
    assert result == "test_mode"


@patch("app.config.get_setting")
def test_mock_side_effect_returns(mock_get_setting) -> None:
    """Mock returns different values on successive calls."""
    mock_get_setting.side_effect = ["first_call", "second_call"]
    assert config.get_setting("key1") == "first_call"
    assert config.get_setting("key2") == "second_call"


@patch("app.config.get_setting")
def test_mock_assert_called_with(mock_get_setting) -> None:
    """Verify the mock was called with the expected arguments."""
    config.get_setting("mode")
    mock_get_setting.assert_called_once_with("mode")


@patch("app.config.get_setting")
def test_mock_assert_multiple_calls(mock_get_setting) -> None:
    """Verify multiple calls with assert_has_calls."""
    from unittest.mock import call

    config.get_setting("mode")
    config.get_setting("timeout")
    expected_calls = [call("mode"), call("timeout")]
    mock_get_setting.assert_has_calls(expected_calls)


@patch("app.config.get_setting")
def test_mock_side_effect_exception(mock_get_setting) -> None:
    """Simulate a config failure to test error handling."""
    mock_get_setting.side_effect = RuntimeError("DB not reachable")
    with pytest.raises(RuntimeError):
        config.get_setting("database_url")


# ── Fixture-based alternative (for demonstration) ────────────────────


def test_mock_with_fixture(mock_get_setting) -> None:
    """Same as test_mock_return_value, but using @pytest.fixture."""
    mock_get_setting.return_value = "test_mode"
    result = config.get_setting("mode")
    assert result == "test_mode"


# ═══════════════════════════════════════════════════════════════════════
# Intentionally failing mock tests
# ═══════════════════════════════════════════════════════════════════════


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