import Link from "next/link";

interface AuthLinkProps {
  /** Text before the link, e.g. "Don't have an account?". Pass empty string for link-only. */
  label: string;
  linkLabel: string;
  href: string;
}

/**
 * Bottom-of-form navigation link, e.g.
 * "Don't have an account? [Register]"
 */
export function AuthLink({ label, linkLabel, href }: AuthLinkProps) {
  return (
    <p className="mt-6 text-center text-sm text-zinc-400">
      {label && <>{label} </>}
      <Link
        href={href}
        className="font-medium text-white underline underline-offset-2 hover:text-zinc-300"
      >
        {linkLabel}
      </Link>
    </p>
  );
}