"""Application configuration loaded from environment variables."""

from __future__ import annotations

import os
from dataclasses import dataclass

from dotenv import load_dotenv


@dataclass(frozen=True)
class Config:
    """Immutable configuration object for the agent loop."""

    api_key: str
    model: str
    base_url: str


def load_config() -> Config:
    """Load and validate configuration from environment variables / .env file.

    Returns:
        A populated Config instance.

    Raises:
        SystemExit: If required environment variables are missing.
    """
    load_dotenv()

    api_key = os.environ.get("LITELLM_API_KEY", "")
    model = os.environ.get(
        "LITELLM_MODEL",
        "litellm/downtown-miami/openrouter/deepseek/deepseek-v4-flash",
    )
    base_url = os.environ.get(
        "LITELLM_BASE_URL",
        "https://llm.4geeks.ai/v1",
    )

    missing: list[str] = []
    if not api_key:
        missing.append("LITELLM_API_KEY")

    if missing:
        msg = "\n  ".join(
            ["Missing required environment variable(s):", *missing])
        raise SystemExit(msg)

    return Config(api_key=api_key, model=model, base_url=base_url)
