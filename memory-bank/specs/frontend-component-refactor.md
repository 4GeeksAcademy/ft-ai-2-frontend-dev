# Frontend Component Refactor Plan

> **Goal:** Extract repeated UI elements and their variations into reusable components,
> reducing duplicate code and simplifying page-level components.

## 1. Repeated Patterns Identified

### 1.1 Card Container
Every form page wraps its content in an identical card shell:

```tsx
<div className="w-full max-w-sm rounded-xl border border-zinc-800 bg-zinc-900 p-8 shadow-sm">
```

**Occurrences:** Login, Register, Reset Password, User Profile (pages that use it)

### 1.2 Form Input Fields
The same input structure appears ~15 times across the codebase:

```tsx
<div>
  <label htmlFor="..." className="mb-1 block text-sm font-medium text-zinc-300">
    Label text
  </label>
  <input
    id="..."
    name="..."
    type="..."
    required
    autoComplete="..."
    className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
  />
</div>
```

**Variations:**
- With hint text below the input (`<p className="mt-1 text-xs text-zinc-400">...</p>`)
- With a link below the input (e.g. "Forgot your password?" on login)
- With `aria-describedby` pointing to an error element
- With `defaultValue` for edit forms (pre-populated)

### 1.3 Primary Button
The primary submit/action button is identical across all pages:

```tsx
<button
  type="submit"
  disabled={loading}
  className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-zinc-900 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
>
  {loading ? "Loading…" : "Label"}
</button>
```

**Occurrences:** Login, Register, Reset Password, User Profile (edit mode)

### 1.4 Secondary Button
Used for cancel, logout, and secondary actions:

```tsx
<button
  type="button"
  onClick={...}
  className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 transition hover:bg-zinc-800"
>
  Label
</button>
```

**Occurrences:** User Profile (cancel), Homepage (logout), Navbar (logout)

### 1.5 Error Alert
Error display pattern is duplicated across all form pages:

```tsx
{error && (
  <p id="..." role="alert" aria-live="polite" className="text-sm text-red-400">
    {error}
  </p>
)}
```

### 1.6 Success Alert
Success messages appear in two variations:
- **Banner style** (login page's reset-success banner): `rounded-lg border border-green-800 bg-green-950 px-4 py-3 text-sm text-green-400`
- **Message style** (profile page): `rounded-lg bg-green-900/30 px-4 py-2 text-sm text-green-400`

### 1.7 Auth Link (bottom of form)
Every auth form has a navigation link at the bottom:

```tsx
<p className="mt-6 text-center text-sm text-zinc-400">
  Don&apos;t have an account?{" "}
  <Link href="/register" className="font-medium text-white underline underline-offset-2 hover:text-zinc-300">
    Register
  </Link>
</p>
```

**Occurrences:** Login, Register, Reset Password

### 1.8 Page Layout Wrapper
Every page wraps its content in:

```tsx
<div className="flex flex-1 flex-col items-center justify-center">
```

### 1.9 Auth Redirect Pattern
Login/register/profile pages share a redirect guard:

```tsx
useEffect(() => {
  if (isAuthenticated) {
    router.replace("/user_profile");
  }
}, [isAuthenticated, router]);

if (isAuthenticated) {
  return null;
}
```

### 1.10 Loading Button State
Every submit button has a loading state with a trailing ellipsis ("Logging in…", "Creating account…", etc.).

### 1.11 Avatar Display
The user profile page renders an avatar with:

```tsx
<Image
  src={profileUser.gravatar_url}
  alt={`${profileUser.display_name}'s avatar`}
  className="h-20 w-20 rounded-full"
  width={80}
  height={80}
/>
```

---

## 2. Proposed Component Hierarchy

```
src/components/
├── ui/                          # Primitive, reusable UI components
│   ├── Card.tsx                 # Card container (used by all form pages)
│   ├── Input.tsx                # Form input with label, hint, error support
│   ├── Button.tsx               # Primary + secondary button variants
│   ├── Alert.tsx                # Error / success / info alert messages
│   └── Avatar.tsx               # Gravatar avatar display
│
├── layout/
│   ├── PageCenter.tsx           # Centered page layout wrapper
│   └── AuthLink.tsx             # "Don't have an account? Register" link block
│
├── forms/
│   ├── AuthForm.tsx             # Shared auth form card layout (Card + header)
│   ├── LoginForm.tsx            # Login-specific form (uses shared pieces)
│   ├── RegisterForm.tsx         # Registration-specific form
│   └── ResetPasswordForm.tsx    # Password reset form (two states)
│
└── profile/
    └── ProfileForm.tsx          # Edit profile form (display + edit mode)
```

---

## 3. Component Specifications

### 3.1 `ui/Card.tsx`

**Purpose:** Reusable card container with consistent styling.

```tsx
// Props
interface CardProps {
  children: React.ReactNode;
  className?: string;       // Allow callers to override width, etc.
}
```

**Usage change:**
- Before: Each page has `<div className="w-full max-w-sm rounded-xl border border-zinc-800 bg-zinc-900 p-8 shadow-sm">`
- After: `<Card>...</Card>` or `<Card className="max-w-md">...</Card>`

### 3.2 `ui/Input.tsx`

**Purpose:** Single source of truth for form input styling with label, hint, error wiring.

```tsx
interface InputProps {
  id: string;
  name: string;
  label: string;
  type?: string;              // default "text"
  required?: boolean;
  autoComplete?: string;
  defaultValue?: string;      // for edit forms
  minLength?: number;
  maxLength?: number;
  hint?: string;              // small text below the input
  link?: {                    // e.g. "Forgot your password?"
    label: string;
    href: string;
  };
  errorId?: string;           // wires aria-describedby to an error element
}
```

**Handles:**
- Label + input with consistent styling
- Optional hint text below the input
- Optional link beside the hint (e.g. "Forgot your password?")
- `aria-describedby` wiring when errorId is provided
- `defaultValue` for edit forms
- Uncontrolled input (no `value`/`onChange`)

### 3.3 `ui/Button.tsx`

**Purpose:** Primary and secondary button variants with loading state.

```tsx
interface ButtonProps {
  children: React.ReactNode;
  type?: "button" | "submit";
  variant?: "primary" | "secondary";   // default "primary"
  loading?: boolean;
  loadingLabel?: string;               // e.g. "Saving…"
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}
```

**Handles:**
- Primary: white bg, dark text (`bg-white px-4 py-2 text-sm font-medium text-zinc-900 transition hover:bg-zinc-200`)
- Secondary: bordered, lighter text (`rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 transition hover:bg-zinc-800`)
- Loading state: disabled + loading label
- `disabled:cursor-not-allowed disabled:opacity-50` in both variants

### 3.4 `ui/Alert.tsx`

**Purpose:** Error, success, and info messages with consistent styling.

```tsx
interface AlertProps {
  variant: "error" | "success" | "info";
  children: React.ReactNode;
  id?: string;               // for aria-describedby / error linking
  role?: "alert" | "status";
  ariaLive?: "polite" | "assertive";
}
```

**Variants:**
- `error`: `text-sm text-red-400` (no background, just red text)
- `success` (banner): `rounded-lg border border-green-800 bg-green-950 px-4 py-3 text-sm text-green-400`
- `success` (inline): `rounded-lg bg-green-900/30 px-4 py-2 text-sm text-green-400`
- `info`: `rounded-lg border border-blue-800 bg-blue-950 px-4 py-3 text-sm text-blue-400`

### 3.5 `ui/Avatar.tsx`

**Purpose:** Gravatar avatar display with consistent sizing.

```tsx
interface AvatarProps {
  src: string;
  alt: string;
  size?: number;              // default 80 (h-20 w-20)
}
```

### 3.6 `layout/PageCenter.tsx`

**Purpose:** Centered page layout wrapper.

```tsx
interface PageCenterProps {
  children: React.ReactNode;
}
```

### 3.7 `layout/AuthLink.tsx`

**Purpose:** Bottom-of-form navigation link.

```tsx
interface AuthLinkProps {
  label: string;              // "Don't have an account?"
  linkLabel: string;          // "Register"
  href: string;
}
```

### 3.8 `forms/AuthForm.tsx`

**Purpose:** Shared layout for auth form cards (title + card + children).

```tsx
interface AuthFormProps {
  title: string;
  children: React.ReactNode;
}
```

Renders:
```tsx
<PageCenter>
  <Card>
    <h1 className="mb-6 text-2xl font-bold tracking-tight text-white">{title}</h1>
    {children}
  </Card>
</PageCenter>
```

### 3.9 `forms/LoginForm.tsx` — Refactored

```tsx
"use client";
// Uses: AuthForm, Input, Button, Alert, AuthLink, useAuth
// Handles: redirect guard, form submission, error display, reset=success banner
```

Becomes much simpler — the card, inputs, buttons, alerts, and auth link are all
replaced by component calls.

### 3.10 `forms/RegisterForm.tsx` — Refactored

Same pattern as LoginForm.

### 3.11 `forms/ResetPasswordForm.tsx` — Refactored

Same pattern, with the two-state logic (email form vs password reset form).

### 3.12 `profile/ProfileForm.tsx` — Refactored

Handles display mode, edit mode, avatar, and save/cancel actions.

---

## 4. Page-Level Changes

After extracting components, the page files become thin wrappers:

```tsx
// login/page.tsx (after refactor)
export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
```

The actual form logic lives in `components/forms/LoginForm.tsx`.

---

## 5. Migration Strategy

### Phase 1: Create UI primitives (no behavior change)
1. Create `src/components/ui/Card.tsx`
2. Create `src/components/ui/Input.tsx`
3. Create `src/components/ui/Button.tsx`
4. Create `src/components/ui/Alert.tsx`
5. Create `src/components/ui/Avatar.tsx`
6. Create `src/components/layout/PageCenter.tsx`
7. Create `src/components/layout/AuthLink.tsx`

### Phase 2: Create form components (one by one)
8. Create `src/components/forms/AuthForm.tsx`
9. Refactor `login/page.tsx` → extract `LoginForm.tsx` into `components/forms/`
10. Refactor `register/page.tsx` → extract `RegisterForm.tsx` into `components/forms/`
11. Refactor `reset-password/page.tsx` → extract `ResetPasswordForm.tsx` into `components/forms/`
12. Refactor `user_profile/page.tsx` → extract `ProfileForm.tsx` into `components/profile/`

### Phase 3: Cleanup
13. Remove unused imports from page files
14. Verify all pages work with `pnpm run dev`
15. Update `product-context.md` and `conventions.md` to reference new components

---

## 6. Code Duplication Metrics

| Element | Current Count | After Refactor | Reduction |
|---------|:------------:|:--------------:|:---------:|
| Card wrappers | 5 | 0 (imported) | 100% |
| Input+label blocks | 15 | 0 (imported) | 100% |
| Primary buttons | 6 | 0 (imported) | 100% |
| Secondary buttons | 3 | 0 (imported) | 100% |
| Error alerts | 5 | 0 (imported) | 100% |
| Success alerts | 2 | 0 (imported) | 100% |
| Auth link blocks | 3 | 0 (imported) | 100% |
| Page center wrappers | 5 | 0 (imported) | 100% |
| Auth redirect guard | 3 | 2 (kept in form) | ~33% |
| Loading button states | 6 | 0 (Button handles) | 100% |

---

## 7. Design Principles Preserved

- **No CSS-in-JS:** All styling stays in Tailwind utility classes
- **No CSS modules or `@apply`:** Utility-first remains the rule
- **Uncontrolled inputs:** All inputs remain uncontrolled (`name` + `FormData`)
- **No `onSubmit` / `FormEvent`:** `form action={handler}` pattern preserved
- **Dark theme only:** No `dark:` variants introduced
- **Accessibility:** `aria-describedby`, `role="alert"`, `aria-live` preserved
- **TypeScript strict mode:** All new components have typed props interfaces