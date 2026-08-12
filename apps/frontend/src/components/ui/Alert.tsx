interface AlertProps {
  variant: "error" | "success" | "info";
  children: React.ReactNode;
  id?: string;
  role?: "alert" | "status";
  ariaLive?: "polite" | "assertive";
}

export function Alert({
  variant,
  children,
  id,
  role = variant === "error" ? "alert" : "status",
  ariaLive = "polite",
}: AlertProps) {
  const styles = {
    error: "text-sm text-red-400",
    success:
      "rounded-lg border border-green-800 bg-green-950 px-4 py-3 text-sm text-green-400",
    info: "rounded-lg border border-blue-800 bg-blue-950 px-4 py-3 text-sm text-blue-400",
  };

  return (
    <p id={id} role={role} aria-live={ariaLive} className={styles[variant]}>
      {children}
    </p>
  );
}