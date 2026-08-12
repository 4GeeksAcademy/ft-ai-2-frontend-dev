import Link from "next/link";

interface InputProps {
  id: string;
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  defaultValue?: string;
  minLength?: number;
  maxLength?: number;
  /** Small hint text displayed below the input. */
  hint?: string;
  /** An optional link rendered beside the hint (e.g. "Forgot your password?"). */
  link?: {
    label: string;
    href: string;
  };
  /** Wires `aria-describedby` to an error element with this id. */
  errorId?: string;
}

export function Input({
  id,
  name,
  label,
  type = "text",
  required = false,
  autoComplete,
  defaultValue,
  minLength,
  maxLength,
  hint,
  link,
  errorId,
}: InputProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-zinc-300">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        defaultValue={defaultValue}
        minLength={minLength}
        maxLength={maxLength}
        aria-describedby={errorId}
        className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
      />
      {hint && !link && (
        <p className="mt-1 text-xs text-zinc-400">{hint}</p>
      )}
      {link && (
        <div className="mt-1 flex items-center justify-between">
          {hint && <p className="text-xs text-zinc-400">{hint}</p>}
          <Link
            href={link.href}
            className="ml-auto text-xs font-medium text-zinc-400 underline-offset-2 hover:text-white hover:underline"
          >
            {link.label}
          </Link>
        </div>
      )}
    </div>
  );
}