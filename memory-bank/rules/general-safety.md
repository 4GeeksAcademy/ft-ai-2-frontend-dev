# General Safety Rules

## Core Principles

1. **Never commit secrets.** API keys, tokens, passwords, connection strings, and
   other credentials must never be hard-coded. Use environment variables or a
   `.env.local` file (which is in `.gitignore`).

2. **Validate all inputs.** Every external input — URL parameters, request bodies,
   form submissions, search queries — must be validated and sanitized before use.
   Never trust user-supplied data.

3. **Fail safely.** When something goes wrong, fail in a way that does not expose
   internal state, stack traces, or implementation details to the client. Return
   generic error messages to users and log details server-side.

4. **Defense in depth.** Do not rely on a single safety mechanism. Combine input
   validation, output encoding, authentication checks, and type checking to create
   multiple layers of protection.

5. **Least privilege.** Code should only have access to the data and capabilities
   it absolutely needs to perform its function. Never expose more surface area
   than necessary.

6. **Prefer safe defaults.** When a choice exists between a safe and an unsafe
   configuration, always start with the safe one. Require explicit opt-in to
   relax a safety constraint.

7. **Never swallow errors silently.** Every caught exception must be logged or
   handled. Silent `except: pass` or empty `.catch()` blocks are forbidden
   unless accompanied by a documented justification.

8. **Keep dependencies current.** Regularly update dependencies to patch known
   vulnerabilities. Use `npm audit`, `pip-audit`, or `dependabot` to surface
   issues.

9. **Pin dependencies.** Specify exact versions (or tight ranges) for runtime
   dependencies to prevent unexpected breakage from upstream changes.

10. **Document safety decisions.** Any time a deliberate choice is made that
    affects security, data integrity, or reliability, record it in the
    `memory-bank/decisions/` directory.