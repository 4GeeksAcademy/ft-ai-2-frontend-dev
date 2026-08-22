interface ButtonProps {
  children: React.ReactNode;
  type?: "button" | "submit";
  variant?: "primary" | "secondary";
  loading?: boolean;
  /** Text shown when `loading` is true (e.g. "Saving…"). */
  loadingLabel?: string;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}

export function Button({
  children,
  type = "button",
  variant = "primary",
  loading = false,
  loadingLabel,
  disabled = false,
  onClick,
  className = "",
}: ButtonProps) {
  const base =
    "rounded-lg px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50";

  const styles = {
    primary:
      "bg-white text-zinc-900 hover:bg-zinc-200",
    secondary:
      "border border-zinc-700 text-zinc-300 hover:bg-zinc-800",
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${base} ${styles[variant]} ${className}`}
    >
      {loading && loadingLabel ? loadingLabel : children}
    </button>
  );
}