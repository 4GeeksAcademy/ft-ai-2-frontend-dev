"""LiteLLM integration — single function to send a prompt and get a response."""

from __future__ import annotations

from litellm import completion

from agent_loop.config import Config


def ask_llm(prompt: str, config: Config) -> str:
    """Send a prompt to the LLM and return the response text.

    Args:
        prompt: The user's message to send.
        config: Application configuration with API key, model, and base URL.

    Returns:
        The LLM's response as a string.

    Raises:
        litellm.exceptions.LiteLLMException: On API / network / auth errors.
    """
    response = completion(
        model=config.model,
        messages=[{"role": "user", "content": prompt}],
        api_key=config.api_key,
        base_url=config.base_url,
        timeout=60,
    )

    choice = response.choices[0]
    content = choice.message.content
    return content if content is not None else ""
