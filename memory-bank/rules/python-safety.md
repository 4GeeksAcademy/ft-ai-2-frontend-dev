# Python Safety Rules

Safety rules for developing Python code.  These rules complement the coding conventions and should be followed for all Python work in this project.

---

## 1. Environment & Secrets Safety

| Rule | Description |
|------|-------------|
| **R1.1** | Never hardcode secrets, API keys, tokens, passwords, or connection strings. Use environment variables via `os.environ` or a `.env` file loaded with `python-dotenv`. |
| **R1.2** | Always add `.env` to `.gitignore`. Never commit `.env` files to version control. |
| **R1.3** | Validate required environment variables at startup with a clear error message listing which variables are missing. |
| **R1.4** | Use a `.env.example` file with placeholder values to document required variables. |
| **R1.5** | Never log or print sensitive values (secrets, tokens, personal data). |

## 2. File I/O Safety

| Rule | Description |
|------|-------------|
| **R2.1** | Always use context managers (`with` statement) when opening files to guarantee proper cleanup. |
| **R2.2** | Specify the file encoding explicitly (`encoding="utf-8"`) when opening text files. |
| **R2.3** | Validate file paths before use. Do not blindly trust user-supplied paths — guard against path-traversal attacks using `os.path.realpath()` or `pathlib.Path.resolve()`. |
| **R2.4** | Use `pathlib.Path` over `os.path` for modern, cross-platform path handling. |
| **R2.5** | Handle `FileNotFoundError`, `PermissionError`, and `IsADirectoryError` explicitly. |
| **R2.6** | When writing to files, use atomic writes (write to a temp file, then rename) for critical data to avoid partial writes on crash. |

## 3. Import & Module Safety

| Rule | Description |
|------|-------------|
| **R3.1** | Place all imports at the top of the file, grouped in this order: standard library, third-party, local modules. Separate groups with a blank line. |
| **R3.2** | Prefer explicit imports (`from module import name`) over wildcard imports (`from module import *`). Never use wildcard imports in production code. |
| **R3.3** | Avoid circular imports by structuring modules hierarchically. Use type-checking-only imports (`TYPE_CHECKING`) when circular imports are unavoidable for type hints. |
| **R3.4** | Do not shadow standard-library module names (e.g., don't name a file `json.py`, `logging.py`, or `email.py`). |

## 4. Type Safety

| Rule | Description |
|------|-------------|
| **R4.1** | Add type annotations to all function signatures (parameters and return types). |
| **R4.2** | Use `Optional[T]` or `T | None` (Python 3.10+) for values that can be `None`. |
| **R4.3** | Use `Union[T, U]` or `T | U` (Python 3.10+) for values that can be one of multiple types. |
| **R4.4** | Prefer `dataclasses` or `TypedDict` over plain dictionaries for structured data. |
| **R4.5** | Run `pyright` or `mypy` in strict mode as part of CI. Do not ignore type errors with `# type: ignore` unless absolutely necessary and documented with a comment. |

## 5. Error & Exception Handling

| Rule | Description |
|------|-------------|
| **R5.1** | Catch specific exception types, not bare `except:` or `except Exception:`. |
| **R5.2** | When re-raising, use bare `raise` (not `raise e`) to preserve the original stack trace. |
| **R5.3** | Avoid using exceptions for control flow. Exceptions are for exceptional conditions. |
| **R5.4** | Always include a meaningful error message in `raise` statements and log the context that caused the error. |
| **R5.5** | Use `contextlib.suppress` for expected, ignorable failures instead of a blank `except: pass`. |

## 6. Subprocess & Shell Safety

| Rule | Description |
|------|-------------|
| **R6.1** | Prefer `subprocess.run()` with `shell=False` and pass arguments as a list. Never use `shell=True` unless absolutely necessary — and if you must, validate/escape all inputs. |
| **R6.2** | Set `text=True` and `capture_output=True` explicitly on `subprocess.run()` calls for clarity. |
| **R6.3** | Always set a `timeout` on subprocess calls to prevent hangs. |
| **R6.4** | Check the return code (`returncode`) or use `check=True` (but handle `CalledProcessError`). |

## 7. Dependency & Build Safety

| Rule | Description |
|------|-------------|
| **R7.1** | Pin dependency versions in `requirements.txt` or `pyproject.toml`. Use `>=` for minimum versions only when you know the API is stable. |
| **R7.2** | Regularly audit dependencies for known vulnerabilities (`pip-audit`, `safety`, or Dependabot). |
| **R7.3** | Declare all direct dependencies explicitly. Do not rely on transitive dependencies being available. |
| **R7.4** | Use virtual environments (venv, conda, or uv) for all projects. Never install packages system-wide. |

## 8. Concurrency & Threading Safety

| Rule | Description |
|------|-------------|
| **R8.1** | Use `threading.Lock` (or `RLock`) to protect shared mutable state in multi-threaded code. |
| **R8.2** | Prefer `asyncio` for I/O-bound concurrency. Prefer `multiprocessing` for CPU-bound work. |
| **R8.3** | Always use `async with` for async context managers and `async for` for async iterators. |
| **R8.4** | Never mix `asyncio` and blocking I/O without offloading to a thread pool (`loop.run_in_executor`). |

## 9. Logging Safety

| Rule | Description |
|------|-------------|
| **R9.1** | Use the `logging` module over `print()` for all production output. |
| **R9.2** | Do not log sensitive data. Sanitize or redact PII, tokens, and credentials before logging. |
| **R9.3** | Use lazy formatting (`logging.debug("User %s", user.id)`) instead of f-strings in log messages to avoid unnecessary computation. |
| **R9.4** | Configure logging at module level and respect log levels (DEBUG, INFO, WARNING, ERROR). |

## 10. Testing Safety

| Rule | Description |
|------|-------------|
| **R10.1** | Write tests for all public functions and methods. Aim for at least 80% code coverage on new code. |
| **R10.2** | Use `pytest` over `unittest` for test discovery and execution. |
| **R10.3** | Never write tests that depend on external services without mocking or using test fixtures. |
| **R10.4** | Use fixtures (`pytest.fixture`) for shared setup; avoid `conftest.py` side effects. |
| **R10.5** | Mark slow or integration tests with `@pytest.mark.slow` and `@pytest.mark.integration` so they can be excluded from quick runs. |

## 11. General Code Safety

| Rule | Description |
|------|-------------|
| **R11.1** | Do not use `eval()`, `exec()`, or `compile()` with untrusted input. |
| **R11.2** | Do not use `pickle` with untrusted data. Prefer `json` or other safe serialization formats. |
| **R11.3** | Use `assert` for debugging and testing only, not for production validation (assertions can be disabled with `-O`). |
| **R11.4** | Avoid mutable default arguments. Use `None` and initialize inside the function body. |
| **R11.5** | Always specify `**` as the second parameter in `__init__` subclasses when the parent's `__init__` signature might change (or use `*` to force keyword arguments). |
| **R11.6** | Close all resources (files, network connections, database sessions) — preferably via context managers. |