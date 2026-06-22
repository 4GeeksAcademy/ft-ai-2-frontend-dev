# Demo Login Form Application

# Tech stack
- Vite
- Typescript
- React
    - Separate `pages/` and `components/` subfolders in `src/`
    - React Router
    - Zustand for global application state
- Tailwind CSS for styling, using BEM CSS classes with `@apply` for the tailwind classes.
- Fake login backend using `https://httpbin.io/`

# Data Models

```ts
interface IUser {
    username: string;
    password: string;
    email: string;
}
```

```ts
interface IDataStore {
    token: string | null;
    token_expiry: Date | null;
}
```

# App directory structure

- `/`: Hello World homepage with login form
- `/secret`: page that displays info from the `User` object, and redirects you back to `/` if you are not logged in.
