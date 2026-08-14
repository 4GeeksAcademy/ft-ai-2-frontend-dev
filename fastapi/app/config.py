"""Simulated external configuration — used for the mocking demonstration."""

from __future__ import annotations


def get_setting(name: str, default: str = "") -> str:
    """Return a configuration value.

    In a real app this might read from environment variables or a config file.
    For the demo it returns hard-coded values so students can practice mocking.
    """
    settings = {
        "mode": "production",
        "api_url": "https://api.example.com",
        "timeout": "30",
    }
    return settings.get(name, default)