# Minimal Auth Frontend

This will be a minimal example of handling auth from the frontend using NextJS.

## Auth Flow

```
┌─────────────────┐       ┌──────────────────┐       ┌──────────┐
│  Next.js App    │       │  FastAPI Backend │       │  TinyDB  │
│  (App Router)   │ ◄────►│  (REST API)      │ ◄────►│  (JSON)  │
└─────────────────┘       └──────────────────┘       └──────────┘
        │                       │
        │  Store JWT            │  JWT signed with
        │  in memory only       │  HS256/RS256
        │  (no localStorage)    │
```

## Tech Stack

- NextJS 16+ (App Router, using TypeScript)
- TailwindCSS for styling
- fetch for requests

## App Routes

- `/` App homepage
    - `/login` Login page
    - `/register` Registration page
    - `/user_profile` User profile page (requires login)

### Homepage

Heading on page displays "Hello {username}!" if a user is logged in, otherwise it displays "Hello world".

### Login

Simple login page, redirects to `/user_profile` if the user is already logged in.

#### Fields

- email
- password

### Register

Simple registration page, redirects to `/user_profile` if the user is already logged in.

#### Fields

- email
- password
- display name

### User Profile

User profile page, redirects to `/login` if the user is not logged in.

#### Core Features

- Displays user profile data
- Lets users edit user profile

## Accessibility

- All form inputs have associated `<label>` elements
- Error messages are associated with inputs via `aria-describedby`
- Color alone is never used to convey state (supplement with text/icons)
- Loading states are announced to screen readers (aria-live regions)
- Keyboard navigation works for all interactive elements

## Not Included

- Token refresh flow
- Email verification
- Password reset
- OAuth
- Token persistence
