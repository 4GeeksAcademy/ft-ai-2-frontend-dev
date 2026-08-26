"""Seed demo users, posts, and a follow relationship.

Usage (API must be running):
    uv run --project brevity-api --with httpx python scripts/seed.py

Env:
    API_URL  (default http://localhost:8000)
"""

from __future__ import annotations

import os
import sys

import httpx

API_URL = os.getenv("API_URL", "http://localhost:8000").rstrip("/")

USERS = [
    {
        "email": "alice@example.com",
        "username": "alice",
        "password": "password123",
        "display_name": "Alice",
        "bio": "Says less, means more.",
        # Session 1 smoke tests may have created these with hunter2.
        "legacy_passwords": ["hunter2"],
    },
    {
        "email": "bob@example.com",
        "username": "bob",
        "password": "password123",
        "display_name": "Bob",
        "bio": "Follower of brevity.",
        "legacy_passwords": ["hunter2"],
    },
]


def register_or_login(client: httpx.Client, user: dict) -> tuple[str, str]:
    candidates = [user["password"], *user.get("legacy_passwords", [])]
    for password in candidates:
        login = client.post(
            "/auth/login",
            json={"email": user["email"], "password": password},
        )
        if login.status_code == 200:
            if password != user["password"]:
                print(
                    f"  logged in @{user['username']} with legacy password"
                )
            else:
                print(f"  logged in @{user['username']}")
            return login.json()["token"], password

    register = client.post(
        "/auth/register",
        json={
            "email": user["email"],
            "username": user["username"],
            "password": user["password"],
        },
    )
    if register.status_code == 201:
        print(f"  registered @{user['username']}")
        return register.json()["token"], user["password"]

    raise RuntimeError(
        f"could not seed @{user['username']}: "
        f"register={register.status_code} {register.text}. "
        "If the user exists with an unknown password, reset the DB volume."
    )


def ensure_profile(client: httpx.Client, token: str, user: dict) -> None:
    response = client.patch(
        "/users/me",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "display_name": user["display_name"],
            "bio": user["bio"],
        },
    )
    response.raise_for_status()


def ensure_post(client: httpx.Client, token: str, content: str) -> None:
    headers = {"Authorization": f"Bearer {token}"}
    me = client.get("/users/me", headers=headers)
    me.raise_for_status()
    username = me.json()["username"]
    mine = client.get(f"/users/{username}/posts", headers=headers)
    mine.raise_for_status()
    if any(post["content"] == content for post in mine.json()):
        print(f"  skip post {content!r} (exists)")
        return

    created = client.post("/posts", headers=headers, json={"content": content})
    created.raise_for_status()
    print(f"  posted {content!r}")


def ensure_follow(client: httpx.Client, token: str, username: str) -> None:
    response = client.post(
        f"/social/follow/{username}",
        headers={"Authorization": f"Bearer {token}"},
    )
    if response.status_code in (201, 409):
        print(f"  follow @{username}: {response.status_code}")
        return
    raise RuntimeError(f"follow failed: {response.status_code} {response.text}")


def main() -> int:
    print(f"Seeding against {API_URL}")
    with httpx.Client(base_url=API_URL, timeout=30.0) as client:
        health = client.get("/health")
        health.raise_for_status()
        if health.json().get("database") == "error":
            print("API reports database error", file=sys.stderr)
            return 1

        tokens: dict[str, str] = {}
        passwords: dict[str, str] = {}
        for user in USERS:
            token, password = register_or_login(client, user)
            ensure_profile(client, token, user)
            tokens[user["username"]] = token
            passwords[user["username"]] = password

        ensure_post(client, tokens["bob"], "hello")
        ensure_post(client, tokens["bob"], "wit")
        ensure_post(client, tokens["alice"], "brevity")
        ensure_post(client, tokens["alice"], "@bob")
        ensure_follow(client, tokens["alice"], "bob")

    print("Seed complete.")
    print(
        f"  alice@example.com / {passwords['alice']} (follows bob)"
    )
    print(f"  bob@example.com   / {passwords['bob']}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
